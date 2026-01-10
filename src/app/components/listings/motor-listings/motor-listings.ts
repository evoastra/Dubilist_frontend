import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';

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
}

@Component({
  selector: 'app-motors-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motor-listings.html',
  styleUrls: ['./motor-listings.css']
})
export class MotorListingsComponent implements OnInit {

  // =====================
  // DATA
  // =====================
  listings: MotorsListing[] = [];
  filteredBaseListings: MotorsListing[] = [];
  paginatedListings: MotorsListing[] = [];

  selectedListing: MotorsListing | null = null;

  isLoading = false;
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
  selectedMakes: string[] = [];
  makes = ['Toyota', 'Mercedes', 'BMW', 'Honda', 'Yamaha', 'Audi'];

  selectedModels: string[] = [];
  models = ['Camry', 'V4', 'S1000RR', 'Civic', 'R1', 'A4'];

  minPrice = 0;
  maxPrice = 0;

  minYear = 2018;
  maxYear = 2024;

  minMileage = 0;
  maxMileage = 100000;

  selectedFuel = '';
  fuels = ['Petrol', 'Diesel', 'Electric'];

  selectedTransmission = '';
  transmissions = ['Automatic', 'Manual'];

  selectedCondition = 'New';
  conditions = ['New', 'Like New', 'Used'];

  // =====================
  // PAGINATION
  // =====================
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;

  constructor(private listingsService: ListingsService) {}

  ngOnInit() {
    this.loadListings();
  }

  // =====================
  // FETCH (ONCE)
  // =====================
  loadListings() {
    this.isLoading = true;

    this.listingsService.getAllListings(1).subscribe({
      next: (res: any) => {
        this.listings = res.data.map(this.mapBackendListing);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // =====================
  // FILTER / SEARCH / SORT
  // =====================
  applyFilters() {
    let result = [...this.listings];

    if (this.minPrice > 0) result = result.filter(l => l.price >= this.minPrice);
    if (this.maxPrice > 0) result = result.filter(l => l.price <= this.maxPrice);

    if (this.minYear) result = result.filter(l => l.year >= this.minYear);
    if (this.maxYear) result = result.filter(l => l.year <= this.maxYear);

    if (this.minMileage > 0)
      result = result.filter(l => parseInt(l.mileage) >= this.minMileage);
    if (this.maxMileage > 0)
      result = result.filter(l => parseInt(l.mileage) <= this.maxMileage);

    if (this.selectedMakes.length)
      result = result.filter(l => this.selectedMakes.includes(l.make));

    if (this.selectedModels.length)
      result = result.filter(l => this.selectedModels.includes(l.model));

    if (this.selectedFuel)
      result = result.filter(l => l.fuel === this.selectedFuel);

    if (this.selectedTransmission)
      result = result.filter(l => l.transmission === this.selectedTransmission);

    if (this.selectedCondition)
      result = result.filter(l => l.condition === this.selectedCondition);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.make.toLowerCase().includes(q) ||
        l.model.toLowerCase().includes(q)
      );
    }

    result = this.sortListings(result);

    this.filteredBaseListings = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  sortListings(list: MotorsListing[]) {
    switch (this.selectedSortBy) {
      case 'price_low':
        return list.sort((a, b) => a.price - b.price);
      case 'price_high':
        return list.sort((a, b) => b.price - a.price);
      case 'oldest':
        return list.sort((a, b) => a.year - b.year);
      default:
        return list.sort((a, b) => b.year - a.year);
    }
  }

  onSearch() {
    this.applyFilters();
  }

  // =====================
  // PAGINATION
  // =====================
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredBaseListings.length / this.pageSize);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedListings = this.filteredBaseListings.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // =====================
  // TEMPLATE HELPERS
  // =====================
  selectFuel(fuel: string) {
    this.selectedFuel = fuel;
    this.applyFilters();
  }

  selectTransmission(trans: string) {
    this.selectedTransmission = trans;
    this.applyFilters();
  }

  selectCondition(cond: string) {
    this.selectedCondition = cond;
    this.applyFilters();
  }

  toggleMake(make: string) {
    const i = this.selectedMakes.indexOf(make);
    i > -1 ? this.selectedMakes.splice(i, 1) : this.selectedMakes.push(make);
    this.applyFilters();
  }

  toggleModel(model: string) {
    const i = this.selectedModels.indexOf(model);
    i > -1 ? this.selectedModels.splice(i, 1) : this.selectedModels.push(model);
    this.applyFilters();
  }

  isMakeSelected(make: string) {
    return this.selectedMakes.includes(make);
  }

  isModelSelected(model: string) {
    return this.selectedModels.includes(model);
  }

  isConditionSelected(cond: string) {
    return this.selectedCondition === cond;
  }

  // =====================
  // DETAIL VIEW
  // =====================
  viewListing(id: number) {
    this.selectedListing = this.listings.find(l => l.id === id)!;
    this.currentImageIndex = 0;
  }

  closeDetail() {
    this.selectedListing = null;
  }

  previousImage() {
    if (!this.selectedListing) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.selectedListing.images.length) %
      this.selectedListing.images.length;
  }

  nextImage() {
    if (!this.selectedListing) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) %
      this.selectedListing.images.length;
  }

  selectImage(i: number) {
    this.currentImageIndex = i;
  }

  callSeller() {
    if (this.selectedListing)
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
  }

  chatWhatsApp() {
    if (this.selectedListing)
      window.open(
        `https://wa.me/${this.selectedListing.sellerPhone.replace(/\D/g, '')}`,
        '_blank'
      );
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  // =====================
  // BACKEND → UI MAPPER
  // =====================
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
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png'
    };
  }
}
