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


interface ElectronicImage {
  imageUrl: string;
}

export interface ElectronicsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;

  image: string;
  images: ElectronicImage[];

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

  sellerName?: string;
  sellerPhone?: string;
  sellerImage?: string;

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

  /* ================= DATA ================= */
  allListings: ElectronicsListing[] = [];
  filteredListings: ElectronicsListing[] = [];
  paginatedListings: ElectronicsListing[] = [];

  selectedListing: ElectronicsListing | null = null;

  /* ================= STATE ================= */
  isLoading = false;
  isFetchingMore = false;
  allLoaded = false;
  isLoggedIn = false;

  currentImageIndex = 0;

  /* ================= SKELETON ================= */
  skeletonArray = Array.from({ length: 12 });

  /* ================= PAGINATION ================= */
  pageSize = 12;
  currentPage = 1;

  /* ================= SEARCH & SORT ================= */
  searchQuery = '';
  selectedSortBy: 'newest' | 'price-low' | 'price-high' = 'newest';

  /* ================= FILTERS ================= */
  selectedCategories: string[] = [];
  categories = [
    'Mobile Phone',
    'Laptop',
    'TV',
    'Washing Machine',
    'Appliances',
    'Refrigerator'
  ];

  selectedCondition = 'Any';
  conditions = ['Any', 'New', 'Like New', 'Used'];

  /* ================= REPORT ================= */
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

  /* ================= FETCH ================= */
  fetchListings(): void {
    this.isLoading = true;

    this.listingsService.getAllListings(5).subscribe({
      next: (res: any) => {
        const mapped: ElectronicsListing[] = res.data.map((l: any) =>
          this.mapBackendElectronics(l)
        );

        if (!this.isLoggedIn) {
          this.setListings(mapped);
          return;
        }

        this.listingsService.getFavoriteListingIds().subscribe({
          next: (favRes) => {
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

  private setListings(list: ElectronicsListing[]): void {
    this.allListings = list;
    this.filteredListings = [...list];
    this.resetPagination();
    this.isLoading = false;
  }

  /* ================= FILTERS ================= */
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
    let data = [...this.allListings];

    if (this.selectedCategories.length) {
      data = data.filter(
        l => l.subCategory && this.selectedCategories.includes(l.subCategory)
      );
    }

    if (this.selectedCondition !== 'Any') {
      data = data.filter(l => l.condition === this.selectedCondition);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.brand?.toLowerCase().includes(q)
      );
    }

    if (this.selectedSortBy === 'price-low') {
      data.sort((a, b) => a.price - b.price);
    } else if (this.selectedSortBy === 'price-high') {
      data.sort((a, b) => b.price - a.price);
    }

    this.filteredListings = data;
    this.resetPagination();
  }

  /* ================= SCROLL ================= */
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

  /* ================= DETAIL ================= */
  viewListing(id: number): void {
    this.listingsService.getSingleListing(id).subscribe({
      next: (res: any) => {
        this.selectedListing = this.mapBackendElectronics(res.data);
        console.log(this.selectedListing);
        this.currentImageIndex = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },error: (err:any) => {
        
        alert(err.error.message || 'Failed to load listing details');
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

  /* ================= FAVORITES ================= */
  toggleFavorite(listing: ElectronicsListing, event?: MouseEvent): void {
    event?.stopPropagation();
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

  /* ================= CONTACT ================= */
  callSeller(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    window.location.href = `tel:${this.selectedListing?.sellerPhone}`;
  }

  chatWhatsApp(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const phone = this.selectedListing?.sellerPhone?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  }

  startChatWithSeller(listing: ElectronicsListing): void {
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

  /* ================= REPORT ================= */
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
        alert('Report submitted successfully');
      },
      error: () => {
        this.isReporting = false;
        alert('Failed to submit report');
      }
    });
  }

  /* ================= MAPPER ================= */
  mapBackendElectronics(l: any): ElectronicsListing {
    const d = l.electronicDetails;
    const images = l?.images || [];

    return {
      id: l.id,
      title: l.title,
      price: Number(l.price),
      currency: l.currency || 'AED',
      location: l.city || 'Dubai',

      image: images[0]?.imageUrl || 'assets/noImage.jpg',
      images: images.length ? images : ['assets/noImage.jpg'],

      subCategory: d?.subCategory,
      brand: d?.brand,
      model: d?.model,
      modelNumber: d?.modelNumber,
      condition: d?.condition,
      storage: d?.storage,
      ram: d?.ram,
      processor: d?.processor,
      operatingSystem: d?.operatingSystem,
      screenSize: d?.screenSize,
      resolution: d?.resolution,
      color: d?.color,
      warrantyStatus: d?.warrantyStatus,
      hasOriginalBox: d?.hasOriginalBox,
      hasCharger: d?.hasCharger,
      accessories: d?.accessories,
      description: l.description,

      sellerName: l.user?.name || 'Private Seller',
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png',

      isFavorite: !!l.isFavorite
    };
  }
}
