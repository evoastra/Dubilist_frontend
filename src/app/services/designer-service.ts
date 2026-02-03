// src/app/services/designer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DesignerService {

  private DESIGNER_API = `${environment.apiUrl}/api/designers`;
  private BOOKING_API = `${environment.apiUrl}/api/bookings`;
  private UPLOAD_API = `${environment.apiUrl}/api/upload`;

  constructor(private http: HttpClient) {}

  /* =====================================================
     DESIGNERS – PUBLIC
  ===================================================== */

  getAllDesigners(): Observable<any> {
    return this.http.get<any>(this.DESIGNER_API);
  }

  getDesignerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}`);
  }

  getNearbyDesigners(lat: number, lng: number, radius = 50): Observable<any> {
    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lng)
      .set('radius', radius);
    return this.http.get<any>(`${this.DESIGNER_API}/location/nearby`, { params });
  }

  getDesignerPortfolio(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}/portfolio`);
  }

  /** CLIENT: Get my bookings */
getUserBookings(): Observable<any[]> {
  return this.http.get<any[]>(`${this.BOOKING_API}`);
}


  getDesignerReviews(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}/reviews`);
  }

  /* ✅ MISSING EARLIER (API EXISTS) */
  getAvailability(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}/availability`);
  }

  /* =====================================================
     DESIGNER PROFILE (AUTHENTICATED)
  ===================================================== */

  createProfile(payload: any): Observable<any> {
    return this.http.post<any>(this.DESIGNER_API, payload);
  }

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/me/profile`);
  }

  updateProfile(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.DESIGNER_API}/${id}`, payload);
  }

  deleteProfile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.DESIGNER_API}/${id}`);
  }

  /* =====================================================
     PORTFOLIO
  ===================================================== */

  addPortfolioItem(designerId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.DESIGNER_API}/${designerId}/portfolio`,
      payload
    );
  }

  updatePortfolioItem(
    designerId: number,
    portfolioId: number,
    payload: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.DESIGNER_API}/${designerId}/portfolio/${portfolioId}`,
      payload
    );
  }

  deletePortfolioItem(
    designerId: number,
    portfolioId: number
  ): Observable<any> {
    return this.http.delete<any>(
      `${this.DESIGNER_API}/${designerId}/portfolio/${portfolioId}`
    );
  }

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  updateAvailability(designerId: number, payload: any): Observable<any> {
    return this.http.put<any>(
      `${this.DESIGNER_API}/${designerId}/availability`,
      payload
    );
  }

  /* =====================================================
     BOOKINGS – CLIENT
  ===================================================== */

  getMyBookings(): Observable<any> {
    return this.http.get<any>(this.BOOKING_API);
  }

  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_API}/${id}`);
  }

  /* ❌ FIXED: WRONG ENDPOINT BEFORE */
  createBooking(designerId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/designers/${designerId}`,
      {
        bookingType: 'consultation', // REQUIRED by backend
        ...payload
      }
    );
  }

  updateBooking(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BOOKING_API}/${id}`, payload);
  }

  cancelBooking(id: number, reason: string): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/cancel`,
      { reason }
    );
  }

  /* =====================================================
     BOOKINGS – DESIGNER
  ===================================================== */

  /* ❌ FIXED: RESPONSE IS { success, data } */
  getDesignerBookings(): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_API}/designer/my`);
  }

  acceptBooking(id: number, payload: any = {}): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/accept`,
      payload
    );
  }

  rejectBooking(id: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/reject`,
      payload
    );
  }

  completeBooking(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/complete`,
      {}
    );
  }

  markNoShow(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/no-show`,
      {}
    );
  }

  /* =====================================================
     REVIEWS
  ===================================================== */

  createReview(bookingId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${bookingId}/review`,
      payload
    );
  }

  respondToReview(bookingId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${bookingId}/review/response`,
      payload
    );
  }

  /* =====================================================
     IMAGE UPLOADS
  ===================================================== */

  uploadSingleImage(file: File, folder = 'listings'): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return this.http.post<any>(`${this.UPLOAD_API}/image`, formData);
  }

  uploadMultipleImages(files: File[], folder = 'listings'): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    return this.http.post<any>(`${this.UPLOAD_API}/images`, formData);
  }
}
