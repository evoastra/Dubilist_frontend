import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ListingsService {

  private baseUrl = `${environment.apiUrl}/api/listings`;
  private usersUrl = `${environment.apiUrl}/api/users`;
  private favoritesUrl = `${environment.apiUrl}/api/favorites`;
  private reportsUrl = `${environment.apiUrl}/api/reports`;
    private searchUrl = `${environment.apiUrl}/api/search`;



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
  reportListing(
  listingId: number,
  payload: { reason: string; details?: string }
): Observable<any> {

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  });

  return this.http.post(
    `${this.reportsUrl}/listing/${listingId}`,
    payload,
    { headers }
  );
}


  getJobApplications(listingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${listingId}/applications`);
  }

  // Get single application details
  getApplicationById(applicationId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/applications/${applicationId}`);
  }

  // Shortlist
  shortlistApplication(applicationId: number, notes?: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/applications/${applicationId}/shortlist`,
      { notes }
    );
  }

  // Accept
  acceptApplication(applicationId: number, notes?: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/applications/${applicationId}/accept`,
      { notes }
    );
  }

  // Reject
  rejectApplication(applicationId: number, notes?: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/applications/${applicationId}/reject`,
      { notes }
    );
  }


  uploadResume(file: File) {
  const formData = new FormData();
  formData.append('resume', file);

  return this.http.post(
    `${environment.apiUrl}/api/upload/resume`,
    formData
  );
}

applyToJob(listingId: number, payload: any) {
  return this.http.post(
    `${environment.apiUrl}/api/listings/${listingId}/apply`,
    payload
  );
}



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

  searchListings(params: {
    q?: string;
    categoryId?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {

    let httpParams = new HttpParams();

    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice);
    if (params.condition) httpParams = httpParams.set('condition', params.condition);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get(this.searchUrl, { params: httpParams });
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
    console.log('Deleting listing with id:', id);
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

  /**
   * 🔹 Get all categories
   */
  getCategories(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/categories`);
  }
}
