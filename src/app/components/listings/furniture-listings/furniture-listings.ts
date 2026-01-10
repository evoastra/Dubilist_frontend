import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ListingsService } from '../../../services/listing-service';

interface FurnitureListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images?: string[];
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
}

@Component({
  selector: 'app-furniture-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './furniture-listings.html',
  styleUrls: ['./furniture-listings.css']
})
export class FurnitureListingsComponent implements OnInit {

  // =====================
  // DATA
  // =====================
  listings: FurnitureListing[] = [];
  filteredListings: FurnitureListing[] = [];
  selectedListing: FurnitureListing | null = null;

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
  selectedFurnitureTypes: string[] = [];
  furnitureTypes = ['Sofa', 'Bed', 'Dining Table', 'Chair', 'Dressing Table'];

  selectedMaterials: string[] = [];
  materials = ['Wood', 'Metal', 'Plastic', 'Leather'];

  minPrice = 0;
  maxPrice = 0;

  selectedCondition = 'new';
  conditions = ['New', 'Like New', 'Used'];

  selectedLocation = 'Dubai';
  locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'];

  constructor(
    private route: ActivatedRoute,
    private listingsService: ListingsService
  ) {}

  ngOnInit(): void {
    this.loadListings();

    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        const found = this.listings.find(l => l.id === id);
        if (found) this.viewListing(id);
      }
    });
  }

  // =====================
  // FETCH FROM BACKEND
  // =====================
  loadListings(): void {
    this.isLoading = true;

    // categoryId = 7 → Furniture
    this.listingsService.getAllListings(7).subscribe({
      next: (res: any) => {
        this.listings = res.data.map(this.mapBackendFurniture);
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
  viewListing(listingId: number): void {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) return;

    this.selectedListing = listing;
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

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  // =====================
  // CONTACT ACTIONS
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
      alert('Thanks. We will review this listing.');
    }
  }

  // =====================
  // FILTER & SORT
  // =====================
  selectSortBy(sort: string): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string): boolean {
    return this.selectedSortBy === sort;
  }

  toggleFurnitureType(type: string): void {
    const i = this.selectedFurnitureTypes.indexOf(type);
    i > -1 ? this.selectedFurnitureTypes.splice(i, 1) : this.selectedFurnitureTypes.push(type);
  }

  isFurnitureTypeSelected(type: string): boolean {
    return this.selectedFurnitureTypes.includes(type);
  }

  toggleMaterial(material: string): void {
    const i = this.selectedMaterials.indexOf(material);
    i > -1 ? this.selectedMaterials.splice(i, 1) : this.selectedMaterials.push(material);
  }

  isMaterialSelected(material: string): boolean {
    return this.selectedMaterials.includes(material);
  }

  selectCondition(condition: string): void {
    this.selectedCondition = condition.toLowerCase();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedCondition === condition.toLowerCase();
  }

  applyFilters(): void {
    let result = [...this.listings];

    if (this.minPrice > 0) result = result.filter(l => l.price >= this.minPrice);
    if (this.maxPrice > 0) result = result.filter(l => l.price <= this.maxPrice);

    if (this.selectedCondition !== 'new') {
      result = result.filter(l => l.condition?.toLowerCase() === this.selectedCondition);
    }

    if (this.selectedMaterials.length) {
      result = result.filter(l => l.material && this.selectedMaterials.includes(l.material));
    }

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

  sortListings(list: FurnitureListing[]): FurnitureListing[] {
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
  mapBackendFurniture(l: any): FurnitureListing {
    return {
      id: l.id,
      title: l.title,
      price: +l.price,
      currency: l.currency,
      location: l.city,
      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      images: l.images?.map((i: any) => i.imageUrl) || [],
      condition: l.condition,
      material: l.furnitureDetails?.material,
      description: l.description,
      lengthCm: l.furnitureDetails?.lengthCm,
      widthCm: l.furnitureDetails?.widthCm,
      heightCm: l.furnitureDetails?.heightCm,
      weight: l.furnitureDetails?.weight,
      sellerName: l.user?.name,
      sellerPhone: l.contactPhone,
      sellerEmail: l.contactEmail,
      sellerImage: l.user?.avatarUrl || 'assets/avatar.png'
    };
  }
}
