import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin-service';
import { AuthService } from '../../services/auth-service';

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
  imports: [CommonModule, FormsModule],
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
  async loadListings(page: number) {
    this.listPage = page;

    const res: any = await this.adminService.getListings(
      this.statusMap[this.activeDashboardTab],
      page,
      this.limit
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

    this.listings =
      this.selectedCategory === 'All'
        ? mapped
        : mapped.filter(i => i.categoryName === this.selectedCategory);

    const total = res.pagination?.total || 0;
    this.listTotalPages = Math.max(1, Math.ceil(total / this.limit));
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
    await this.adminService.updateListingStatus(id, 'approved');
    this.triggerToast('Listing approved');
    this.loadListings(this.listPage);
    this.updateCounts();
  }

  openReject(id: number) {
    this.selectedListingId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  async submitReject() {
    if (!this.selectedListingId) return;

    await this.adminService.updateListingStatus(
      this.selectedListingId,
      'rejected',
      this.rejectReason
    );

    this.showRejectModal = false;
    this.triggerToast('Listing rejected');
    this.loadListings(this.listPage);
    this.updateCounts();
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
    this.loading = true;
    try {
      const res: any = await this.adminService.getListingById(listingId);
      const listing = res.data;

      this.reviewListing = listing;
      this.reviewMainCatId = listing.category.id;
      this.reviewMainCatName = listing.category.name;

      this.reviewImages = listing.images?.map((i: any) => i.imageUrl) || [];
      this.reviewModel = this.mapApiListingToReviewModel(listing);

      this.showReviewModal = true;
    } finally {
      this.loading = false;
    }
  }

  /* ================= API → REVIEW MODEL (MATCHES Review Component) ================= */
  mapApiListingToReviewModel(listing: any) {
    const a = listing.attributes || {};

    return {
      title: listing.title,
      price: listing.price,

      /* MOTORS */
      makeModel: `${a.make || ''} ${a.model || ''}`,
      year: a.year,
      fuelType: a.fuel_type,
      transmission: a.transmission,

      /* ELECTRONICS */
      brand: a.brand,
      electronicsModel: a.model,
      electronicsCondition: a.item_condition,

      /* PROPERTY */
      saleType: a.listing_type,
      bedrooms: a.bedrooms,
      bathrooms: a.bathrooms,
      area: a.area_sqft,

      /* CLASSIFIEDS / FURNITURE */
      itemCondition: a.item_condition,
      material: a.material,

      /* JOBS */
      jobTitle: a.job_title,
      companyName: a.company_name,
      industry: a.industry,
      jobType: a.job_type,
      experience: a.experience,
      salaryMin: a.salary_min,
      salaryMax: a.salary_max,
      jobDescription: a.job_description,
      responsibilities: a.responsibilities,
      requirements: a.requirements,
      benefits: a.benefits,

      /* CONTACT */
      name: listing.user?.name,
      phone: listing.contactPhone,
      companyWebsite: a.company_website
    };
  }

  /* ================= USERS ================= */
  async loadUsers(page: number) {
    this.userPage = page;
    const res: any = await this.adminService.getUsers(page, this.limit);
    this.users = res?.data || [];
    this.userTotalPages = Math.max(1, Math.ceil((res.pagination?.total || 0) / this.limit));
    this.userCount = res.pagination?.total || 0;
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
    await this.adminService.removeListing(listingId);
    this.triggerToast('Listing removed');
    this.loadReports(this.reportPage);
    this.updateCounts();
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
