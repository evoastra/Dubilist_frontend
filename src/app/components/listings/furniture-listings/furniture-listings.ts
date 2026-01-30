import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';

export interface FurnitureListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: string[];

  condition?: string;
  material?: string;
  description?: string;

  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weight?: string;

  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerImage?: string;

  isFavorite: boolean;
}

@Component({
  selector: 'app-furniture-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './furniture-listings.html',
  styleUrls: ['./furniture-listings.css']
})
export class FurnitureListingsComponent implements OnInit {

  /* =====================
     DATA SOURCES
  ===================== */
  allListings: FurnitureListing[] = [];
  filteredListings: FurnitureListing[] = [];
  paginatedListings: FurnitureListing[] = [];

  selectedListing: FurnitureListing | null = null;

  /* =====================
     STATE
  ===================== */
  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;
  isLoggedIn = false;

  currentImageIndex = 0;

  /* =====================
     INFINITE SCROLL
  ===================== */
  pageSize = 12;
  currentPage = 1;

  /* =====================
     SEARCH & SORT
  ===================== */
  searchQuery = '';
  selectedSortBy = 'newest';

  /* =====================
     FILTERS
  ===================== */
  selectedFurnitureTypes: string[] = [];
  furnitureTypes = ['Sofa', 'Bed', 'Dining Table', 'Chair', 'Dressing Table'];

  selectedMaterials: string[] = [];
  materials = ['Wood', 'Metal', 'Plastic', 'Leather'];

  minPrice = 0;
  maxPrice = 0;

  selectedCondition = '';
  conditions = ['New', 'Like New', 'Used'];

  selectedLocation = '';
  locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'];

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private router: Router,
    private chatService:ChatService
  ) {}

  /* =====================
     INIT
  ===================== */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.fetchListings();
  }

  /* =====================
     FETCH FROM BACKEND
  ===================== */
  fetchListings(): void {
    this.isLoading = true;

    // categoryId = 6 → Furniture
    this.listingsService.getAllListings(6).subscribe({
      next: (res: any) => {
        const mapped: FurnitureListing[] =
          res.data.map((l: any) => this.mapBackendFurniture(l));

        if (!this.isLoggedIn) {
          this.setListings(mapped);
          return;
        }

        this.listingsService.getFavoriteListingIds().subscribe({
          next: (favRes: any) => {
            const favIds: number[] = favRes || [];
            mapped.forEach(l => (l.isFavorite = favIds.includes(l.id)));
            this.setListings(mapped);
          },
          error: () => this.setListings(mapped)
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  private setListings(listings: FurnitureListing[]): void {
    this.allListings = listings;
    this.filteredListings = [...listings];
    this.resetPagination();
    this.isLoading = false;
  }

  /* =====================
     FILTERS
  ===================== */
  toggleMaterial(material: string): void {
    const i = this.selectedMaterials.indexOf(material);
    i > -1 ? this.selectedMaterials.splice(i, 1) : this.selectedMaterials.push(material);
    this.applyFilters();
  }

  isMaterialSelected(material: string): boolean {
    return this.selectedMaterials.includes(material);
  }

  selectCondition(condition: string): void {
    this.selectedCondition = condition;
    this.applyFilters();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedCondition === condition;
  }

  selectSortBy(sort: string): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string): boolean {
    return this.selectedSortBy === sort;
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allListings];

    if (this.minPrice > 0) result = result.filter(l => l.price >= this.minPrice);
    if (this.maxPrice > 0) result = result.filter(l => l.price <= this.maxPrice);

    if (this.selectedCondition) {
      result = result.filter(l => l.condition === this.selectedCondition);
    }

    if (this.selectedMaterials.length) {
      result = result.filter(l =>
        l.material && this.selectedMaterials.includes(l.material)
      );
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }

    this.filteredListings = this.sortListings(result);
    this.resetPagination();
  }

  private sortListings(list: FurnitureListing[]): FurnitureListing[] {
    switch (this.selectedSortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      default:
        return list;
    }
  }

  /* =====================
     INFINITE SCROLL
  ===================== */
  onScroll(): void {
    if (this.isFetchingMore || this.allLoaded) return;

    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;

    if (position + threshold >= height) {
      this.loadMore();
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

    this.paginatedListings = [...this.paginatedListings, ...chunk];
  }

  /* =====================
     DETAIL VIEW
  ===================== */
  viewListing(id: number): void {
    this.listingsService.getSingleListing(id).subscribe(res => {
      this.selectedListing = this.mapBackendFurniture(res.data);
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

  /* =====================
     FAVORITES
  ===================== */
  toggleFavorite(listing: FurnitureListing, event?: MouseEvent): void {
    event?.stopPropagation();
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

  /* =====================
     CONTACT
  ===================== */
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

  reportAd(): void {
    if (confirm('Are you sure you want to report this ad?')) {
      alert('Thanks. We will review this listing.');
    }
  }

   startChatWithSeller(listing: FurnitureListing): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
  
    this.chatService.createOrGetRoom(listing.id).subscribe({
      next: (res: any) => {
        const roomId = res?.data?.id;
  
        if (!roomId) {
          alert('Unable to open chat room');
          return;
        }
  
        this.router.navigate(['/my-chats'], {
          queryParams: { roomId }
        });
      },
      error: () => {
        alert('Unable to start chat. Please try again.');
      }
    });
  }


  /* =====================
     BACKEND → UI MAPPER
  ===================== */
  mapBackendFurniture(l: any): FurnitureListing {
    const details = l.furnitureDetails;
    const images = details?.images || [];

    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'Dubai',

      image: images[0] || 'assets/no-image.jpg',
      images,

      condition: details?.condition,
      material: details?.material,
      description: l.description,

      lengthCm: details?.lengthCm,
      widthCm: details?.widthCm,
      heightCm: details?.heightCm,
      weight: details?.weight,

      sellerName: l.user?.name || 'Private Seller',
      sellerPhone: l.contactPhone,
      sellerEmail: l.contactEmail,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}
