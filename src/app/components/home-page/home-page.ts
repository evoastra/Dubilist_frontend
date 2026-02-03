import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ListingsService } from '../../services/listing-service';
import { FormsModule } from '@angular/forms';

interface Listing {
  title: string;
  price: string;
  city: string;
  imageUrl: string;
  categorySlug: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NgFor, CommonModule, RouterLink,FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

  /* ===================== CATEGORY SEARCH ===================== */
  selectedCategory = 'All';

  categories = [
    'All',
    'Properties',
    'Jobs',
    'Electronics',
    'Motors',
    'Classifieds',
    'Furniture'
  ];

  categoryMap: Record<string, number | null> = {
    All: null,
    Properties: 3,
    Jobs: 2,
    Electronics: 5,
    Motors: 1,
    Classifieds: 4,
    Furniture: 6
  };

  searchQuery = '';
  searchResults: Listing[] = [];
  isSearching = false;
  hasSearched = false;

  /* ===================== LISTINGS ===================== */
  featuredListings: Listing[] = [];
  popularCars: Listing[] = [];
  popularFurniture: Listing[] = [];
  residentialListings: Listing[] = [];
  electronicsListings: Listing[] = [];
  classifiedListings: Listing[] = [];

  isLoading = false;

  constructor(
    private listingsService: ListingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  /* ===================== CATEGORY CLICK ===================== */
  onCategoryClick(cat: string): void {
    this.selectedCategory = cat;

    if (this.searchQuery.trim()) {
      this.onSearch();
    }
  }

  get searchPlaceholder(): string {
    return `Searching in ${this.selectedCategory}`;
  }

  /* ===================== SEARCH ===================== */
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      console.log('Empty search query');
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    const categoryId = this.categoryMap[this.selectedCategory];

    this.listingsService.searchListings({
      q: this.searchQuery,
      categoryId: categoryId ?? undefined,
      limit: 20
    }).subscribe({
      next: (res) => {
        this.searchResults = this.mapListings(res.data);
        console.log('Search results:', this.searchResults);
        this.isSearching = false;
      },
      error: () => {
        console.error('Search failed');
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  clearSearch(): void {
    this.hasSearched = false;
    this.searchResults = [];
  }

  /* ===================== HOME DATA ===================== */
  loadHomeData(): void {
    this.isLoading = true;

    // Featured (ALL → show 5)
    this.listingsService.getAllListings().subscribe({
      next: (res) => {
        this.featuredListings = this.mapListings(res.data).slice(0, 5);
        this.isLoading = false;
      },
      error: () => {
        this.featuredListings = [];
        this.isLoading = false;
      }
    });

    // Motors
    this.listingsService.getListingsPaginated(1, 1, 5).subscribe(res => {
      this.popularCars = this.mapListings(res.data);
    });

    // Properties
    this.listingsService.getListingsPaginated(3, 1, 5).subscribe(res => {
      this.residentialListings = this.mapListings(res.data);
    });

    // Electronics
    this.listingsService.getListingsPaginated(5, 1, 5).subscribe(res => {
      this.electronicsListings = this.mapListings(res.data);
    });

    // Furniture
    this.listingsService.getListingsPaginated(6, 1, 5).subscribe(res => {
      this.popularFurniture = this.mapListings(res.data);
    });

    // Classifieds
    this.listingsService.getListingsPaginated(4, 1, 5).subscribe(res => {
      this.classifiedListings = this.mapListings(res.data);
    });
  }

  /* ===================== MAPPER ===================== */
  mapListings(data: any[]): Listing[] {
    return (data || []).map(item => ({
      title: item.title,
      price: `${item.currency || 'AED'} ${Number(item.price).toLocaleString()}`,
      city: item.city,
      imageUrl: item.images?.[0]?.imageUrl || 'assets/placeholder.png',
      categorySlug: item.category?.name.toLowerCase()
    }));
  }

  /* ===================== NAVIGATION ===================== */
  goToCategory(listing: Listing): void {
    if (!listing.categorySlug) return;
    this.router.navigate([`/listings/${listing.categorySlug}`]);
  }
}
