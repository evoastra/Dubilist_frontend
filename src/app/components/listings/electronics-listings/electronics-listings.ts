import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';

interface ElectronicsListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images?: string[];
  condition?: string;
  brand?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  processor?: string;
  screenSize?: string;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerImage?: string;
}

@Component({
  selector: 'app-electronics-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './electronics-listings.html',
  styleUrls: ['./electronics-listings.css']
})
export class ElectronicsListingsComponent implements OnInit {

  // =====================
  // DATA
  // =====================
  listings: ElectronicsListing[] = [];
  filteredListings: ElectronicsListing[] = [];
  selectedListing: ElectronicsListing | null = null;

  isLoading = false;

  // =====================
  // PAGINATION
  // =====================
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;

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
  categories = ['Mobile Phone', 'Laptop', 'TV', 'Washing Machine', 'Appliances', 'Refrigerator'];

  selectedBrands: string[] = [];
  brands = ['Samsung', 'Apple', 'LG', 'Dell', 'Sony', 'Whirlpool'];

  selectedRam: string[] = [];
  rams = ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB'];

  selectedStorage: string[] = [];
  storages = ['64GB', '128GB', '256GB', '512GB', '1TB'];

  minPrice = 0;
  maxPrice = 0;

  selectedCondition = 'New';
  conditions = ['New', 'Like New', 'Used'];

  selectedLocation = '';
  locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'Al Ain'];

  constructor(private listingsService: ListingsService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  // =====================
  // FETCH FROM BACKEND
  // =====================
  loadListings(): void {
    this.isLoading = true;

    // categoryId = 4 → Electronics
    this.listingsService.getAllListings(4).subscribe({
      next: (res: any) => {
        this.listings = res.data.map(this.mapBackendElectronics);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // =====================
  // VIEW DETAIL
  // =====================
  viewListing(id: number): void {
    const found = this.listings.find(l => l.id === id);
    if (!found) return;

    this.selectedListing = found;
    this.currentImageIndex = 0;
    this.isFavorite = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetail(): void {
    this.selectedListing = null;
  }

  // =====================
  // IMAGE CAROUSEL
  // =====================
  previousImage(): void {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage(): void {
    if (!this.selectedListing?.images?.length) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) %
      this.selectedListing.images.length;
  }

  selectImage(i: number): void {
    this.currentImageIndex = i;
  }

  // =====================
  // CONTACT
  // =====================
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
    if (confirm('Are you sure you want to report this ad?')) {
      alert('Thank you. We will review this listing.');
    }
  }

  // =====================
  // FILTER HELPERS
  // =====================
  toggleCategory(category: string) {
    const i = this.selectedCategories.indexOf(category);
    i > -1 ? this.selectedCategories.splice(i, 1) : this.selectedCategories.push(category);
    this.applyFilters();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  toggleBrand(brand: string) {
    const i = this.selectedBrands.indexOf(brand);
    i > -1 ? this.selectedBrands.splice(i, 1) : this.selectedBrands.push(brand);
    this.applyFilters();
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  toggleRam(ram: string) {
    const i = this.selectedRam.indexOf(ram);
    i > -1 ? this.selectedRam.splice(i, 1) : this.selectedRam.push(ram);
    this.applyFilters();
  }

  isRamSelected(ram: string): boolean {
    return this.selectedRam.includes(ram);
  }

  toggleStorage(storage: string) {
    const i = this.selectedStorage.indexOf(storage);
    i > -1 ? this.selectedStorage.splice(i, 1) : this.selectedStorage.push(storage);
    this.applyFilters();
  }

  isStorageSelected(storage: string): boolean {
    return this.selectedStorage.includes(storage);
  }

  selectCondition(condition: string) {
    this.selectedCondition = condition;
    this.applyFilters();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedCondition === condition;
  }

  // =====================
  // FILTER + SORT
  // =====================
  selectSortBy(sort: string): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string): boolean {
    return this.selectedSortBy === sort;
  }

  applyFilters(): void {
    let result = [...this.listings];

    if (this.minPrice > 0) result = result.filter(l => l.price >= this.minPrice);
    if (this.maxPrice > 0) result = result.filter(l => l.price <= this.maxPrice);

    if (this.selectedBrands.length)
      result = result.filter(l => l.brand && this.selectedBrands.includes(l.brand));

    if (this.selectedRam.length)
      result = result.filter(l => l.ram && this.selectedRam.includes(l.ram));

    if (this.selectedStorage.length)
      result = result.filter(l => l.storage && this.selectedStorage.includes(l.storage));

    if (this.selectedCondition)
      result = result.filter(l => l.condition === this.selectedCondition);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    }

    this.filteredListings = this.sortListings(result);
    this.totalPages = Math.ceil(this.filteredListings.length / this.pageSize);
  }

  sortListings(list: ElectronicsListing[]) {
    switch (this.selectedSortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      default:
        return list;
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  // =====================
  // PAGINATION
  // =====================
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  nextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }

  // =====================
  // BACKEND → UI MAPPER
  // =====================
  mapBackendElectronics(l: any): ElectronicsListing {
    return {
      id: l.id,
      title: l.title,
      price: +l.price,
      currency: l.currency,
      location: l.city,
      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || [],
      condition: l.condition,
      brand: l.electronicsDetails?.brand,
      ram: l.electronicsDetails?.ram,
      storage: l.electronicsDetails?.storage,
      battery: l.electronicsDetails?.battery,
      processor: l.electronicsDetails?.processor,
      screenSize: l.electronicsDetails?.screenSize,
      description: l.description,
      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png'
    };
  }
}
