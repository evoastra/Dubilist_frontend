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

  private FAV_KEY = 'designer_favourites';

  constructor(private http: HttpClient) {}

  /* =====================================================
     DESIGNERS – PUBLIC
  ===================================================== */

  /** 1. Get all designers */
  getAllDesigners(): Observable<any[]> {
    return this.http.get<any[]>(this.DESIGNER_API);
  }

  /** 2. Get designer by ID */
  getDesignerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}`);
  }

  /** 3. Get nearby designers */
  getNearbyDesigners(lat: number, lng: number, radius = 50): Observable<any[]> {
    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lng)
      .set('radius', radius);
    return this.http.get<any[]>(`${this.DESIGNER_API}/location/nearby`, { params });
  }

  /** 4. Get designer portfolio */
  getDesignerPortfolio(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.DESIGNER_API}/${id}/portfolio`);
  }

  /** 5. Get designer reviews */
  getDesignerReviews(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.DESIGNER_API}/${id}/reviews`);
  }

  /** 6. Get designer availability */
  getDesignerAvailability(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}/availability`);
  }

  /* =====================================================
     DESIGNER PROFILE (AUTHENTICATED)
  ===================================================== */

  /** 7. Create designer profile */
  createProfile(payload: any): Observable<any> {
    return this.http.post<any>(this.DESIGNER_API, payload);
  }

  /** 8. Get my designer profile */
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/me/profile`);
  }

  /** 9. Update designer profile */
  updateProfile(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.DESIGNER_API}/${id}`, payload);
  }

  /** 10. Delete designer profile */
  deleteProfile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.DESIGNER_API}/${id}`);
  }

  /* =====================================================
     PORTFOLIO
  ===================================================== */

  /** 11. Add portfolio item */
  addPortfolioItem(designerId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.DESIGNER_API}/${designerId}/portfolio`,
      payload
    );
  }

  /** 12. Update portfolio item */
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

  /** 13. Delete portfolio item */
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

  /** 14. Update availability */
  updateAvailability(designerId: number, payload: any): Observable<any> {
    return this.http.put<any>(
      `${this.DESIGNER_API}/${designerId}/availability`,
      payload
    );
  }

  /* =====================================================
     BOOKINGS – CLIENT
  ===================================================== */

  /** 15. Get my bookings */
  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.BOOKING_API);
  }

  /** 16. Get booking by ID */
  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_API}/${id}`);
  }

  /** 17. Create booking */
  createBooking(designerId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.DESIGNER_API}/${designerId}/bookings`,
      payload
    );
  }

  /** 18. Update booking */
  updateBooking(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BOOKING_API}/${id}`, payload);
  }

  /** 19. Cancel booking */
  cancelBooking(id: number, reason: string): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/cancel`,
      { reason }
    );
  }

  /* =====================================================
     BOOKINGS – DESIGNER
  ===================================================== */

  /** 20. Get designer's bookings */
  getDesignerBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BOOKING_API}/designer/my`);
  }

  /** 21. Accept booking */
  acceptBooking(id: number, payload: any = {}): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/accept`,
      payload
    );
  }

  /** 22. Reject booking */
  rejectBooking(id: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/reject`,
      payload
    );
  }

  /** 23. Complete booking */
  completeBooking(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/complete`,
      {}
    );
  }

  /** 24. Mark no-show */
  markNoShow(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${id}/no-show`,
      {}
    );
  }

  /* =====================================================
     REVIEWS
  ===================================================== */

  /** 25. Create review */
  createReview(bookingId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${bookingId}/review`,
      payload
    );
  }

  /** 26. Respond to review */
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

  /* =====================================================
     FAVOURITES (LOCAL)
  ===================================================== */

}
