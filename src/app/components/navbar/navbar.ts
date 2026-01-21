import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService, User } from '../../services/auth-service';
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

  user: User | null = null;
  isAdmin = false;

  hideNavbar = false;
  showLoginModal = false;

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
    });

    const currentUser = this.authService.getCurrentUser();
    this.user = currentUser;
    this.isAdmin = currentUser?.role === 'admin';

    /* =========================
       ROUTE CHANGE DETECTION
       ========================= */

   this.routerSubscription = this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {

    const hiddenRoutes = [
      '/auth/login',
      '/auth/signUp',
      
    ];

    this.hideNavbar = hiddenRoutes.some(route =>
      event.urlAfterRedirects.startsWith(route)
    );
  });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  /* =========================
     ACTION HANDLERS
     ========================= */

  onPlaceAdClick(): void {
    // Admin should never place ads
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
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /* =========================
     USER NAVIGATION
     ========================= */

  navigateToFavourites(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/my-favourites']);
    }
  }

  navigateToChats(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/my-chats']);
    }
  }

  navigateToMyAds(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/my-ads']);
    }
  }

  navigateToProfile(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/profile']);
    }
  }

  /* =========================
     ADMIN NAVIGATION
     ========================= */



  goToWebsite(): void {
    this.router.navigate(['/home']);
  }
}
