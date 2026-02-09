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
  viewConsultations=false;
  showClientDetailModal = false;
  showLoginModal = false;

  /* ================= DATA ================= */
  allDesigners: any[] = [];
  designers: any[] = [];
  selectedDesigner: any = null;

  myProfile: any = null;
  myConsultantions:any[]=[];
  myRequests: any[] = [];
  selectedRequest: any = null;
  
minBookingDate = new Date().toISOString().split('T')[0];

  activeAlerts: { message: string; type: 'success' | 'error' }[] = [];

  /* ================= FORMS ================= */
  filters = { search: '', sort: 'rating' };

  styles = ['Modern', 'Minimalist', 'Bohemian', 'Traditional', 'Industrial', 'Coastal'];

  profileForm: any = {
    bio: '',
    tagline: '',
    city: '',
    location: '',
    specializations: [],
    services: ['Residential Design'],
    yearsExperience: 1,
    hourlyRate: 0,
    profileImage: '',
    portfolio: [],
    photos: []
  };

  profilePreview: string | null = null;
  portfolioPreviews: string[] = [];

  bookingForm = {
    fullName: '',
    phone: '',
    projectType: '',
    description: '',
    date: '',
    time: '',
     address: ''
  };

  showRejectModal = false;
  rejectionReason = '';

  constructor(
    private designerService: DesignerService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isUserLoggedin = this.authService.isLoggedIn();
    this.loadDesigners();

    if (this.isUserLoggedin) {
      this.checkIfUserIsDesigner();
    }
  }

  /* ================= ALERTS ================= */

  showAlert(message: string, type: 'success' | 'error' = 'success') {
    const alert = { message, type };
    this.activeAlerts.push(alert);
    setTimeout(() => this.removeAlert(alert), 4000);
  }

  removeAlert(alert: any) {
    this.activeAlerts = this.activeAlerts.filter(a => a !== alert);
  }

  /* ================= AUTH ================= */

  navigateToLogin() {
    this.showLoginModal = false;
    this.router.navigate(['/auth/login']);
  }

  /* 🔴 FIXED: THIS METHOD WAS MISSING */
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
      this.showAlert('Please log in to book a consultation', 'error');
      return;
    }
    this.viewMode = 'booking';
  }

  /* ================= CHAT ================= */

  openChat() {
    if (!this.isUserLoggedin) {
      this.showLoginModal = true;
      this.showAlert('Please log in to start chat', 'error');
      return;
    }

    if (!this.selectedDesigner?.id) {
      this.showAlert('Designer not found', 'error');
      return;
    }

    this.chatService.createOrGetRoom(this.selectedDesigner.user.id).subscribe({
      next: (res: any) => {
        const roomId = res?.data?.id || res?.id;
        if (roomId) {
          this.router.navigate(['/my-chats'], { queryParams: { roomId } });
        }
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Unable to start chat', 'error');
      }
    });
  }

  /* ================= DESIGNERS ================= */

  loadDesigners() {
    this.designerService.getAllDesigners().subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        this.allDesigners = list.map((d: any) => ({
          id: d.id,
          name: d.user?.name || 'Interior Designer',
          profileImage: d.user?.avatarUrl || 'assets/images/default-avatar.png',
          city: d.city || d.location,
          tagline: d.tagline,
          specializations: d.specializations || [],
          hourlyRate: d.hourlyRate || 0,
          yearsExperience: d.yearsExperience || 0,
          rating: d.rating || 0
        }));
        this.applyFilters();
      },
      error: () => this.showAlert('Failed to load designers', 'error')
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

  openDesignerDetail(id: number) {
    this.viewMode = 'detail';

    this.designerService.getDesignerById(id).subscribe({
      next: (res: any) => {
        const d = res.data || res;
        this.selectedDesigner=d;
      },
      error: () => this.showAlert('Failed to load designer profile', 'error')
    });
  }

  backToListings() {
    this.viewMode = 'listings';
    this.selectedDesigner = null;
  }

  /* ================= DASHBOARD ================= */

  openDashboard() {
    this.viewMode = 'dashboard';
    this.loadMyBookings();
  }

 
  openConsultantions(){
    this.viewConsultations=true;

    this.designerService.getMyBookings().subscribe({
      next:(res:any)=>{
        this.myConsultantions=res?.data ;

      },error:(err)=>{
        this.showAlert(
        err?.error?.message || 'Unable to load consultantions requests',
        'error'
      );
      }
    })
  }

  openRequests() {
  this.showRequestsModal = true;

  // CLIENT bookings (not designer)
  this.designerService.getUserBookings().subscribe({
    next: (res: any) => {
      this.myRequests = res?.data || res || [];
    },
    error: (err) => {
      this.showAlert(
        err?.error?.message || 'Unable to load bookings',
        'error'
      );
    }
  });
}


  checkIfUserIsDesigner() {
    this.designerService.getMyProfile().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.isDesigner = true;
        this.myProfile = {
          ...data,
          name: data.user?.name,
          profileImage: data.user?.avatarUrl,
          portfolio: Array.isArray(data.photos) ? data.photos : []
        };
        this.loadMyBookings();
      },
      error: () => (this.isDesigner = false)
    });
  }

  loadMyBookings() {
    this.designerService.getDesignerBookings().subscribe({
      next: (res: any) => (this.myRequests = res || []),
      error: () => this.showAlert('Failed to load bookings', 'error')
    });
  }

  updateRequestStatus(req: any, status: 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.designerService.acceptBooking(req.id).subscribe(() => {
        this.showAlert('Booking accepted', 'success');
        this.loadMyBookings();
      });
    } else {
      this.selectedRequest = req;
     this.showRejectModal = true;
    }}
   
    submitReject() {
       this.designerService.rejectBooking(this.selectedRequest.id, { reason: this.rejectionReason }).subscribe(() => {
        this.showAlert('Booking rejected', 'success');
        this.loadMyBookings();
      });
    }



  /* ================= PROFILE ================= */

  toggleStyle(style: string) {
    const i = this.profileForm.specializations.indexOf(style);
    i >= 0
      ? this.profileForm.specializations.splice(i, 1)
      : this.profileForm.specializations.push(style);
  }

  submitProfile() {
    this.profileForm.location = this.profileForm.city;
    if (!this.profileForm.location) {
      this.showAlert('Location is required', 'error');
      return;
    }

    this.designerService.createProfile(this.profileForm).subscribe({
      next: () => {
        this.showAlert('Profile created successfully', 'success');
        this.checkIfUserIsDesigner();
        this.backToListings();
      },
      error: (err) =>
        this.showAlert(err?.error?.message || 'Profile creation failed', 'error')
    });
  }

  /* ================= BOOKING ================= */
onProfileImageSelected(event: any) {
  const file: File | undefined = event.target?.files?.[0];
  if (!file) return;

  // Preview
  const reader = new FileReader();
  reader.onload = () => (this.profilePreview = reader.result as string);
  reader.readAsDataURL(file);

  // Upload to backend
  this.designerService.uploadSingleImage(file, 'profiles').subscribe({
    next: (res: any) => {
      this.profileForm.profileImage = res?.data?.url;
      this.showAlert('Profile image uploaded', 'success');
    },
    error: (err) => {
      this.showAlert(
        err?.error?.message || 'Profile image upload failed',
        'error'
      );
    }
  });
}
onPortfolioSelected(event: any) {
  const files: File[] = Array.from(event.target?.files || []);
  if (!files.length) return;

  // Previews
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () =>
      this.portfolioPreviews.push(reader.result as string);
    reader.readAsDataURL(file);
  });

  // Upload
  this.designerService.uploadMultipleImages(files, 'portfolio').subscribe({
    next: (res: any) => {
      const urls = (res?.data || []).map((i: any) => i.url);
      this.profileForm.photos.push(...urls);
      this.showAlert('Portfolio images uploaded', 'success');
    },
    error: (err) => {
      this.showAlert(
        err?.error?.message || 'Portfolio upload failed',
        'error'
      );
    }
  });
}

  confirmBooking() {
    const selectedDate = new Date(`${this.bookingForm.date}T${this.bookingForm.time}`);
    if (selectedDate <= new Date()) {
      this.showAlert('Please select a future date and time', 'error');
      return;
    }

    const payload = {
      dateTime: selectedDate.toISOString(),
      userName: this.bookingForm.fullName,
      userPhone: this.bookingForm.phone,
      projectType: this.bookingForm.projectType,
      projectDescription: this.bookingForm.description,
      duration: 60,
      meetingType: 'in_person',
      userAddress: this.bookingForm.address || 'Dubai, UAE'

    };

    this.designerService.createBooking(this.selectedDesigner.id, payload).subscribe({
      next: () => {
        this.showAlert('Booking request sent', 'success');
        this.viewMode = 'detail';
        this.bookingForm = { fullName: '', phone: '', projectType: '', description: '', date: '', time: '', address: ''};
      },
      error: () => this.showAlert('Booking failed', 'error')
    });
  }

  removePortfolioImage(index: number) {
    this.portfolioPreviews.splice(index, 1);
    this.profileForm.portfolio.splice(index, 1);
  }
}
