import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyListingService } from '../../../services/property-listing-service';

export interface PropertyListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: string;
  location: string;
  description?: string;

  image: string;
  images?: string[];

  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnishing?: string;
  propertyType?: string;
  amenities?: string[];

  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerImage?: string;
}

@Component({
  selector: 'app-property-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-listings.html',
  styleUrls: ['./property-listings.css']
})
export class PropertyListingsComponent implements OnInit {

  /* ================= DATA ================= */
  listings: PropertyListing[] = [];
  filteredListings: PropertyListing[] = [];
  selectedListing: PropertyListing | null = null;

  isLoading = false;

  /* ================= SEARCH & SORT ================= */
  searchQuery = '';
  selectedSortBy: 'popular' | 'newest' | 'price-low' | 'price-high' = 'popular';

  /* ================= FILTERS ================= */
  propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Studio'];
  selectedPropertyTypes: string[] = [];

  locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'];
  selectedLocation = 'Dubai';

  minPrice = 0;
  maxPrice = 0;

  bedrooms = 0;
  bathrooms = 0;

  minArea = 0;
  maxArea = 0;

  furnishingOptions = ['Any', 'Furnished', 'Unfurnished'];
  selectedFurnishing = 'any';

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'Balcony', 'Security'];
  selectedAmenities: string[] = [];

  /* ================= PAGINATION ================= */
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  /* ================= DETAIL VIEW ================= */
  currentImageIndex = 0;
  isFavorite = false;

  constructor(private service: PropertyListingService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  /* ================= API (ONCE ONLY) ================= */
  loadListings(): void {
    this.isLoading = true;

    this.service.getPropertyListings(1, 100).subscribe({
      next: res => {
        this.listings = res.data.map((l: any): PropertyListing => ({
          id: l.id,
          title: l.title,
          price: Number(l.price),
          currency: l.currency || 'AED',
          type: l.listingType || 'For Sale',
          location: l.city,
          description: l.description,

          image: l.images?.[0]?.imageUrl || 'assets/images/no-image.png',
          images: l.images?.map((i: any) => i.imageUrl) || [],

          bedrooms: l.propertyDetails?.bedrooms,
          bathrooms: l.propertyDetails?.bathrooms,
          area: l.propertyDetails?.areaSqft,
          furnishing: l.propertyDetails?.furnishing,
          propertyType: l.propertyDetails?.propertyType,
          amenities: l.propertyDetails?.amenities || [],

          sellerName: l.user?.name,
          sellerPhone: l.contactPhone,
          sellerEmail: l.contactEmail,
          sellerImage: l.user?.avatarUrl
        }));

        this.applyAllFilters();
        this.isLoading = false;
      },
      error: err => {
        console.error('Listings error', err);
        this.isLoading = false;
      }
    });
  }

  /* ================= FILTER / SORT ================= */
  applyAllFilters(): void {
    let data = [...this.listings];

    /* Search */
    if (this.searchQuery.trim()) {
      data = data.filter(l =>
        l.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    /* Location */
    if (this.selectedLocation) {
      data = data.filter(l => l.location.includes(this.selectedLocation));
    }

    /* Property Type */
    if (this.selectedPropertyTypes.length) {
      data = data.filter(l =>
        l.propertyType && this.selectedPropertyTypes.includes(l.propertyType)
      );
    }

    /* Furnishing */
    if (this.selectedFurnishing !== 'any') {
      data = data.filter(l =>
        l.furnishing?.toLowerCase() === this.selectedFurnishing
      );
    }

    /* Amenities */
    if (this.selectedAmenities.length) {
      data = data.filter(l =>
        this.selectedAmenities.every(a => l.amenities?.includes(a))
      );
    }

    /* Numeric filters */
    if (this.minPrice) data = data.filter(l => l.price >= this.minPrice);
    if (this.maxPrice) data = data.filter(l => l.price <= this.maxPrice);
    if (this.bedrooms) data = data.filter(l => (l.bedrooms || 0) >= this.bedrooms);
    if (this.bathrooms) data = data.filter(l => (l.bathrooms || 0) >= this.bathrooms);
    if (this.minArea) data = data.filter(l => (l.area || 0) >= this.minArea);
    if (this.maxArea) data = data.filter(l => (l.area || 0) <= this.maxArea);

    /* Sorting */
    switch (this.selectedSortBy) {
      case 'price-low':
        data.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        data.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        data.sort((a, b) => b.id - a.id);
        break;
    }

    this.totalPages = Math.ceil(data.length / this.pageSize);
    this.filteredListings = data.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  /* ================= UI HANDLERS ================= */
  onSearch(): void {
    this.currentPage = 1;
    this.applyAllFilters();
  }

  selectSortBy(sort: any): void {
    this.selectedSortBy = sort;
    this.applyAllFilters();
  }

  togglePropertyType(type: string): void {
    const i = this.selectedPropertyTypes.indexOf(type);
    i >= 0 ? this.selectedPropertyTypes.splice(i, 1) : this.selectedPropertyTypes.push(type);
  }

  isPropertyTypeSelected(type: string): boolean {
    return this.selectedPropertyTypes.includes(type);
  }

  selectFurnishing(option: string): void {
    this.selectedFurnishing = option.toLowerCase();
  }

  toggleAmenity(amenity: string): void {
    const i = this.selectedAmenities.indexOf(amenity);
    i >= 0 ? this.selectedAmenities.splice(i, 1) : this.selectedAmenities.push(amenity);
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.applyAllFilters();
  }

  /* ================= PAGINATION ================= */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyAllFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) this.onPageChange(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.onPageChange(this.currentPage + 1);
  }

  /* ================= DETAIL VIEW ================= */
  viewListing(id: number): void {
    this.selectedListing = this.listings.find(l => l.id === id) || null;
    this.currentImageIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetail(): void {
    this.selectedListing = null;
  }

  previousImage(): void {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage(): void {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.selectedListing.images.length;
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

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

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  reportAd(): void {
    alert('Reported successfully');
  }
  /* ================= BEDROOM COUNTERS ================= */
incrementBedrooms(): void {
  this.bedrooms++;
}

decrementBedrooms(): void {
  if (this.bedrooms > 0) {
    this.bedrooms--;
  }
}

/* ================= BATHROOM COUNTERS ================= */
incrementBathrooms(): void {
  this.bathrooms++;
}

decrementBathrooms(): void {
  if (this.bathrooms > 0) {
    this.bathrooms--;
  }
}

}
