import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private baseUrl = environment.apiUrl; // https://api.dubilist.ae/api

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken()}`,
        'Content-Type': 'application/json'
      })
    };
  }

  /* ================= LISTINGS ================= */

  getListings(
    status: 'pending' | 'approved' | 'rejected',
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/admin/listings`,
        {
          ...this.getAuthHeaders(),
          params: { status, page, limit }
        }
      )
    );
  }
  getListingById(id: number): Promise<any> {
  return firstValueFrom(
    this.http.get(
      `${this.baseUrl}/listings/${id}`,
      this.getAuthHeaders()
    )
  );
}

  getUserById(id: number): Promise<any> {
  return firstValueFrom(
    this.http.get(`${this.baseUrl}/admin/users/${id}`, this.getAuthHeaders())
  );
}


  updateListingStatus(
    id: number,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<any> {
    const payload: any = { status };
    if (status === 'rejected' && reason) {
      payload.reasonRejected = reason;
    }

    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/admin/listings/${id}/status`,
        payload,
        this.getAuthHeaders()
      )
    );
  }

  /* ================= USERS ================= */

  getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/admin/users`,
        {
          ...this.getAuthHeaders(),
          params: { page, limit, ...(search ? { search } : {}) }
        }
      )
    );
  }

  /* ================= REPORTS ================= */

  getReports(
    type: 'listing' | 'user' | 'all' = 'listing',
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/admin/reports`,
        {
          ...this.getAuthHeaders(),
          params: { type, page, limit }
        }
      )
    );
  }

  /* ================= REMOVE LISTING ================= */

  removeListing(id: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/admin/listings/${id}`,
        this.getAuthHeaders()
      )
    );
  }
}
