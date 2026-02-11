import { Component, OnInit } from '@angular/core';
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

export interface FurnitureImage {
  imageUrl: string;
}

export interface FurnitureListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: FurnitureImage[];

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
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './furniture-listings.html',
  styleUrls: ['./furniture-listings.css']
})
export class FurnitureListingsComponent implements OnInit {

  /* =====================
     DATA
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
     PAGINATION
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
  selectedMaterials: string[] = [];
  materials = ['Wood', 'Metal', 'Plastic', 'Leather'];

  selectedCondition = '';
  conditions = ['New', 'Like New', 'Used'];

  minPrice = 0;
  maxPrice = 0;

  /* =====================
     REPORT (SAME AS MOTORS)
  ===================== */
  showReportModal = false;
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

  constructor(
    private listingsService: ListingsService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
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

    // categoryId = 6 → Furniture
    this.listingsService.getAllListings(6).subscribe({
      next: (res: any) => {
        const mapped:FurnitureListing[] = res.data.map((l: any) =>
          this.mapBackendFurniture(l)
        );

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
    i > -1
      ? this.selectedMaterials.splice(i, 1)
      : this.selectedMaterials.push(material);
    this.applyFilters();
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

    if (this.selectedCondition) {
      result = result.filter(l => l.condition === this.selectedCondition);
    }

    if (this.selectedMaterials.length) {
      result = result.filter(
        l => l.material && this.selectedMaterials.includes(l.material)
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

    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 300;

    if (nearBottom) {
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

    this.paginatedListings.push(...chunk);
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
      error: () => (listing.isFavorite = prev)
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

  startChatWithSeller(listing: FurnitureListing): void {
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

  /* =====================
     REPORT (MODAL)
  ===================== */
  reportAd(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.reportReason = '';
    this.reportDetails = '';
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  submitReport(): void {
    if (!this.reportReason.trim()) {
      alert('Please select a reason');
      return;
    }

    this.isReporting = true;

    setTimeout(() => {
      this.isReporting = false;
      this.showReportModal = false;
      alert('Report submitted successfully');
    }, 800);
  }

  /* =====================
     BACKEND MAPPER
  ===================== */
  mapBackendFurniture(l: any): FurnitureListing {
    const details = l.furnitureDetails;
   const images = (l?.images || []).map((img: any) => ({
    imageUrl: img.imageUrl
  }));
   
  
const allImages = [...images];

    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'Dubai',

       image: allImages[0]?.imageUrl ?? 'assets/placeholder.png',
      images: allImages,
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
