import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin-service';
import { AuthService } from '../../services/auth-service';
import { ListingsService } from '../../services/listing-service';
import { TranslateModule } from '@ngx-translate/core';

type DashboardTab = 'PENDING' | 'APPROVED' | 'REJECTED';
type ApiStatus = 'pending' | 'approved' | 'rejected';

interface AdminListing {
  id: number;
  title: string;
  price: number;
  categoryName: string;
  userName: string;
  createdDate: string;
  displayImage: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  /* ================= VIEW STATE ================= */
  currentView: 'dashboard' | 'users' | 'reports' = 'dashboard';
  activeDashboardTab: DashboardTab = 'PENDING';
  selectedCategory = 'All';
  loading = false;
  userSearch = '';

  /* ================= DATA ================= */
  listings: AdminListing[] = [];
  users: any[] = [];
  reports: any[] = [];

  /* ================= PAGINATION ================= */
  limit = 10;
  listPage = 1;
  listTotalPages = 1;

  userPage = 1;
  userTotalPages = 1;

  reportPage = 1;
  reportTotalPages = 1;

  /* ================= COUNTS ================= */
  activeCount = 0;
  userCount = 0;
  pendingCount = 0;
  reportCount = 0;

  /* ================= USER PROFILE MODAL ================= */
  showUserModal = false;
  selectedUser: any = null;

  /* ================= TOAST ================= */
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  /* ================= REJECT MODAL ================= */
  showRejectModal = false;
  rejectReason = '';
  selectedListingId: number | null = null;

  /* ================= REVIEW MODAL (REVIEW COMPONENT UI) ================= */
  showReviewModal = false;
  reviewListing: any = null;
  reviewImages: string[] = [];
  reviewModel: any = {};
  reviewMainCatId!: number;
  reviewMainCatName = '';

  constructor(
    private adminService: AdminService,
    private listingService: ListingsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initialLoad();
  }

  /* ================= INITIAL LOAD ================= */
  async initialLoad() {
    this.loading = true;
    try {
      await Promise.all([
        this.loadListings(1),
        this.loadUsers(1),
        this.loadReports(1),
        this.updateCounts()
      ]);
    } finally {
      this.loading = false;
    }
  }

  /* ================= STATUS MAP ================= */
  private statusMap: Record<DashboardTab, ApiStatus> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  };

  /* ================= LISTINGS ================= */
  /* ================= LISTINGS ================= */
async loadListings(page: number = 1) {
  try {
    this.loading = true;

    // Fetch ALL listings at once (no pagination)
    const res: any = await this.adminService.getListings(
      this.statusMap[this.activeDashboardTab],
      1,
      99  // LARGE LIMIT to fetch everything
    );

    const raw = res?.data || [];

    const mapped: AdminListing[] = raw.map((item: any) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      categoryName: item.category?.name || 'Uncategorized',
      userName: item.user?.name || 'Unknown',
      createdDate: item.createdAt,
      displayImage: item.images?.[0]?.imageUrl || 'assets/images/no-image.png'
    }));
   
    // Apply category filter
    this.listings =
      this.selectedCategory === 'All'
        ? mapped
        : mapped.filter(i => i.categoryName === this.selectedCategory);
   
    const total = this.listings.length;
    this.listTotalPages = Math.max(1, Math.ceil(total / this.limit));
    this.listPage = Math.min(page, this.listTotalPages);
    const start = (this.listPage - 1) * this.limit;
    this.listings = this.listings.slice(start, start + this.limit);

    

  } catch (err: any) {
    alert(err?.error?.message || 'Failed to load listings.');
  } finally {
    this.loading = false;
  }
}


  switchStatus(tab: DashboardTab) {
    this.activeDashboardTab = tab;
    this.loadListings(1);
  }

  filterCategory(category: string) {
    this.selectedCategory = category;
    this.loadListings(1);
  }

  switchView(view: 'dashboard' | 'users' | 'reports') {
    this.currentView = view;
    view === 'dashboard'
      ? this.loadListings(1)
      : view === 'users'
      ? this.loadUsers(1)
      : this.loadReports(1);
  }

  /* ================= APPROVE / REJECT ================= */
 async approve(id: number) {
  try {
    await this.adminService.updateListingStatus(id, 'approved');
    this.triggerToast('Listing approved');
    this.loadListings(this.listPage);
    this.updateCounts();
  } catch (err: any) {
    alert(err?.error?.message || 'Failed to approve listing.');
  }
}

async submitReject() {
  if (!this.selectedListingId) return;

  try {
    await this.adminService.updateListingStatus(
      this.selectedListingId,
      'rejected',
      this.rejectReason
    );

    this.showRejectModal = false;
    this.triggerToast('Listing rejected');

    this.loadListings(this.listPage);
    this.updateCounts();

  } catch (err: any) {
    alert(err?.error?.message || 'Failed to reject listing.');
  }
}


  openReject(id: number) {
    this.selectedListingId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }



  /* ================= USER PROFILE ================= */
  viewProfile(user: any) {
    this.selectedUser = {
      name: user.name,
      email: user.email,
      phone: user.phone || user.mobile,
      avatar: user.avatarUrl || user.avatar,
      createdAt: user.createdAt
    };
    this.showUserModal = true;
  }

  /* ================= REVIEW MODAL (FULL REVIEW UI) ================= */
async openReview(listingId: number) {
  try {
    this.loading = true;
    const res: any = await this.adminService.getListingById(listingId);

    const listing = res.data;

    this.reviewListing = listing;
    this.reviewMainCatId = listing.category.id;
    this.reviewMainCatName = listing.category.name;

    this.reviewImages = listing.images?.map((i: any) => i.imageUrl) || [];
    this.reviewModel = this.mapApiListingToReviewModel(listing);

    this.showReviewModal = true;

  } catch (err: any) {
    alert(err?.error?.message || 'Failed to load listing details.');
  } finally {
    this.loading = false;
  }
}

  /* ================= API → REVIEW MODEL (MATCHES Review Component) ================= */
mapApiListingToReviewModel(listing: any) {

  // Auto-pick correct details object
  const details =
    listing.motorDetails ||
    listing.jobDetails ||
    listing.propertyDetails ||
    listing.classifiedDetails ||
    listing.electronicDetails ||
    listing.furnitureDetails ||
    {};

  return {
    /* BASIC */
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency || 'AED',
    isNegotiable: listing.isNegotiable,

    city: listing.city,
    country: listing.country || 'UAE',
    address: listing.address,

    /* CONTACT */
    contactName: listing.user?.name || '',
    contactPhone: listing.contactPhone || '',
    contactEmail: listing.contactEmail || '',
    contactWhatsapp: listing.contactWhatsapp || '',


    /* =========== MOTORS =========== */
    make: details.make || '',
    model: details.model || '',
    variant: details.variant || '',
    motor_type: details.motorType || '',

    year: details.year || null,
    kilometres: details.kilometres || null,
    transmission: details.transmission || '',
    fuelType: details.fuelType || '',
    bodyType: details.bodyType || '',
    color: details.color || '',
    serviceHistory: details.serviceHistory || false,


    /* =========== ELECTRONICS / CLASSIFIEDS / FURNITURE =========== */
    subCategory: details.subCategory || '',

    brand: details.brand || '',
    modelName: details.model || details.modelName || '',
    condition: details.condition || '',
    storage: details.storage || '',
    material: details.material || '',


    /* =========== PROPERTY =========== */
    listingType: details.listingType || '',
    propertyType: details.propertyType || '',
    areaSqft: details.areaSqft || details.areaSqft || null,
    bedrooms: details.bedrooms || 0,
    bathrooms: details.bathrooms || 0,
    halls: details.halls || 0,
    furnishing: details.furnishing || '',
    rentFrequency: details.rentFrequency || '',
    amenities: details.amenities || [],


    /* =========== JOBS =========== */
    jobTitle: details.jobTitle || '',
    companyName: details.companyName || '',
    industry: details.industry || '',
    jobType: details.jobType || '',
    workplaceType: details.workplaceType || '',

    experienceMin: details.experienceMin || null,
    experienceMax: details.experienceMax || null,

    salaryMin: details.salaryMin || null,
    salaryMax: details.salaryMax || null,
    salaryPeriod: details.salaryPeriod || 'Monthly',

    skillsRequired: details.skillsRequired || [],
    responsibilities: details.responsibilities || [],
    applicationEmail: details.applicationEmail || ''
  };
}



  /* ================= USERS ================= */
 /* ================= USERS ================= */
async loadUsers(page: number = 1) {
  try {
    this.loading = true;

    const res: any = await this.adminService.getUsers(1, 99);
    const raw = res?.data || [];

    this.userCount = raw.length;
    this.userTotalPages = Math.max(1, Math.ceil(raw.length / this.limit));
    this.userPage = Math.min(page, this.userTotalPages);

    const start = (this.userPage - 1) * this.limit;
    const end = start + this.limit;

    this.users = raw.slice(start, end);

  } catch (err: any) {
    alert(err?.error?.message || 'Failed to load users.');
  } finally {
    this.loading = false;
  }
}


  /* ================= REPORTS ================= */
  async loadReports(page: number) {
    this.reportPage = page;
    const res: any = await this.adminService.getReports('listing', page, this.limit);

    const reports = res?.data?.listingReports || [];
    this.reports = reports.map((r: any) => ({
      listingId: r.listingId,
      category: r.listing?.category?.name,
      postTitle: r.listing?.title,
      reason: r.reason,
      reporterName: r.reporter?.name
    }));

    this.reportCount = reports.length;
    this.reportTotalPages = Math.max(1, Math.ceil(this.reportCount / this.limit));
  }

 async remove(listingId: number) {
  try {
    await this.listingService.deleteListing(listingId);
    this.triggerToast('Listing removed');
    this.loadReports(this.reportPage);
    this.updateCounts();
  } catch (err: any) {
    alert(err?.error?.message || 'Failed to delete listing.');
  }
}


  /* ================= COUNTS ================= */
  async updateCounts() {
    const p = await this.adminService.getListings('pending', 1, 1);
    const a = await this.adminService.getListings('approved', 1, 1);
    const u = await this.adminService.getUsers(1, 1);
    const r = await this.adminService.getReports('listing', 1, 1);

    this.pendingCount = p.pagination?.total || 0;
    this.activeCount = a.pagination?.total || 0;
    this.userCount = u.pagination?.total || 0;
    this.reportCount = r?.data?.listingReports?.length || 0;
  }

  /* ================= HELPERS ================= */
  triggerToast(msg: string, type: 'success' | 'danger' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  getPagesArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
