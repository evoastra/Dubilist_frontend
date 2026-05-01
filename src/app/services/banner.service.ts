import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Banner {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
  description: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private readonly STORAGE_KEY = 'dubilist_promotional_banners';
  private bannersSubject = new BehaviorSubject<Banner[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
  }

  getBanners(): Observable<Banner[]> {
    return this.bannersSubject.asObservable();
  }

  addBanner(banner: Omit<Banner, 'id' | 'createdAt'>): void {
    const currentBanners = this.bannersSubject.value;
    const newBanner: Banner = {
      ...banner,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    
    const updatedBanners = [...currentBanners, newBanner];
    this.saveToStorage(updatedBanners);
  }

  deleteBanner(id: string): void {
    const updatedBanners = this.bannersSubject.value.filter(b => b.id !== id);
    this.saveToStorage(updatedBanners);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.bannersSubject.next(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing banners from storage', e);
        this.bannersSubject.next([]);
      }
    } else {
      // Add a default banner if empty
      const defaultBanners: Banner[] = [
        {
          id: 'def1',
          title: 'Looking for a Professional Interior Designer?',
          description: 'Find the perfect match for your dream space with our expert partners.',
          link: '/listings/interior-designers',
          imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200',
          createdAt: Date.now()
        }
      ];
      this.saveToStorage(defaultBanners);
    }
  }

  private saveToStorage(banners: Banner[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(banners));
    this.bannersSubject.next(banners);
  }
}
