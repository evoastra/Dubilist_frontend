import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';
import { Router } from '@angular/router';

export interface MotorsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images: string[];
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
  imports: [CommonModule, FormsModule],
  templateUrl: './motor-listings.html',
  styleUrls: ['./motor-listings.css'],
})
export class MotorListingsComponent implements OnInit {
  /* =====================
     DATA SOURCES
  ===================== */
  allListings: MotorsListing[] = [];
  filteredListings: MotorsListing[] = [];
  paginatedListings: MotorsListing[] = []; // 🔥 REQUIRED BY HTML

  selectedListing: MotorsListing | null = null;

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
     SEARCH & FILTERS
  ===================== */
  searchQuery = '';

  selectedFuel = '';
  fuels = ['Petrol', 'Diesel', 'Electric'];

  selectedTransmission = '';
  transmissions = ['Automatic', 'Manual'];

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
     FETCH FROM API
  ===================== */
  fetchListings(): void {
    this.isLoading = true;

    this.listingsService.getAllListings(1).subscribe({
      next: (res: any) => {
        const mapped: MotorsListing[] = res.data.map((l: any) =>
          this.mapBackendListing(l)
        );

        this.allListings = mapped;
        this.filteredListings = [...mapped];

        this.resetPagination(); // 🔥 KEY FIX
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  /* =====================
     FILTERS
  ===================== */
  applyFilters(): void {
    let result = [...this.allListings];

    if (this.selectedFuel) {
      result = result.filter(l => l.fuel === this.selectedFuel);
    }

    if (this.selectedTransmission) {
      result = result.filter(l => l.transmission === this.selectedTransmission);
    }

    if (this.selectedCondition) {
      result = result.filter(l => l.condition === this.selectedCondition);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.make.toLowerCase().includes(q) ||
          l.model.toLowerCase().includes(q)
      );
    }

    this.filteredListings = result;
    this.resetPagination();
  }

  selectFuel(fuel: string): void {
    this.selectedFuel = fuel;
    this.applyFilters();
  }

  selectTransmission(trans: string): void {
    this.selectedTransmission = trans;
    this.applyFilters();
  }

  selectCondition(cond: string): void {
    this.selectedCondition = cond;
    this.applyFilters();
  }

  isConditionSelected(cond: string): boolean {
    return this.selectedCondition === cond;
  }

  onSearch(): void {

     let result = [...this.allListings];

     const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) 
      );
      this.filteredListings = result;
      this.resetPagination();
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
    }, 500);
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
    const nextChunk = this.filteredListings.slice(start, end);

    if (nextChunk.length === 0) {
      this.allLoaded = true;
      return;
    }

    this.paginatedListings = [...this.paginatedListings, ...nextChunk];
  }

  /* =====================
     FAVORITES
  ===================== */
  toggleFavorite(listing: MotorsListing, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isLoggedIn) return;

    listing.isFavorite = !listing.isFavorite;

    if (listing.isFavorite) {
      this.listingsService.addToFavorites(listing.id).subscribe();
    } else {
      this.listingsService.removeFromFavorites(listing.id).subscribe();
    }
  }

  /* =====================
     DETAIL VIEW
  ===================== */
  viewListing(id: number): void {
    this.selectedListing =
      this.allListings.find(l => l.id === id) || null;
    this.currentImageIndex = 0;
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
     CONTACT
  ===================== */
  callSeller(): void {
    if (this.selectedListing) {
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
    }
  }

  chatWhatsApp(): void {
    if (this.selectedListing) {
      window.open(
        `https://wa.me/${this.selectedListing.sellerPhone.replace(/\D/g, '')}`,
        '_blank'
      );
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
     BACKEND MAPPER
  ===================== */
  mapBackendListing(l: any): MotorsListing {
    return {
      id: l.id,
      title: l.title,
      price: +l.price,
      currency: l.currency,
      location: l.city,
      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || [],
      year: l.motorDetails?.year,
      make: l.motorDetails?.make,
      model: l.motorDetails?.model,
      mileage: `${l.motorDetails?.kilometres || 0} km`,
      fuel: l.motorDetails?.fuelType,
      transmission: l.motorDetails?.transmission,
      condition: l.motorDetails?.condition,
      description: l.description,
      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',
      isFavorite: false,
    };
  }
}
