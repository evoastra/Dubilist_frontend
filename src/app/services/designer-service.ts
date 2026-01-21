// src/app/services/designer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DesignerService {
  private DESIGNER_API = `${environment.apiUrl}/api/designers`;
  private UPLOAD_API = `${environment.apiUrl}/api/upload`;
  private BOOKING_API = `${environment.apiUrl}/api/bookings`;

  private FAV_KEY = 'designer_favourites';

  constructor(private http: HttpClient) {}

  /* =====================================================
   🔹 IMAGE & FILE UPLOADS
  ===================================================== */

  uploadSingleImage(file: File, folder: string = 'listings'): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return this.http.post<any>(`${this.UPLOAD_API}/image`, formData);
  }

  uploadMultipleImages(files: File[], folder: string = 'listings'): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    return this.http.post<any>(`${this.UPLOAD_API}/images`, formData);
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<any>(`${this.UPLOAD_API}/resume`, formData);
  }

  deleteImage(s3Key: string): Observable<any> {
    return this.http.delete<any>(`${this.UPLOAD_API}/${s3Key}`);
  }

  getPresignedUrl(payload: {
    filename: string;
    contentType: string;
    folder?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.UPLOAD_API}/presigned-url`, payload);
  }

  /* =====================================================
   🔹 PUBLIC DESIGNER DATA
  ===================================================== */

  /**
   * 🔴 IMPORTANT:
   * This now ALWAYS fetches ALL designers.
   * NO filters sent to backend.
   * Filtering is done client-side.
   */
  getAllDesigners(): Observable<any[]> {
    return this.http.get<any[]>(this.DESIGNER_API).pipe(
      map((res: any) => Array.isArray(res) ? res : (res.data || []))
    );
  }

  getDesignerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}`);
  }

  getDesignerAvailability(id: number): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/${id}/availability`);
  }

  /* =====================================================
   🔹 CLIENT-SIDE FILTER HELPERS (OPTIONAL USE)
  ===================================================== */

  filterByCity(list: any[], city: string): any[] {
    return city
      ? list.filter(d => d.city?.toLowerCase() === city.toLowerCase())
      : list;
  }

  filterByStyle(list: any[], style: string): any[] {
    return style
      ? list.filter(d => d.specializations?.includes(style))
      : list;
  }

  filterByRate(
    list: any[],
    min?: number | null,
    max?: number | null
  ): any[] {
    return list.filter(d => {
      if (min !== null && d.hourlyRate < min!) return false;
      if (max !== null && d.hourlyRate > max!) return false;
      return true;
    });
  }

  sortDesigners(list: any[], sort: string): any[] {
    switch (sort) {
      case 'rating':
        return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price_low':
        return [...list].sort((a, b) => a.hourlyRate - b.hourlyRate);
      case 'price_high':
        return [...list].sort((a, b) => b.hourlyRate - a.hourlyRate);
      default:
        return list;
    }
  }

  /* =====================================================
   🔹 FAVOURITES (NEW FEATURE)
  ===================================================== */

  getFavourites(): number[] {
    return JSON.parse(localStorage.getItem(this.FAV_KEY) || '[]');
  }

  isFavourite(designerId: number): boolean {
    return this.getFavourites().includes(designerId);
  }

  toggleFavourite(designerId: number): void {
    const favs = this.getFavourites();
    const index = favs.indexOf(designerId);

    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(designerId);
    }

    localStorage.setItem(this.FAV_KEY, JSON.stringify(favs));
  }

  /* =====================================================
   🔹 BOOKINGS (CLIENT)
  ===================================================== */

  createBooking(designerId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.DESIGNER_API}/${designerId}/bookings`,
      payload
    );
  }

  /* =====================================================
   🔹 DESIGNER PORTAL (AUTH REQUIRED)
  ===================================================== */

  getDesignerBookings(): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_API}/designer/my`);
  }

  updateBookingStatus(
    bookingId: number,
    action: 'accept' | 'reject',
    payload: any = {}
  ): Observable<any> {
    return this.http.post<any>(
      `${this.BOOKING_API}/${bookingId}/${action}`,
      payload
    );
  }

  /* =====================================================
   🔹 DESIGNER PROFILE
  ===================================================== */

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.DESIGNER_API}/me/profile`);
  }

  createProfile(payload: any): Observable<any> {
    return this.http.post<any>(this.DESIGNER_API, payload);
  }

  updateProfile(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.DESIGNER_API}/${id}`, payload);
  }
}
