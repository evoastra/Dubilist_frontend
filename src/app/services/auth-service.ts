import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

/* =======================
   INTERFACES
   ======================= */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt?: string | Date;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: User;
  tokens: Tokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { message: string } };

/* =======================
   AUTH SERVICE
   ======================= */

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  /* =======================
     SESSION RESTORE
     ======================= */

  private restoreSession(): void {
    const token = this.getAccessToken();
    const savedUser = localStorage.getItem('user_data');

    if (token && savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
        this.validateSession();
      } catch {
        this.logoutLocal();
      }
    }
  }

  private validateSession(): void {
    this.getMe().subscribe({
      error: () => this.logoutLocal()
    });
  }

  /* =======================
     AUTH ACTIONS
     ======================= */

  login(payload: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        tap(res => {
          if (res.success) {
            this.persistAuth(res.data);
          }
        })
      );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        tap(res => {
          if (res.success) {
            this.persistAuth(res.data);
          }
        })
      );
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(res => {
          if (res.success) {
            this.saveUser(res.data);
          }
        }),
        catchError(err => {
          if (err.status === 401) this.logoutLocal();
          return throwError(() => err);
        })
      );
  }

  /* =======================
     LOGOUT
     ======================= */

  logout(): void {
    this.logoutLocal();
    this.router.navigate(['auth/login']);
  }

  private logoutLocal(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
  }

  /* =======================
     STORAGE HELPERS
     ======================= */

  private persistAuth(data: AuthData): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
    localStorage.setItem('user_data', JSON.stringify(data.user));

    this.currentUserSubject.next(data.user);
  }

  private saveUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  /* =======================
     GETTERS (USED BY GUARD)
     ======================= */

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}
