import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

type SignupModel = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-sign-up.html',
  styleUrls: ['./auth-sign-up.css']
})
export class AuthSignupComponent {
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  model: SignupModel = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get passwordsMatch(): boolean {
    return this.model.password === this.model.confirmPassword;
  }

  get canSubmit(): boolean {
    return (
      !!this.model.firstName.trim() &&
      !!this.model.lastName.trim() &&
      !!this.model.email.trim() &&
      !!this.model.phone.trim() &&
      this.model.password.length >= 8 &&
      this.passwordsMatch &&
      this.model.termsAccepted &&
      !this.isLoading
    );
  }

  toggle(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(form: NgForm) {
    if (!form.valid || !this.canSubmit) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      name: `${this.model.firstName.trim()} ${this.model.lastName.trim()}`,
      email: this.model.email.trim(),
      phone: this.model.phone.trim(),
      password: this.model.password,
      role: 'buyer' as const   // backend default
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        // After successful signup, you can either redirect to login or auto-login
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          'Signup failed. Please try again.';
      }
    });
  }
}
