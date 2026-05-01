import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService, User, ApiResponse } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,TranslateModule]
})
export class NavbarComponent implements OnInit, OnDestroy {

  // --- User State ---
  user: User | null = null;
  isAdmin = false;
  currentLang = 'en';


  // --- Navbar & Modal Visibility ---
  hideNavbar = false;
  showLoginModal = false;
  showTopAlert = true; // For the static blue banner at the very top
  showPropertyDropdown = false;
  showMotorsDropdown = false;
  showJobsDropdown = false;
  showClassifiedsDropdown = false;
  showFurnitureDropdown = false;
  showMobilesDropdown = false;
  showCommunityDropdown = false;
  activeMotorsCategory = 'USED_CARS';
  activeJobsCategory = 'JOBS_BY_CATEGORIES';
  activeClassifiedsCategory = 'ELECTRONICS';
  activeFurnitureCategory = 'FURNITURE';
  activeMobilesCategory = 'MOBILE_PHONES';

  private motorsTimeout: any;
  private propertyTimeout: any;
  private jobsTimeout: any;
  private classifiedsTimeout: any;
  private furnitureTimeout: any;
  private mobilesTimeout: any;
  private communityTimeout: any;

  // --- Profile Overlay & UI States ---
  isOverlayOpen = false;
activeTab: 'profile' | 'settings' | 'edit' | 'changePassword' = 'profile';

  isEditingProfile = false;
  isUploading = false; // Loading spinner for image upload

  // --- Toast Notification State ---
  showToast = false;
  toastMessage = '';
  activeTabTitle = 'My Profile';
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
  private authService: AuthService,
  private translate: TranslateService,
  private elRef: ElementRef,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  translate.addLangs(['en', 'hi', 'ar']);
  translate.setDefaultLang('en');

  if (isPlatformBrowser(this.platformId)) {
    const savedLang = localStorage.getItem('app_lang') || 'en';
    this.currentLang = savedLang;
    this.translate.use(savedLang);

    document.body.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
  }
}


  

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
   // Always fetch fresh user data from backend



    /* =========================
       ROUTE CHANGE DETECTION
       ========================= */
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = [ '/auth/login', '/auth/signUp'];
        this.hideNavbar = hiddenRoutes.includes(event.urlAfterRedirects);

       
        
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

  goToAdminPanel(): void {
    console.log('Navigating to admin panel');
    this.router.navigate(['admin']);
  }   

  toggleOverlay(): void {
    this.isOverlayOpen = !this.isOverlayOpen;
    this.authService.getMe().subscribe({
  next: (res) => {
    if (res.success) {
      this.user = res.data;
      this.isAdmin = res.data.role === 'admin';
      this.resetEditForm();
    }
  },
  error: () => {
    this.user = null;
    this.isAdmin = false;
  }
});
    if (!this.isOverlayOpen) {
      this.activeTab = 'profile';
      this.isEditingProfile = false;
    }
  }
switchLang(event: Event) {
  const lang = (event.target as HTMLSelectElement).value;
  this.translate.use(lang);

  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem("app_lang", lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  this.currentLang = lang;
}


  

  // switchTab(tab: 'profile' | 'settings'): void {
  //   this.activeTab = tab;
  //   this.isEditingProfile = false;
  // }

  

  switchTab(tab: any) {
  this.activeTab = tab;

  this.activeTabTitle =
    tab === 'profile' ? 'My Profile' :
    tab === 'edit' ? 'Edit Profile' :
    tab === 'settings' ? 'Account Settings' :
    tab === 'changePassword' ? 'Change Password' : '';
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
    if (isPlatformBrowser(this.platformId)) {
      const fileInput = document.getElementById('avatarUpload') as HTMLInputElement;
      if (fileInput) fileInput.click();
    }
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

  /* =========================
     COMMUNITY DROPDOWN
     ========================= */
  toggleCommunityDropdown(event: Event): void {
    event.stopPropagation();
    this.showCommunityDropdown = !this.showCommunityDropdown;
  }
  openCommunityDropdown(): void {
    clearTimeout(this.communityTimeout);
    this.showCommunityDropdown = true;
  }
  keepCommunityDropdownOpen(): void {
    clearTimeout(this.communityTimeout);
  }
  closeCommunityDropdownDelayed(): void {
    this.communityTimeout = setTimeout(() => {
      this.showCommunityDropdown = false;
    }, 200);
  }

  navigateToCommunitySub(category: string): void {
    this.showCommunityDropdown = false;
    this.router.navigate(['/listings/community'], { queryParams: { q: category } });
  }

  /* =========================
     PROPERTY DROPDOWN
     ========================= */
  togglePropertyDropdown(event: Event): void {
    event.stopPropagation();
    this.showPropertyDropdown = !this.showPropertyDropdown;
  }

  closePropertyDropdown(): void {
    this.showPropertyDropdown = false;
  }

  openPropertyDropdown(): void {
    clearTimeout(this.propertyTimeout);
    this.showPropertyDropdown = true;
    this.closeMotorsDropdown(); // Ensure only one is open
  }

  closePropertyDropdownDelayed(): void {
    this.propertyTimeout = setTimeout(() => {
      this.closePropertyDropdown();
    }, 300);
  }

  keepPropertyDropdownOpen(): void {
    clearTimeout(this.propertyTimeout);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.elRef.nativeElement.contains(event.target)) {
        this.closePropertyDropdown();
        this.closeMotorsDropdown();
        this.closeJobsDropdown();
        this.closeClassifiedsDropdown();
        this.closeFurnitureDropdown();
        this.closeMobilesDropdown();
      }
    }
  }

  navigateToPropertySub(type: string, sub: string): void {
    this.closePropertyDropdown();
    this.router.navigate(['/listings/property'], { 
      queryParams: { type, sub } 
    });
  }

  /* =========================
     MOTORS DROPDOWN
     ========================= */
  toggleMotorsDropdown(event: Event): void {
    event.stopPropagation();
    this.showMotorsDropdown = !this.showMotorsDropdown;
    if (this.showMotorsDropdown) this.showPropertyDropdown = false;
  }

  closeMotorsDropdown(): void {
    this.showMotorsDropdown = false;
  }

  openMotorsDropdown(): void {
    clearTimeout(this.motorsTimeout);
    this.showMotorsDropdown = true;
    this.closePropertyDropdown(); // Ensure only one is open
  }

  closeMotorsDropdownDelayed(): void {
    this.motorsTimeout = setTimeout(() => {
      this.closeMotorsDropdown();
    }, 300);
  }

  keepMotorsDropdownOpen(): void {
    clearTimeout(this.motorsTimeout);
  }

  setMotorsCategory(category: string, event: Event): void {
    // event.stopPropagation(); // No longer needed for hover
    this.activeMotorsCategory = category;
  }

  navigateToMotorsSub(category: string, sub: string): void {
    this.closeMotorsDropdown();
    this.router.navigate(['/listings/motors'], { 
      queryParams: { category, sub } 
    });
  }

  /* =========================
     JOBS DROPDOWN
     ========================= */
  toggleJobsDropdown(event: Event): void {
    event.stopPropagation();
    this.showJobsDropdown = !this.showJobsDropdown;
    if (this.showJobsDropdown) {
      this.showPropertyDropdown = false;
      this.showMotorsDropdown = false;
    }
  }

  closeJobsDropdown(): void {
    this.showJobsDropdown = false;
  }

  openJobsDropdown(): void {
    clearTimeout(this.jobsTimeout);
    this.showJobsDropdown = true;
    this.closePropertyDropdown();
    this.closeMotorsDropdown();
  }

  closeJobsDropdownDelayed(): void {
    this.jobsTimeout = setTimeout(() => {
      this.closeJobsDropdown();
    }, 300);
  }

  keepJobsDropdownOpen(): void {
    clearTimeout(this.jobsTimeout);
  }

  setJobsCategory(category: string, event: Event): void {
    this.activeJobsCategory = category;
  }

  navigateToJobsSub(category: string, sub: string): void {
    this.closeJobsDropdown();
    this.router.navigate(['/listings/jobs'], { 
      queryParams: { category, sub } 
    });
  }

  /* =========================
     CLASSIFIEDS DROPDOWN
     ========================= */
  toggleClassifiedsDropdown(event: Event): void {
    event.stopPropagation();
    this.showClassifiedsDropdown = !this.showClassifiedsDropdown;
    if (this.showClassifiedsDropdown) {
      this.showPropertyDropdown = false;
      this.showMotorsDropdown = false;
      this.showJobsDropdown = false;
    }
  }

  closeClassifiedsDropdown(): void {
    this.showClassifiedsDropdown = false;
  }

  openClassifiedsDropdown(): void {
    clearTimeout(this.classifiedsTimeout);
    this.showClassifiedsDropdown = true;
    this.closePropertyDropdown();
    this.closeMotorsDropdown();
    this.closeJobsDropdown();
  }

  closeClassifiedsDropdownDelayed(): void {
    this.classifiedsTimeout = setTimeout(() => {
      this.closeClassifiedsDropdown();
    }, 300);
  }

  keepClassifiedsDropdownOpen(): void {
    clearTimeout(this.classifiedsTimeout);
  }

  setClassifiedsCategory(category: string, event: Event): void {
    this.activeClassifiedsCategory = category;
  }

  navigateToClassifiedsSub(category: string, sub: string): void {
    this.closeClassifiedsDropdown();
    this.router.navigate(['/listings/classifieds'], { 
      queryParams: { category, sub } 
    });
  }

  /* =========================
     FURNITURE DROPDOWN
     ========================= */
  toggleFurnitureDropdown(event: Event): void {
    event.stopPropagation();
    this.showFurnitureDropdown = !this.showFurnitureDropdown;
    if (this.showFurnitureDropdown) {
      this.showPropertyDropdown = false;
      this.showMotorsDropdown = false;
      this.showJobsDropdown = false;
      this.showClassifiedsDropdown = false;
    }
  }

  closeFurnitureDropdown(): void {
    this.showFurnitureDropdown = false;
  }

  openFurnitureDropdown(): void {
    clearTimeout(this.furnitureTimeout);
    this.showFurnitureDropdown = true;
    this.closePropertyDropdown();
    this.closeMotorsDropdown();
    this.closeJobsDropdown();
    this.closeClassifiedsDropdown();
  }

  closeFurnitureDropdownDelayed(): void {
    this.furnitureTimeout = setTimeout(() => {
      this.closeFurnitureDropdown();
    }, 300);
  }

  keepFurnitureDropdownOpen(): void {
    clearTimeout(this.furnitureTimeout);
  }

  setFurnitureCategory(category: string, event: Event): void {
    this.activeFurnitureCategory = category;
  }

  navigateToFurnitureSub(category: string, sub: string): void {
    this.closeFurnitureDropdown();
    this.router.navigate(['/listings/furniture'], { 
      queryParams: { category, sub } 
    });
  }

  /* =========================
     MOBILES DROPDOWN
     ========================= */
  toggleMobilesDropdown(event: Event): void {
    event.stopPropagation();
    this.showMobilesDropdown = !this.showMobilesDropdown;
    if (this.showMobilesDropdown) {
      this.showPropertyDropdown = false;
      this.showMotorsDropdown = false;
      this.showJobsDropdown = false;
      this.showClassifiedsDropdown = false;
      this.showFurnitureDropdown = false;
    }
  }

  closeMobilesDropdown(): void {
    this.showMobilesDropdown = false;
  }

  openMobilesDropdown(): void {
    clearTimeout(this.mobilesTimeout);
    this.showMobilesDropdown = true;
    this.closePropertyDropdown();
    this.closeMotorsDropdown();
    this.closeJobsDropdown();
    this.closeClassifiedsDropdown();
    this.closeFurnitureDropdown();
  }

  closeMobilesDropdownDelayed(): void {
    this.mobilesTimeout = setTimeout(() => {
      this.closeMobilesDropdown();
    }, 300);
  }

  keepMobilesDropdownOpen(): void {
    clearTimeout(this.mobilesTimeout);
  }

  setMobilesCategory(category: string, event: Event): void {
    this.activeMobilesCategory = category;
  }

  navigateToMobilesSub(category: string, sub: string): void {
    this.closeMobilesDropdown();
    this.router.navigate(['/listings/mobiles'], { 
      queryParams: { category, sub } 
    });
  }

  toggleMobileMenu(): void {
    // Mobile menu toggle logic — expand as needed
  }

  goToWebsite(): void {
    this.router.navigate(['/home']);
  }
}
