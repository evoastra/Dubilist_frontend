import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertyListingService {
  private API = 'http://localhost:3000/api/listings';

  constructor(private http: HttpClient) {}

  /** ✅ ONE SIMPLE API CALL */
  getPropertyListings(page = 1, limit = 50): Observable<any> {
    return this.http.get(
      `${this.API}?page=${page}&limit=${limit}&categoryId=3`
    );
  }

  getSingleListing(id: number): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }
}
