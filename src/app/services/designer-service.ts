// src/app/services/designer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DesignerService {

  private API = `${environment.apiUrl}/designers`;

  constructor(private http: HttpClient) {}

  /** 🔹 PUBLIC ROUTES */

  getAllDesigners(filters?: {
    city?: string;
    style?: string;
    minRate?: number;
    maxRate?: number;
    sort?: string;
  }): Observable<any[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value as any);
        }
      });
    }

    return this.http.get<any[]>(this.API, { params });
  }

  getDesignerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }

  getNearbyDesigners(lat: number, lng: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/location/nearby`,
      { params: { latitude: lat, longitude: lng } }
    );
  }

  getDesignerPortfolio(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${id}/portfolio`);
  }

  getDesignerReviews(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${id}/reviews`);
  }

  getDesignerAvailability(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}/availability`);
  }

  /** 🔹 BOOKING */

  createBooking(designerId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.API}/${designerId}/bookings`,
      payload
    );
  }

  /** 🔹 AUTHENTICATED DESIGNER */

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.API}/me/profile`);
  }

  updateProfile(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}`, payload);
  }

  deleteProfile(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
