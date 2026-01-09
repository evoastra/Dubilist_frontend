import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

interface ListingsQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class ListingsService {

  private baseUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  getListings(query: ListingsQuery): Observable<any> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(this.baseUrl, { params });
  }

  getSingleListing(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
