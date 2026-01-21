import { Component, OnInit } from '@angular/core';
import { DesignerService } from '../../../services/designer-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-interior-designer-listings',
  imports: [FormsModule, CommonModule],
  templateUrl: './interior-designer-listings.html',
  styleUrls: ['./interior-designer-listings.css']
})
export class InteriorDesignerListingsComponent implements OnInit {

  isUserLoggedin: boolean = false;

  /* =======================
     UI STATE
  ======================= */
  viewMode: 'listings' | 'create' | 'detail' = 'listings';
  showRequestsModal = false;
  showClientDetailModal = false;
  isMobileFiltersOpen = false;

  /* =======================
     DATA
  ======================= */
  allDesigners: any[] = [];       // master list
  designers: any[] = [];          // filtered list (used in UI)

  selectedDesigner: any = null;
  myRequests: any[] = [];
  selectedRequest: any = null;

  /* =======================
     FILTERS (CLIENT SIDE)
  ======================= */
  filters = {
    city: 'Dubai',
    style: '',
    minRate: null as number | null,
    maxRate: null as number | null,
    sort: 'rating'
  };

  /* =======================
     PROFILE FORM
  ======================= */
  profilePreview: string | ArrayBuffer | null = null;
  portfolioPreviews: { url: string; isUploading: boolean }[] = [];

  profileForm = {
    fullName: '',
    location: '',
    bio: '',
    styles: [] as string[],
    experience: '',
    rate: '',
    profileImage: '',
    portfolio: [] as any[]
  };

  /* =======================
     STATIC UI DATA
  ======================= */
  styles = ['Modern', 'Minimalist', 'Bohemian', 'Traditional', 'Industrial', 'Coastal'];
  cities = ['Dubai', 'Abu Dhabi', 'Sharjah'];

  constructor(
    private designerService: DesignerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedin = this.authService.isLoggedIn();
    this.loadDesigners();
  }

  /* =======================
     DATA LOADING (ONCE)
  ======================= */
  loadDesigners() {
    this.designerService.getAllDesigners().subscribe((res: any[]) => {
      this.allDesigners = res.map(d => ({
        ...d,
        isFavourite: this.designerService.isFavourite(d.id)
      }));

      this.applyFilters();
      console.log('Designers Loaded:', this.allDesigners);
    });
  }

  /* =======================
     CLIENT-SIDE FILTERING
  ======================= */
  applyFilters() {
    let list = [...this.allDesigners];

    if (this.filters.city) {
      list = list.filter(d =>
        d.city?.toLowerCase() === this.filters.city.toLowerCase()
      );
    }

    if (this.filters.style) {
      list = list.filter(d =>
        d.specializations?.includes(this.filters.style)
      );
    }

    if (this.filters.minRate !== null) {
      list = list.filter(d => d.hourlyRate >= this.filters.minRate!);
    }

    if (this.filters.maxRate !== null) {
      list = list.filter(d => d.hourlyRate <= this.filters.maxRate!);
    }

    switch (this.filters.sort) {
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        list.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'price_high':
        list.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
    }

    this.designers = list;
  }

  /* =======================
     MOBILE FILTER
  ======================= */
  toggleFilters() {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }

  /* =======================
     FAVOURITES
  ======================= */
  toggleFavourite(designer: any, event: Event) {
    event.stopPropagation();
    designer.isFavourite = !designer.isFavourite;
    this.designerService.toggleFavourite(designer.id);
  }

  /* =======================
     NAVIGATION
  ======================= */
  openCreateProfile() {
    this.viewMode = 'create';
  }

  openDesignerDetail(designer: any) {
    this.selectedDesigner = designer;
    this.viewMode = 'detail';
  }

  backToListings() {
    this.viewMode = 'listings';
    this.selectedDesigner = null;
  }

  /* =======================
     REQUESTS / MODALS
  ======================= */
  openRequests() {
    this.designerService.getDesignerBookings().subscribe(data => {
      this.myRequests = data;
      this.showRequestsModal = true;
    });
  }

  viewRequestDetail(request: any) {
    this.selectedRequest = request;
    this.showClientDetailModal = true;
  }

  closeModals() {
    this.showRequestsModal = false;
    this.showClientDetailModal = false;
    this.selectedRequest = null;
  }

  handleBookingAction(action: 'accept' | 'reject') {
    if (!this.selectedRequest) return;

    this.designerService
      .updateBookingStatus(this.selectedRequest.id, action)
      .subscribe(() => {
        this.selectedRequest.status =
          action === 'accept' ? 'Accepted' : 'Rejected';
        this.closeModals();
        this.openRequests();
      });
  }

  /* =======================
     IMAGE UPLOADS
  ======================= */
  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.profilePreview = reader.result);
    reader.readAsDataURL(file);

    this.designerService.uploadSingleImage(file, 'profiles').subscribe({
      next: res => (this.profileForm.profileImage = res.data.url),
      error: err => console.error('Profile upload failed', err)
    });
  }

  onPortfolioSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (!files.length) return;

    this.designerService.uploadMultipleImages(files, 'portfolio').subscribe({
      next: res => {
        const urls = res.data?.urls || res.data || [];
        if (Array.isArray(urls)) {
          this.profileForm.portfolio.push(...urls);
        }
      },
      error: err => console.error('Portfolio upload failed', err)
    });
  }

  removePortfolioItem(index: number) {
    this.profileForm.portfolio.splice(index, 1);
  }

  toggleStyle(style: string) {
    const idx = this.profileForm.styles.indexOf(style);
    idx > -1
      ? this.profileForm.styles.splice(idx, 1)
      : this.profileForm.styles.push(style);
  }

  /* =======================
     SUBMIT PROFILE
  ======================= */
  submitProfile() {
    if (!this.profileForm.profileImage) {
      alert('Please wait for image upload');
      return;
    }

    const payload = {
      name: this.profileForm.fullName,
      city: this.profileForm.location,
      bio: this.profileForm.bio,
      specializations: this.profileForm.styles,
      yearsExperience: Number(this.profileForm.experience),
      hourlyRate: Number(this.profileForm.rate),
      profileImage: this.profileForm.profileImage,
      portfolio: this.profileForm.portfolio
    };

    this.designerService.createProfile(payload).subscribe({
      next: () => {
        alert('Profile created successfully');
        this.viewMode = 'listings';
        this.loadDesigners();
      },
      error: err => {
        console.error(err);
        alert('Profile creation failed');
      }
    });
  }
}
