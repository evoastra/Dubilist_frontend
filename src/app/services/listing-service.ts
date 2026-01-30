import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ListingsService {

  private baseUrl = `${environment.apiUrl}/api/listings`;
  private usersUrl = `${environment.apiUrl}/api/users`;
  private favoritesUrl = `${environment.apiUrl}/api/favorites`;

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Get ALL listings (optionally by category)
   * Frontend handles filter / sort / pagination
   */
  getAllListings(categoryId?: number): Observable<any> {
    let params = new HttpParams();

    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get(this.baseUrl, { params });
  }

  /**
   * 🔹 Optional: paginated fetch (if ever needed)
   */
  getListingsPaginated(
    categoryId: number,
    page = 1,
    limit = 50
  ): Observable<any> {
    const params = new HttpParams()
      .set('categoryId', categoryId.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(this.baseUrl, { params });
  }

  /**
   * 🔹 Get single listing (all categories)
   */
  getSingleListing(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  /**
   * 🔹 Create listing
   */
  createListing(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  /**
   * 🔹 Update listing
   */
  updateListing(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * 🔹 Delete listing (soft delete)
   */
  deleteListing(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
   getMyListings(): Observable<any> {
     return this.http.get(`${this.usersUrl}/me/listings`);
  }

  getMyFavorites(): Observable<any> {
    return this.http.get(this.favoritesUrl);
  }

   getFavoriteListingIds(): Observable<number[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.favoritesUrl}`).pipe(
      map((response: any) => response.data.map((fav: any) => fav.listing.id))
    );
  }

  addToFavorites(listingId: number): Observable<any> {
    return this.http.post(`${this.favoritesUrl}/${listingId}`, {});
  }

  removeFromFavorites(listingId: number): Observable<any> {
    return this.http.delete(`${this.favoritesUrl}/${listingId}`);
  }

  /**
   * 🔹 Mark listing as sold
   */
  markAsSold(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/sold`, {});
  }
}
