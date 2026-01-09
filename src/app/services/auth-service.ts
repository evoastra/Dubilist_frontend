import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';

/* =======================
    INTERFACES (RESTORING ALL)
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
  private readonly apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    const savedUser = localStorage.getItem('user_data');

    // Restore user state instantly from localStorage
    if (token && savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        this.logoutLocal();
      }
    }

    // Background check to verify if token is still valid
    if (token) {
      this.getMe().subscribe({
        error: () => this.logoutLocal()
      });
    }
  }

  /* AUTH ACTIONS */

  login(payload: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        tap((res) => {
          if (res.success) {
            this.setTokens(res.data.tokens);
            this.saveUserLocally(res.data.user);
          }
        })
      );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        tap((res) => {
          if (res.success) {
            this.setTokens(res.data.tokens);
            this.saveUserLocally(res.data.user);
          }
        })
      );
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/auth/me`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            this.saveUserLocally(res.data);
          }
        }),
        catchError((error) => {
          if (error.status === 401) this.logoutLocal();
          return throwError(() => error);
        })
      );
  }

  /* LOGOUT LOGIC */

  logout(): void {
    this.logoutLocal();
    this.router.navigate(['/login']);
  }

  logoutLocal(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
  }

  /* PERSISTENCE HELPERS */

  private saveUserLocally(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private setTokens(tokens: Tokens): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  /* GETTERS */

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

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }
}