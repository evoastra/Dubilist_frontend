import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';

/* =======================
   INTERFACE
======================= */
export interface PropertyListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: string;
  location: string;
  description?: string;

  image: string;
  images: string[];

  propertyType?: string;
  furnishing?: string;
  amenities?: string[];

  sellerName?: string;
  sellerPhone?: string;
  sellerImage?: string;

  isFavorite: boolean;
}

@Component({
  selector: 'app-property-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-listings.html',
  styleUrls: ['./property-listings.css']
})
export class PropertyListingsComponent implements OnInit {

  /* =======================
     DATA
  ======================= */
  listings: PropertyListing[] = [];
  filteredListings: PropertyListing[] = [];
  visibleListings: PropertyListing[] = [];

  selectedListing: PropertyListing | null = null;

  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;

  isLoggedIn = false;

  /* =======================
     SKELETON
  ======================= */
  skeletonArray = Array.from({ length: 12 });

  /* =======================
     SEARCH
  ======================= */
  searchQuery = '';

  /* =======================
     FILTERS (kept to satisfy HTML)
  ======================= */
  propertyTypes = ['Apartment', 'Villa', 'Studio'];
  selectedPropertyTypes: string[] = [];

  furnishingOptions = ['Any', 'Furnished', 'Unfurnished'];
  selectedFurnishing = 'any';

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'Balcony', 'Security'];
  selectedAmenities: string[] = [];

  /* =======================
     INFINITE SCROLL
  ======================= */
  pageSize = 12;
  currentPage = 1;

  /* =======================
     DETAIL VIEW
  ======================= */
  currentImageIndex = 0;

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  /* =======================
     INIT
  ======================= */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadListings();
  }

  /* =======================
     LOAD LISTINGS
  ======================= */
  loadListings(): void {
    this.isLoading = true;

    this.listingsService.getAllListings(3).subscribe({
      next: (res: any) => {
        const mapped = res.data.map((l: any) =>
          this.mapBackendListing(l)
        );

        if (!this.isLoggedIn) {
          this.listings = mapped;
          this.applyFilters();
          this.isLoading = false;
          return;
        }

        this.listingsService.getFavoriteListingIds().subscribe({
          next: (favIds: number[]) => {
            const favSet = new Set<number>(favIds);
            this.listings = mapped.map((l: PropertyListing) => ({
              ...l,
              isFavorite: favSet.has(l.id)
            }));
            this.applyFilters();
            this.isLoading = false;
          },
          error: () => {
            this.listings = mapped;
            this.applyFilters();
            this.isLoading = false;
          }
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  /* =======================
     FILTERS (SAFE DEFAULTS)
  ======================= */
  applyFilters(): void {
    let data = [...this.listings];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    }

    if (this.selectedPropertyTypes.length) {
      data = data.filter(l =>
        l.propertyType &&
        this.selectedPropertyTypes.includes(l.propertyType)
      );
    }

    if (this.selectedFurnishing !== 'any') {
      data = data.filter(
        l => l.furnishing?.toLowerCase() === this.selectedFurnishing
      );
    }

    if (this.selectedAmenities.length) {
      data = data.filter(l =>
        this.selectedAmenities.every(a => l.amenities?.includes(a))
      );
    }

    this.filteredListings = data;
    this.resetInfiniteScroll();
  }

  /* =======================
     FILTER HELPERS (HTML-safe)
  ======================= */
  togglePropertyType(type: string): void {
    const i = this.selectedPropertyTypes.indexOf(type);
    i >= 0
      ? this.selectedPropertyTypes.splice(i, 1)
      : this.selectedPropertyTypes.push(type);
  }

  selectFurnishing(option: string): void {
    this.selectedFurnishing = option.toLowerCase();
  }

  toggleAmenity(amenity: string): void {
    const i = this.selectedAmenities.indexOf(amenity);
    i >= 0
      ? this.selectedAmenities.splice(i, 1)
      : this.selectedAmenities.push(amenity);
  }

  onSearch(): void {
    this.applyFilters();
  }

  /* =======================
     INFINITE SCROLL
  ======================= */
  resetInfiniteScroll(): void {
    this.currentPage = 1;
    this.allLoaded = false;
    this.visibleListings = [];
    this.loadNextPage();
  }

  loadNextPage(): void {
    if (this.isFetchingMore || this.allLoaded) return;

    this.isFetchingMore = true;

    setTimeout(() => {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;

      const chunk = this.filteredListings.slice(start, end);

      if (!chunk.length) {
        this.allLoaded = true;
      } else {
        this.visibleListings.push(...chunk);
        this.currentPage++;
      }

      this.isFetchingMore = false;
    }, 500);
  }

  onScroll(): void {
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 200;

    if (nearBottom) this.loadNextPage();
  }

  /* =======================
     FAVORITES
  ======================= */
  toggleFavorite(listing: PropertyListing, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

    if (listing.isFavorite) {
      this.listingsService
        .removeFromFavorites(listing.id)
        .subscribe(() => (listing.isFavorite = false));
    } else {
      this.listingsService
        .addToFavorites(listing.id)
        .subscribe(() => (listing.isFavorite = true));
    }
  }

  /* =======================
     DETAIL VIEW
  ======================= */
  viewListing(id: number): void {
   this.listingsService.getSingleListing(id).subscribe(listing=>{
      this.selectedListing = this.mapBackendListing(listing.data);
   })
    this.currentImageIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetail(): void {
    this.selectedListing = null;
  }

  previousImage(): void {
    if (!this.selectedListing || this.selectedListing.images.length < 2) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage(): void {
    if (!this.selectedListing || this.selectedListing.images.length < 2) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) %
      this.selectedListing.images.length;
  }

  selectImage(i: number): void {
    this.currentImageIndex = i;
  }

  /* =======================
     CONTACT
  ======================= */
  callSeller(): void {
    if (this.selectedListing?.sellerPhone) {
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
    }
  }

  chatWhatsApp(): void {
    if (!this.selectedListing?.sellerPhone) return;
    const phone = this.selectedListing.sellerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  startChatWithSeller(listing: PropertyListing): void {
    if (!this.isLoggedIn) return;

    this.chatService.createOrGetRoom(listing.id).subscribe({
      next: (res: any) => {
        const roomId = res?.data?.id;
        if (roomId) {
          this.router.navigate(['/my-chats'], {
            queryParams: { roomId }
          });
        }
      }
    });
  }

  /* =======================
     MAPPER
  ======================= */
  mapBackendListing(l: any): PropertyListing {
    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      type: l.listingType || 'For Sale',
      location: l.city,
      description: l.description,

      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || [],

      propertyType: l.propertyDetails?.propertyType,
      furnishing: l.propertyDetails?.furnishing,
      amenities: l.propertyDetails?.amenities || [],

      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: false
    };
  }
}
