import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService, User, ApiResponse } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class NavbarComponent implements OnInit, OnDestroy {

  // --- User State ---
  user: User | null = null;
  isAdmin = false;

  // --- Navbar & Modal Visibility ---
  hideNavbar = false;
  showLoginModal = false;

  // --- Profile Overlay & UI States ---
  isOverlayOpen = false;
  activeTab: 'profile' | 'settings' = 'profile';
  isEditingProfile = false;
  isUploading = false; // Loading spinner for image upload

  // --- Toast Notification State ---
  showToast = false;
  toastMessage = '';

  // Form model for editing profile
  editForm = {
    name: '',
    phone: '',
    email: '',
    bio: ''
  };

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    /* =========================
       USER STATE SUBSCRIPTION
       ========================= */
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isAdmin = user?.role === 'admin';
      
      if (user) {
        this.resetEditForm();
      }
    });

    // Initial sync check
    const currentUser = this.authService.getCurrentUser();
    this.user = currentUser;
    this.isAdmin = currentUser?.role === 'admin';
    if (currentUser) {
      this.resetEditForm();
    }

    /* =========================
       ROUTE CHANGE DETECTION
       ========================= */
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = ['/', '/auth/login', '/auth/signUp'];

        this.hideNavbar = hiddenRoutes.some(route => {
          if (route === '/') {
            return event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
          }
          return event.urlAfterRedirects.startsWith(route);
        });
        
        this.isOverlayOpen = false; // Close overlay when navigating
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  /* =========================
     PROFILE OVERLAY LOGIC
     ========================= */

  toggleOverlay(): void {
    this.isOverlayOpen = !this.isOverlayOpen;
    if (!this.isOverlayOpen) {
      this.activeTab = 'profile';
      this.isEditingProfile = false;
    }
  }

  switchTab(tab: 'profile' | 'settings'): void {
    this.activeTab = tab;
    this.isEditingProfile = false;
  }

  enterEditMode(): void {
    this.isEditingProfile = true;
    this.resetEditForm();
  }

  exitEditMode(): void {
    this.isEditingProfile = false;
    this.resetEditForm();
  }

  resetEditForm(): void {
    if (this.user) {
      this.editForm = {
        name: this.user.name || '',
        phone: this.user.phone || '',
        email: this.user.email || '',
        bio: this.user.bio || ''
      };
    }
  }

  /* =========================
     IMAGE UPLOAD LOGIC
     ========================= */

  triggerFileInput(): void {
    const fileInput = document.getElementById('avatarUpload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;

    // 1. Upload to S3 (API #12)
    this.authService.uploadImage(file, 'profiles').subscribe({
      next: (uploadRes) => {
        if (uploadRes.success) {
          // 2. Update User Profile with new URL (API #8)
          this.authService.updateProfile({ avatarUrl: uploadRes.data.url }).subscribe({
            next: (profileRes) => {
              this.isUploading = false;
              if (profileRes.success) {
                this.triggerToast('Profile picture updated!');
              }
            },
            error: () => {
              this.isUploading = false;
              this.triggerToast('Error updating profile data.');
            }
          });
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload failed', err);
        this.triggerToast('Image upload failed.');
      }
    });
  }

  /* =========================
     PROFILE SAVE LOGIC
     ========================= */

  saveProfileChanges(): void {
    const payload = {
      name: this.editForm.name,
      phone: this.editForm.phone,
      bio: this.editForm.bio
    };

    // API #8: Update My Profile (PUT /api/users/me)
    this.authService.updateProfile(payload).subscribe({
      next: (res: ApiResponse<User>) => {
        if (res.success) {
          this.isEditingProfile = false;
          this.triggerToast('Profile updated successfully!');
        }
      },
      error: (err: any) => {
        console.error('Failed to update profile', err);
        this.triggerToast('Error: Could not update profile.');
      }
    });
  }

  /* =========================
     TOAST NOTIFICATION
     ========================= */

  private triggerToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  /* =========================
     ACTION HANDLERS
     ========================= */

  onPlaceAdClick(): void {
    if (this.isAdmin) return;
    if (!this.user) {
      this.showLoginModal = true;
    } else {
      this.router.navigate(['/add-post']);
    }
  }

  closeModal(): void {
    this.showLoginModal = false;
  }

  goToLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/auth/login']);
  }

  onLoginClick(): void {
    this.router.navigate(['/auth/login']);
  }

  onLogout(): void {
    this.isOverlayOpen = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /* =========================
     USER NAVIGATION
     ========================= */

  navigateToFavourites(): void {
    if (!this.isAdmin) this.router.navigate(['/my-favourites']);
  }

  navigateToChats(): void {
    if (!this.isAdmin) this.router.navigate(['/my-chats']);
  }

  navigateToMyAds(): void {
    if (!this.isAdmin) this.router.navigate(['/my-ads']);
  }

  navigateToProfile(): void {
    if (!this.isAdmin) this.toggleOverlay();
  }

  goToWebsite(): void {
    this.router.navigate(['/home']);
  }
}