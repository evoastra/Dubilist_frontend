import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';

export interface PropertyImage {
  imageUrl: string;
}

export interface PropertyListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: string;
  location: string;
  description?: string;

  image: string;
  images: PropertyImage[];

  propertyType?: string;
  furnishing?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSize?: number;
  halls?: number;
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

  /* ===================== DATA ===================== */
  allListings: PropertyListing[] = [];
  filteredListings: PropertyListing[] = [];
  paginatedListings: PropertyListing[] = [];

  selectedListing: PropertyListing | null = null;

  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;
  isLoggedIn = false;

  /* ===================== SKELETON ===================== */
skeletonArray = Array.from({ length: 12 });


  /* ===================== SEARCH & FILTERS ===================== */
  searchQuery = '';

  propertyTypes = ['Apartment', 'Villa', 'Studio'];
  selectedPropertyTypes: string[] = [];

  furnishingOptions = ['Any', 'Furnished', 'Unfurnished'];
  selectedFurnishing = 'any';

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'Balcony', 'Security'];
  selectedAmenities: string[] = [];

  /* ===================== PAGINATION ===================== */
  pageSize = 12;
  currentPage = 1;

  /* ===================== DETAIL VIEW ===================== */
  currentImageIndex = 0;

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.fetchListings();
  }

  /* ===================== FETCH ===================== */
  fetchListings(): void {
    this.isLoading = true;

    this.listingsService.getAllListings(3).subscribe({
      next: (res: any) => {
        const mapped:PropertyListing[] = res.data.map((l: any) =>
          this.mapBackendListing(l)
        );

        if (!this.isLoggedIn) {
          this.setListings(mapped);
          return;
        }

       this.listingsService.getFavoriteListingIds().subscribe({
        next: (favRes: any) => {
          const favoriteIds: number[] = favRes || [];
        
          mapped.forEach(l => {
            l.isFavorite = favoriteIds.includes(l.id);
          });

          this.setListings(mapped); // ✅ render AFTER favorites
        },
        error: () => {
          this.setListings(mapped);
        }
      });
      },
      error: () => (this.isLoading = false)
    });
  }

  private setListings(listings: PropertyListing[]): void {
    this.allListings = listings;
    this.filteredListings = [...listings];
    this.resetPagination();
    this.isLoading = false;
  }

  /* ===================== FILTERS ===================== */
  applyFilters(): void {
    let data = [...this.allListings];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    }

    if (this.selectedPropertyTypes.length) {
      data = data.filter(
        l => l.propertyType && this.selectedPropertyTypes.includes(l.propertyType)
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
    this.resetPagination();
  }

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

  /* ===================== PAGINATION ===================== */
  onScroll(): void {
    if (this.isFetchingMore || this.allLoaded) return;

    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 300;

    if (nearBottom) {
      this.isFetchingMore = true;
      setTimeout(() => {
        this.currentPage++;
        this.appendPage();
        this.isFetchingMore = false;
      }, 500);
    }
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

  /* ===================== FAVORITES ===================== */
  toggleFavorite(listing: PropertyListing, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

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

  /* ===================== DETAIL VIEW ===================== */
  viewListing(id: number): void {
    this.listingsService.getSingleListing(id).subscribe(res => {
      this.selectedListing = this.mapBackendListing(res.data);
    });
    this.currentImageIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  /* ===================== CONTACT ===================== */
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
      }
    });
  }

  /* ===================== MAPPER ===================== */
  mapBackendListing(l: any): PropertyListing {
    const details = l.propertyDetails;
    
    const images = (l?.images || []).map((img: any) => ({
    imageUrl: img.imageUrl
  }));
   
  
const allImages = [...images];
    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      type: details?.listingType || 'For Rent',
      location: l.city || 'Dubai',
      description: l.description,

      image: allImages[0]?.imageUrl ?? 'assets/placeholder.png',
      images: allImages,

      propertyType: details?.propertyType,
      furnishing: details?.furnishing,
      bedrooms: details?.bedrooms,
      bathrooms: details?.bathrooms,
      areaSize: details?.areaSqft,
      halls: details?.halls,
      amenities: details?.amenities || [],

      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}