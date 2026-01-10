import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';

interface ClassifiedsListing {
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
  sellerName: string;
  sellerPhone: string;
  sellerImage: string;
}

@Component({
  selector: 'app-classifieds-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classified-listings.html',
  styleUrls: ['./classified-listings.css']
})
export class ClassifiedListingsComponent implements OnInit {

  // =====================
  // DATA
  // =====================
  listings: ClassifiedsListing[] = [];
  filteredListings: ClassifiedsListing[] = [];
  selectedListing: ClassifiedsListing | null = null;

  isLoading = false;

  // =====================
  // DETAIL VIEW
  // =====================
  currentImageIndex = 0;
  isFavorite = false;

  // =====================
  // SEARCH & SORT
  // =====================
  searchQuery = '';
  selectedSortBy = 'newest';

  // =====================
  // FILTERS
  // =====================
  selectedCategories: string[] = [];
  categories = ['Sports', 'Musical Instruments', 'Fitness', 'Clothing'];

  minPrice = 0;
  maxPrice = 0;

  selectedCondition = 'New';
  conditions = ['New', 'Like New', 'Used'];

  constructor(private listingsService: ListingsService) {}

  ngOnInit() {
    this.loadListings();
  }

  // =====================
  // FETCH FROM BACKEND
  // =====================
  loadListings() {
    this.isLoading = true;

    // categoryId = 5 → Classifieds
    this.listingsService.getAllListings(5).subscribe({
      next: (res: any) => {
        this.listings = res.data.map(this.mapBackendClassified);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // =====================
  // DETAIL VIEW
  // =====================
  viewListing(id: number) {
    const found = this.listings.find(l => l.id === id);
    if (!found) return;

    this.selectedListing = found;
    this.currentImageIndex = 0;
    this.isFavorite = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetail() {
    this.selectedListing = null;
  }

  previousImage() {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage() {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) %
      this.selectedListing.images.length;
  }

  selectImage(i: number) {
    this.currentImageIndex = i;
  }

  // =====================
  // CONTACT
  // =====================
  callSeller() {
    if (this.selectedListing?.sellerPhone) {
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
    }
  }

  chatWhatsApp() {
    if (!this.selectedListing?.sellerPhone) return;
    const phone = this.selectedListing.sellerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  // =====================
  // FILTER HELPERS
  // =====================
  toggleCategory(cat: string) {
    const i = this.selectedCategories.indexOf(cat);
    i > -1 ? this.selectedCategories.splice(i, 1) : this.selectedCategories.push(cat);
    this.applyFilters();
  }

  isCategorySelected(cat: string) {
    return this.selectedCategories.includes(cat);
  }

  selectCondition(cond: string) {
    this.selectedCondition = cond;
    this.applyFilters();
  }

  isConditionSelected(cond: string) {
    return this.selectedCondition === cond;
  }

  selectSortBy(sort: string) {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string) {
    return this.selectedSortBy === sort;
  }

  // =====================
  // FILTER + SORT
  // =====================
  applyFilters() {
    let result = [...this.listings];

    if (this.minPrice > 0) result = result.filter(l => l.price >= this.minPrice);
    if (this.maxPrice > 0) result = result.filter(l => l.price <= this.maxPrice);

    if (this.selectedCondition)
      result = result.filter(l => l.condition === this.selectedCondition);

    if (this.selectedCategories.length)
      result = result.filter(l =>
        l.material && this.selectedCategories.includes(l.material)
      );

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    }

    this.filteredListings = this.sortListings(result);
  }

  sortListings(list: ClassifiedsListing[]) {
    switch (this.selectedSortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      default:
        return list;
    }
  }

  onSearch() {
    this.applyFilters();
  }

  // =====================
  // BACKEND → UI MAPPER
  // =====================
  mapBackendClassified(l: any): ClassifiedsListing {
    return {
      id: l.id,
      title: l.title,
      price: +l.price,
      currency: l.currency,
      location: l.city,
      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || [],
      condition: l.condition,
      material: l.classifiedDetails?.category || l.classifiedDetails?.type,
      description: l.description,
      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png'
    };
  }
}
