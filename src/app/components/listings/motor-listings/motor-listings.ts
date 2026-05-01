import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';
import { TranslateModule } from '@ngx-translate/core';

/* =====================
   INTERFACE
===================== */
export interface MotorImage {
  imageUrl: string;
}


export interface MotorsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: MotorImage[];

  year: number;
  make: string;
  model: string;
  mileage: string;
  fuel: string;
  transmission: string;
  condition: string;

  description?: string;

  sellerName: string;
  sellerPhone: string;
  sellerImage: string;

  isFavorite: boolean;
}

@Component({
  selector: 'app-motors-listings',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './motor-listings.html',
  styleUrls: ['./motor-listings.css']
})
export class MotorListingsComponent implements OnInit {

  /* =====================
     DATA
  ===================== */
  allListings: MotorsListing[] = [];
  filteredListings: MotorsListing[] = [];
  paginatedListings: MotorsListing[] = [];

  selectedListing: MotorsListing | null = null;

  /* =====================
     STATE
  ===================== */
  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;
  isLoggedIn = false;

  /* =====================
     SKELETON
  ===================== */
  skeletonArray = Array.from({ length: 12 });

  /* =====================
     PAGINATION
  ===================== */
  pageSize = 12;
  currentPage = 1;

  /* =====================
     DETAIL VIEW
  ===================== */
  currentImageIndex = 0;

  /* =====================
     SEARCH (kept)
  ===================== */
  searchQuery = '';

  /* =====================
     REPORT MODAL
  ===================== */
  showReportModal = false;
  reportListingId: number | null = null;
  reportReason = '';
  reportDetails = '';
  isReporting = false;

  reportReasons = [
    'Fraud / Scam',
    'Inappropriate Content',
    'Duplicate Listing',
    'Wrong Information',
    'Other'
  ];
  /* =====================
   FILTER STUBS (TEMP)
   Required for template binding
===================== */

// Fuel
fuels: string[] = [];
selectedFuel = '';
selectFuel(_: string): void {}

// Transmission
transmissions: string[] = [];
selectedTransmission = '';
selectTransmission(_: string): void {}

// Condition
conditions: string[] = [];
selectedCondition = '';
selectCondition(_: string): void {}
isConditionSelected(_: string): boolean {
  return false;
}

// Apply / Search
applyFilters(): void {}


  onSearch(): void {
     let data = [...this.allListings];
      if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(
        l =>
          l.title.toLowerCase().includes(q)
      );
    }
     this.filteredListings = data;
    this.resetPagination();
  }

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /* =====================
     INIT
  ===================== */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.fetchListings();
  }

  /* =====================
     FETCH
  ===================== */
  fetchListings(): void {
    this.isLoading = true;

    this.listingsService.getAllListings(1).subscribe({
      next: (res: any) => {
        const mapped: MotorsListing[] =
          res.data.map((l: any) => this.mapBackendListing(l));

        if (!this.isLoggedIn) {
          this.setListings(mapped);
          return;
        }

        this.listingsService.getFavoriteListingIds().subscribe({
          next: (favRes: any) => {
            const favIds: number[] = favRes || [];
            mapped.forEach(l => {
              l.isFavorite = favIds.includes(l.id);
            });
            this.setListings(mapped);
          },
          error: () => this.setListings(mapped)
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  private setListings(listings: MotorsListing[]): void {
    this.allListings = listings;
    this.filteredListings = [...listings];
    this.resetPagination();
    this.isLoading = false;
  }

  /* =====================
     INFINITE SCROLL (STABLE)
  ===================== */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isFetchingMore || this.allLoaded) return;

    if (isPlatformBrowser(this.platformId)) {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (nearBottom) {
        this.loadMore();
      }
    }
  }

  loadMore(): void {
    this.isFetchingMore = true;
    setTimeout(() => {
      this.currentPage++;
      this.appendPage();
      this.isFetchingMore = false;
    }, 400);
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.allLoaded = false;
    this.paginatedListings = [];
    this.appendPage();
  }

  appendPage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const chunk = this.filteredListings.slice(start, end);

    if (!chunk.length) {
      this.allLoaded = true;
      return;
    }

    this.paginatedListings.push(...chunk);
  }

  /* =====================
     FAVORITES
  ===================== */
  toggleFavorite(listing: MotorsListing, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const prev = listing.isFavorite;
    listing.isFavorite = !prev;

    const req = listing.isFavorite
      ? this.listingsService.addToFavorites(listing.id)
      : this.listingsService.removeFromFavorites(listing.id);

    req.subscribe({
      error: () => {
        listing.isFavorite = prev;
        alert('Unable to update favorite');
      }
    });
  }

  /* =====================
     DETAIL VIEW
  ===================== */
  viewListing(id: number): void {
    this.listingsService.getSingleListing(id).subscribe({
      next: (res: any) => {
        this.selectedListing = this.mapBackendListing(res.data);
        this.currentImageIndex = 0;
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: () => alert('Unable to load listing')
    });
  }

  closeDetail(): void {
    this.selectedListing = null;
  }

  previousImage(): void {
    if (!this.selectedListing) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage(): void {
    if (!this.selectedListing) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) %
      this.selectedListing.images.length;
  }

  selectImage(i: number): void {
    this.currentImageIndex = i;
  }

  /* =====================
     CONTACT (AUTH GUARDED)
  ===================== */
  callSeller(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.selectedListing?.sellerPhone && isPlatformBrowser(this.platformId)) {
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
    }
  }

  chatWhatsApp(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.selectedListing?.sellerPhone) return;

    const phone = this.selectedListing.sellerPhone.replace(/\D/g, '');
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  }

  startChatWithSeller(listing: MotorsListing): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.chatService.createOrGetRoom(listing.id).subscribe({
      next: (res: any) => {
        const roomId = res?.data?.id;
        if (roomId) {
          this.router.navigate(['/my-chats'], {
            queryParams: { roomId }
          });
        }
      },
      error: () => alert('Unable to start chat')
    });
  }

  /* =====================
     REPORT LISTING
  ===================== */
  reportAd(id: number): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.reportListingId = id;
    this.reportReason = '';
    this.reportDetails = '';
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportListingId = null;
  }

  submitReport(): void {
    if (!this.reportListingId || !this.reportReason.trim()) {
      alert('Please select a reason');
      return;
    }

    this.isReporting = true;

    this.listingsService.reportListing(this.reportListingId, {
      reason: this.reportReason,
      details: this.reportDetails
    }).subscribe({
      next: () => {
        this.isReporting = false;
        this.closeReportModal();
        alert('Report submitted successfully ✅');
      },
      error: (err: any) => {
        this.isReporting = false;
        alert(
          err?.error?.message ||
          err?.message ||
          'Failed to submit report'
        );
      }
    });
  }

  /* =====================
     BACKEND MAPPER
  ===================== */
  mapBackendListing(l: any): MotorsListing {
    const details = l.motorDetails;
   const images = (l?.images || []).map((img: any) => ({
    imageUrl: img.imageUrl
  }));
  const allImages = [...images];

    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'UAE',

       image: allImages[0]?.imageUrl ?? 'assets/placeholder.png',
      images: allImages,

      year: details?.year,
      make: details?.make,
      model: details?.model,
      mileage: details?.kilometres
        ? `${details.kilometres.toLocaleString()} km`
        : '0 km',

      fuel: details?.fuelType,
      transmission: details?.transmission,
      condition: details?.condition,

      description: l.description,

      sellerName: l.user?.name || 'Private Seller',
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}
