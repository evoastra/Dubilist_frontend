import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';

export interface ElectronicsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: string[];

  // Electronics details
  subCategory?: string;
  brand?: string;
  model?: string;
  modelNumber?: string;
  condition?: string;
  storage?: string;
  ram?: string;
  processor?: string;
  operatingSystem?: string;
  screenSize?: string;
  resolution?: string;
  color?: string;
  warrantyStatus?: string;
  hasOriginalBox?: boolean;
  hasCharger?: boolean;
  accessories?: string | null;
  description?: string;

  // Seller
  sellerName?: string;
  sellerPhone?: string;
  sellerImage?: string;

  // New features
  isFavorite: boolean;
}

@Component({
  selector: 'app-electronics-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './electronics-listings.html',
  styleUrls: ['./electronics-listings.css']
})
export class ElectronicsListingsComponent implements OnInit {

  /* =====================
     DATA SOURCES
  ===================== */
  allListings: ElectronicsListing[] = [];
  filteredListings: ElectronicsListing[] = [];
  paginatedListings: ElectronicsListing[] = [];

  selectedListing: ElectronicsListing | null = null;

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
  selectedCategories: string[] = [];
  categories = [
    'Mobile Phone',
    'Laptop',
    'TV',
    'Washing Machine',
    'Appliances',
    'Refrigerator'
  ];

  selectedCondition = 'New';
  conditions = ['New', 'Like New', 'Used'];

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
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

    // categoryId = 5 → Electronics
    this.listingsService.getAllListings(5).subscribe({
      next: (res: any) => {
        const mapped: ElectronicsListing[] =
          res.data.map((l: any) => this.mapBackendElectronics(l));

        if (!this.isLoggedIn) {
          this.setListings(mapped);
          return;
        }

        // Fetch favorites if logged in
        this.listingsService.getFavoriteListingIds().subscribe({
          next: (favRes: any) => {
            const favoriteIds: number[] = favRes || [];
            mapped.forEach(l => {
              l.isFavorite = favoriteIds.includes(l.id);
            });
            this.setListings(mapped);
          },
          error: () => this.setListings(mapped)
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  private setListings(listings: ElectronicsListing[]): void {
    this.allListings = listings;
    this.filteredListings = [...listings];
    this.resetPagination();
    this.isLoading = false;
  }

  /* =====================
     FILTERS & SEARCH
  ===================== */
  toggleCategory(category: string): void {
    const idx = this.selectedCategories.indexOf(category);
    idx > -1
      ? this.selectedCategories.splice(idx, 1)
      : this.selectedCategories.push(category);
    this.applyFilters();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  selectCondition(condition: string): void {
    this.selectedCondition = condition;
    this.applyFilters();
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

    if (this.selectedCategories.length) {
      result = result.filter(
        l => l.subCategory && this.selectedCategories.includes(l.subCategory)
      );
    }

    if (this.selectedCondition) {
      result = result.filter(l => l.condition === this.selectedCondition);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.brand?.toLowerCase().includes(q)
      );
    }

    this.filteredListings = this.sortListings(result);
    this.resetPagination();
  }

  private sortListings(list: ElectronicsListing[]): ElectronicsListing[] {
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

    if (chunk.length === 0) {
      this.allLoaded = true;
      return;
    }

    this.paginatedListings = [...this.paginatedListings, ...chunk];
  }

  /* =====================
     DETAIL VIEW
  ===================== */
  viewListing(id: number): void {
    this.listingsService.getSingleListing(id).subscribe(listing => {
      this.selectedListing = this.mapBackendElectronics(listing.data);
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
  toggleFavorite(listing: ElectronicsListing, event?: MouseEvent): void {
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

  startChatWithSeller(listing: ElectronicsListing): void {
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
        this.router.navigate(['/my-chats'], { queryParams: { roomId } });
      },
      error: () => alert('Unable to start chat')
    });
  }

  reportAd(): void {
    if (confirm('Are you sure you want to report this ad?')) {
      alert('Thank you. We will review this listing.');
    }
  }

  /* =====================
     BACKEND → UI MAPPER
  ===================== */
  mapBackendElectronics(l: any): ElectronicsListing {
    const details = l.electronicDetails;
    const images = details?.images || [];

    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'Dubai',

      image: images[0] || 'assets/no-image.jpg',
      images,

      subCategory: details?.subCategory,
      brand: details?.brand,
      model: details?.model,
      modelNumber: details?.modelNumber,
      condition: details?.condition,
      storage: details?.storage,
      ram: details?.ram,
      processor: details?.processor,
      operatingSystem: details?.operatingSystem,
      screenSize: details?.screenSize,
      resolution: details?.resolution,
      color: details?.color,
      warrantyStatus: details?.warrantyStatus,
      hasOriginalBox: details?.hasOriginalBox,
      hasCharger: details?.hasCharger,
      accessories: details?.accessories,
      description: l.description,

      sellerName: l.user?.name || 'Private Seller',
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}
