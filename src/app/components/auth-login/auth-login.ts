import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth-service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-login.html',
  styleUrls: ['./auth-login.css'],
})
export class AuthLoginComponent {

  isLoading = false;
  showPassword = false;

  // Modal state
  showModal = false;
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';

  private autoCloseTimer: any = null;

  model = {
    email: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /* ===============================
     🔒 GUARANTEED MODAL RENDER
     =============================== */
  private showPopup(
    type: 'success' | 'error',
    message: string,
    autoCloseMs?: number
  ): void {
    // Clear timers
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }

    // 1️⃣ Set modal state
    this.modalType = type;
    this.modalMessage = message;
    this.showModal = true;

    // 2️⃣ FORCE Angular to paint modal
    this.cdr.detectChanges();

    // 3️⃣ Wait for browser paint frame
    requestAnimationFrame(() => {
      if (autoCloseMs) {
        this.autoCloseTimer = setTimeout(() => {
          this.showModal = false;

          // Navigate ONLY after modal was visible
        
        }, autoCloseMs);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
   
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }

  /* ===============================
     SUBMIT
     =============================== */
  onSubmit(f: NgForm): void {
    if (!f.valid || this.isLoading) return;

    this.isLoading = true;

    const payload: LoginRequest = {
      email: this.model.email.trim(),
      password: this.model.password,
    };

    this.authService.login(payload).subscribe({
     
    next: (res) => {
      this.isLoading = false;
      if (res?.success) {
        const role = res.data.user.role;
    
        
        this.showPopup('success', 'Login successful! Redirecting...', 1500);

        setTimeout(() => {
          const cleanRole = role.trim().toLowerCase();
          
          if (cleanRole === 'admin') {
          
            this.router.navigate(['/admin']);
          } else {
    
            this.router.navigate(['/home']);
          }
        }, 1600);  // Slightly longer than modal (1500ms)
      } else {
        this.showPopup('error', res?.error?.message || 'Login failed', 5000);
      }
    },
      error: (err) => {
        this.isLoading = false;

        let msg = 'Login failed. Please try again.';

        if (err.status === 401) {
          msg = 'Invalid email or password.';
        } else if (err.status === 0) {
          msg = 'Server unreachable. Please try again later.';
        } else if (err.error?.error?.message) {
          msg = err.error.error.message;
        } else if (err.error?.message) {
          msg = err.error.message;
        }

        this.showPopup('error', msg, 8000);
      }
    });
  }
}
