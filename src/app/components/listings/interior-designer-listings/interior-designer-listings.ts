import { Component, OnInit } from '@angular/core';
import { DesignerService } from '../../../services/designer-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interior-designer-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interior-designer-listings.html',
  styleUrls: ['./interior-designer-listings.css']
})
export class InteriorDesignerListingsComponent implements OnInit {

  /* ================= VIEW STATES ================= */
  viewMode: 'listings' | 'dashboard' | 'create' | 'detail' | 'booking' = 'listings';
  isUserLoggedin = false;
  isDesigner = false;
  
  showRequestsModal = false;
  showClientDetailModal = false;
  showLoginModal = false;

  /* ================= DATA ================= */
  allDesigners: any[] = [];
  designers: any[] = [];
  selectedDesigner: any = null;
  
  myProfile: any = null;
  myRequests: any[] = [];
  selectedRequest: any = null;
  activeAlerts: any[] = [];

  /* ================= FORMS & PREVIEWS ================= */
  filters = { search: '', sort: 'rating' };
  styles = ['Modern', 'Minimalist', 'Bohemian', 'Traditional', 'Industrial', 'Coastal'];
  
  profileForm: any = {
    bio: '',
    tagline: '',
    city: '',
    location: '', // Mapped from city for backend validation
    specializations: [],
    services: ['Residential Design'], // Default to satisfy backend validation
    yearsExperience: 1,
    hourlyRate: 0,
    profileImage: '',
    portfolio: []
  };

  profilePreview: string | null = null;
  portfolioPreviews: string[] = [];

  bookingForm = {
    fullName: '', phone: '', projectType: '', description: '', date: '', time: ''
  };

  constructor(
    private designerService: DesignerService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedin = this.authService.isLoggedIn();
    this.loadDesigners();
    
    if (this.isUserLoggedin) {
      this.checkIfUserIsDesigner();
    }
  }

  /* ================= AUTH GATING & ALERTS ================= */

  showAlert(message: string, type: 'success' | 'error' = 'success') {
    const alert = { message, type };
    this.activeAlerts.push(alert);
    setTimeout(() => this.removeAlert(alert), 4000);
  }

  removeAlert(alert: any) {
    this.activeAlerts = this.activeAlerts.filter(a => a !== alert);
  }

  navigateToLogin() {
    this.showLoginModal = false;
    this.router.navigate(['/auth/login']);
  }

  openCreateProfile() {
    if (!this.isUserLoggedin) {
      this.showLoginModal = true;
      this.showAlert('Please log in to create a profile', 'error');
      return;
    }
    this.viewMode = 'create';
  }

  openBooking() {
    if (!this.isUserLoggedin) {
      this.showLoginModal = true;
      this.showAlert('Authentication required for bookings', 'error');
      return;
    }
    this.viewMode = 'booking';
  }

  /* ================= CHAT LOGIC ================= */

  openChat() {
    if (!this.isUserLoggedin) {
      this.showLoginModal = true;
      this.showAlert('Please log in to chat with the designer.', 'error');
      return;
    }

    if (!this.selectedDesigner?.id) {
      this.showAlert('Designer information is missing.', 'error');
      return;
    }
    
    // Using the ChatService to create/get a room
    this.chatService.createOrGetRoom(this.selectedDesigner.id).subscribe({
      next: (res: any) => {
        // Backend usually returns room ID in res.data.id or res.id
        const roomId = res?.data?.id || res?.id;
        if (roomId) {
          this.router.navigate(['/my-chats'], { queryParams: { roomId } });
        }
      },
      error: () => this.showAlert('Unable to start chat. Please try again.', 'error')
    });
  }

  /* ================= DESIGNER DASHBOARD ================= */

  checkIfUserIsDesigner() {
    this.designerService.getMyProfile().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        if (data) {
          this.isDesigner = true;
          this.myProfile = {
            ...data,
            name: data.user?.name, 
            profileImage: data.user?.avatarUrl
          };
          this.loadMyBookings();
        }
      },
      error: () => { this.isDesigner = false; } // Handle 404 gracefully
    });
  }

  loadMyBookings() {
    this.designerService.getDesignerBookings().subscribe(res => {
      this.myRequests = res;
    });
  }

  updateRequestStatus(request: any, status: 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.designerService.acceptBooking(request.id).subscribe({
        next: () => this.handleSuccess('accepted'),
        error: (err) => this.handleError(err)
      });
    } else {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason === null) return;

      this.designerService.rejectBooking(request.id, { reason: reason || 'Not available' }).subscribe({
        next: () => this.handleSuccess('rejected'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(status: string) {
    this.showAlert(`Consultation ${status} successfully!`, 'success');
    this.showClientDetailModal = false;
    this.loadMyBookings();
  }

  private handleError(err: any) {
    this.showAlert('Action failed. Please check your connection.', 'error');
  }

  viewRequestDetail(request: any) {
    this.selectedRequest = request;
    this.showClientDetailModal = true;
  }

  /* ================= LISTINGS & FILTERS ================= */

  loadDesigners() {
    this.designerService.getAllDesigners().subscribe((res: any) => {
      if (res.success && res.data) {
        this.allDesigners = res.data.map((d: any) => ({
          id: d.id,
          name: d.user?.name || 'Interior Designer',
          profileImage: d.user?.avatarUrl || 'assets/images/default-avatar.png', 
          city: d.city || d.location,
          tagline: d.tagline,
          specializations: d.specializations || [],
          hourlyRate: d.hourlyRate || 0,
          yearsExperience: d.yearsExperience,
          rating: d.rating || 0
        }));
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let list = [...this.allDesigners];
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.specializations.some((s: string) => s.toLowerCase().includes(q))
      );
    }
    this.designers = list;
  }

  openDesignerDetail(designer: any) {
    this.selectedDesigner = designer;
    this.viewMode = 'detail';

    this.designerService.getDesignerById(designer.id).subscribe((res: any) => {
      const d = res.data || res;
      // Map 'photos' array from network response to 'portfolio' for UI
      const portfolioImages = d.photos && d.photos.length > 0 
        ? d.photos.map((p: any) => (typeof p === 'string' ? p : p.url)) 
        : [];

      this.selectedDesigner = {
        ...d,
        name: d.user?.name || designer.name,
        profileImage: d.user?.avatarUrl || designer.profileImage,
        portfolio: portfolioImages
      };
    });
  }

  backToListings() {
    this.viewMode = 'listings';
    this.selectedDesigner = null;
    this.loadDesigners();
  }

  /* ================= PROFILE CREATION & UPLOADS ================= */

  toggleStyle(style: string) {
    const idx = this.profileForm.specializations.indexOf(style);
    if (idx > -1) this.profileForm.specializations.splice(idx, 1);
    else this.profileForm.specializations.push(style);
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // 1. Preview
      const reader = new FileReader();
      reader.onload = () => this.profilePreview = reader.result as string;
      reader.readAsDataURL(file);

      // 2. Upload immediately and store URL in form
      this.designerService.uploadSingleImage(file, 'profiles').subscribe(res => {
        this.profileForm.profileImage = res.data.url;
      });
    }
  }

  onPortfolioSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 0) {
      // 1. Previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => this.portfolioPreviews.push(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 2. Upload and store URLs in form
      this.designerService.uploadMultipleImages(files, 'portfolio').subscribe(res => {
        // Extract URLs from the data array in response
        const newUrls = res.data.map((item: any) => item.url);
        this.profileForm.portfolio = [...this.profileForm.portfolio, ...newUrls];
      });
    }
  }

  submitProfile() {
    // Satisfy Backend Validation: map city to location
    this.profileForm.location = this.profileForm.city;

    if (!this.profileForm.location) {
      this.showAlert('Location is required', 'error');
      return;
    }

    this.designerService.createProfile(this.profileForm).subscribe({
      next: () => {
        this.showAlert('Profile Created Successfully!', 'success');
        this.checkIfUserIsDesigner();
        this.backToListings();
      },
      error: (err) => {
        this.showAlert(err.error?.error?.message || 'Profile creation failed', 'error');
      }
    });
  }

  confirmBooking() {
    const payload = {
      dateTime: `${this.bookingForm.date}T${this.bookingForm.time}:00Z`,
      userName: this.bookingForm.fullName,
      userPhone: this.bookingForm.phone,
      projectType: this.bookingForm.projectType,
      projectDescription: this.bookingForm.description,
      duration: 60,
      meetingType: 'in-person'
    };

    this.designerService.createBooking(this.selectedDesigner.id, payload).subscribe(() => {
      this.showAlert('Booking Request Sent!', 'success');
      this.viewMode = 'detail';
      this.bookingForm = { fullName: '', phone: '', projectType: '', description: '', date: '', time: '' };
    });
  }


  /* ================= MISSING UTILITY METHODS ================= */

  /** Fixes: Property 'openDashboard' does not exist */
  openDashboard() {
    this.viewMode = 'dashboard';
    // Optionally refresh bookings when entering dashboard
    this.loadMyBookings();
  }

  /** Fixes: Property 'openRequests' does not exist */
  openRequests() {
    this.showRequestsModal = true;
  }

  /** Fixes: Property 'removePortfolioImage' does not exist */
  removePortfolioImage(index: number) {
    // Remove from the visual previews
    this.portfolioPreviews.splice(index, 1);
    
    // Remove from the actual data array being sent to the server
    if (this.profileForm.portfolio && this.profileForm.portfolio[index]) {
      this.profileForm.portfolio.splice(index, 1);
    }
  }
}