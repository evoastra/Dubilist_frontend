import {
  Component,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { ChatService } from '../../../services/chat-service';

export interface ClassifiedsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: string[];

  condition: string;
  material?: string;
  description?: string;
  color?: string;
  sellerName: string;
  sellerPhone: string;
  sellerImage: string;

  isFavorite: boolean;
}

@Component({
  selector: 'app-classifieds-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classified-listings.html',
  styleUrls: ['./classified-listings.css']
})
export class ClassifiedListingsComponent implements OnInit {

  /* ===================== DATA ===================== */
  allListings: ClassifiedsListing[] = [];
  filteredListings: ClassifiedsListing[] = [];
  paginatedListings: ClassifiedsListing[] = [];

  selectedListing: ClassifiedsListing | null = null;

  /* ===================== STATE ===================== */
  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;
  isLoggedIn = false;

  currentImageIndex = 0;

  /* ===================== SKELETON ===================== */
  skeletonArray = Array.from({ length: 12 });

  /* ===================== PAGINATION ===================== */
  pageSize = 12;
  currentPage = 1;

  /* ===================== SEARCH & SORT ===================== */
  searchQuery = '';
  selectedSortBy: 'newest' | 'price-low' | 'price-high' = 'newest';

  /* ===================== FILTERS ===================== */
  selectedCategories: string[] = [];
  categories = ['Sports', 'Musical Instruments', 'Fitness', 'Clothing'];

  selectedCondition = 'Any';
  conditions = ['Any', 'New', 'Like New', 'Used'];

  minPrice = 0;
  maxPrice = 0;

  /* ===================== REPORT (SAME AS MOTORS) ===================== */
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
    private chatService: ChatService,
    private router: Router
  ) {}

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.fetchListings();
  }

  /* ===================== FETCH ===================== */
  fetchListings(): void {
    this.isLoading = true;

    // categoryId = 4 → Classifieds
    this.listingsService.getAllListings(4).subscribe({
      next: (res: any) => {
        const mapped = res.data.map((l: any) =>
          this.mapBackendClassified(l)
        );
        this.setListings(mapped);
      },
      error: () => (this.isLoading = false)
    });
  }

  private setListings(list: ClassifiedsListing[]): void {
    this.allListings = list;
    this.filteredListings = [...list];
    this.resetPagination();
    this.isLoading = false;
  }

  /* ===================== FILTERS ===================== */
  toggleCategory(cat: string): void {
    const i = this.selectedCategories.indexOf(cat);
    i >= 0
      ? this.selectedCategories.splice(i, 1)
      : this.selectedCategories.push(cat);
    this.applyFilters();
  }

  isCategorySelected(cat: string): boolean {
    return this.selectedCategories.includes(cat);
  }

  selectCondition(cond: string): void {
    this.selectedCondition = cond;
    this.applyFilters();
  }

  selectSortBy(sort: any): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: any): boolean {
    return this.selectedSortBy === sort;
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allListings];

    if (this.selectedCategories.length) {
      result = result.filter(
        l => l.material && this.selectedCategories.includes(l.material)
      );
    }

    if (this.selectedCondition !== 'Any') {
      result = result.filter(l => l.condition === this.selectedCondition);
    }

    if (this.minPrice > 0) {
      result = result.filter(l => l.price >= this.minPrice);
    }

    if (this.maxPrice > 0) {
      result = result.filter(l => l.price <= this.maxPrice);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }

    // SORT
    if (this.selectedSortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.selectedSortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    this.filteredListings = result;
    this.resetPagination();
  }

  /* ===================== INFINITE SCROLL ===================== */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
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

  /* ===================== DETAIL VIEW ===================== */
  viewListing(id: number): void {
    const found = this.listingsService.getSingleListing(id).subscribe({
      next: (res: any) => {
        const mapped = this.mapBackendClassified(res.data); 
        this.selectedListing = mapped;
        this.currentImageIndex = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },error: () => {  
        alert('Error fetching listing details.');
      }
  
    });
  
  }

  startChatWithSeller(listing: ClassifiedsListing): void {
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
  closeDetail(): void {
    if (this.showReportModal) return;
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

  /* ===================== FAVORITES ===================== */
  toggleFavorite(listing: ClassifiedsListing, event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    listing.isFavorite = !listing.isFavorite;
  }

  /* ===================== CONTACT ===================== */
  callSeller(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.selectedListing?.sellerPhone) {
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
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  /* ===================== REPORT (SAME AS MOTORS) ===================== */
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

    // Placeholder (same as Motors until backend hook)
    setTimeout(() => {
      this.isReporting = false;
      this.showReportModal = false;
      alert('Report submitted successfully');
    }, 800);
  }

  /* ===================== BACKEND → UI ===================== */
  mapBackendClassified(l: any): ClassifiedsListing {
    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'Dubai',

      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || ['assets/no-image.jpg'],

      condition: l.condition || 'Used',
      material: l.classifiedDetails?.material || l.classifiedDetails?.type,
      description: l.description,
      color: l.classifiedDetails?.color,

      sellerName: l.user?.name || 'Private Seller',
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}
