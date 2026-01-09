import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  listings: ElectronicsListing[] = [];
  filteredListings: ElectronicsListing[] = [];
  selectedListing: ElectronicsListing | null = null;
  isLoading = false;
  currentPage = 1;
  totalPages = 5;
  
  // For detail view
  currentImageIndex = 0;
  isFavorite = false;
  
  // Search
  searchQuery = '';

  // Sort
  selectedSortBy = 'newest';

  // Filters - ELECTRONICS SPECIFIC
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
  
  selectedLocation = 'Dubai';
  locations = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'Al Ain'];

  constructor() {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.listings = [
        {
          id: 1,
          title: 'Samsung Galaxy S21 5G',
          price: 1200,
          currency: 'AED',
          location: 'Dubai',
          image: 'https://images.unsplash.com/photo-1610945415295-d9bbf373f991?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1610945415295-d9bbf373f991?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592899678237-9b1399f90d45?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          brand: 'Samsung',
          ram: '8GB',
          storage: '128GB',
          battery: '4000mAh',
          description: 'Brand new Samsung Galaxy S21 5G with warranty. Excellent condition, includes original box and charger.',
          sellerName: 'Ahmed Khan',
          sellerPhone: '+971-50-123-4567',
          sellerImage: 'https://i.pravatar.cc/150?img=47'
        },
        {
          id: 2,
          title: 'MacBook Pro 14" M2',
          price: 7500,
          currency: 'AED',
          location: 'Abu Dhabi',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
          ],
          condition: 'Like New',
          brand: 'Apple',
          ram: '16GB',
          storage: '512GB',
          processor: 'M2 Pro',
          description: 'MacBook Pro 14" M2 Pro, barely used, full warranty remaining. Perfect condition with original packaging.',
          sellerName: 'Fatima Al-Suwaidi',
          sellerPhone: '+971-55-987-6543',
          sellerImage: 'https://i.pravatar.cc/150?img=12'
        },
        {
          id: 3,
          title: 'LG OLED 55" C2 TV',
          price: 4500,
          currency: 'AED',
          location: 'Sharjah',
          image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1610945415295-d9bbf373f991?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          brand: 'LG',
          screenSize: '55"',
          description: 'Brand new LG OLED C2 55" Smart TV. 4K, Dolby Vision, HDMI 2.1. Full warranty.',
          sellerName: 'Mohammed Hassan',
          sellerPhone: '+971-52-345-6789',
          sellerImage: 'https://i.pravatar.cc/150?img=32'
        },
        {
          id: 4,
          title: 'Dell XPS 13 9315',
          price: 2800,
          currency: 'AED',
          location: 'Ajman',
          image: 'https://images.unsplash.com/photo-1593642632459-44953f1b6cdb?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1593642632459-44953f1b6cdb?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
          ],
          condition: 'Used',
          brand: 'Dell',
          ram: '16GB',
          storage: '512GB',
          processor: 'i7-1250U',
          description: 'Dell XPS 13 9315, excellent condition, 1 year old, full specs, lightweight ultrabook.',
          sellerName: 'Sara Al-Mansoori',
          sellerPhone: '+971-50-234-5678',
          sellerImage: 'https://i.pravatar.cc/150?img=15'
        },
        {
          id: 5,
          title: 'Samsung 600L Refrigerator',
          price: 2500,
          currency: 'AED',
          location: 'RAK',
          image: 'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          brand: 'Samsung',
          description: 'Samsung 600L side-by-side refrigerator. Inverter technology, digital inverter compressor, A+ energy rating.',
          sellerName: 'Khalid Mohammed',
          sellerPhone: '+971-54-456-7890',
          sellerImage: 'https://i.pravatar.cc/150?img=25'
        },
        {
          id: 6,
          title: 'LG 10kg Front Load Washer',
          price: 1500,
          currency: 'AED',
          location: 'Fujairah',
          image: 'https://images.unsplash.com/photo-1517958808700-9cc0de566e0a?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1517958808700-9cc0de566e0a?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1584464494409-4e5cde4a2cec?w=800&h=600&fit=crop'
          ],
          condition: 'Like New',
          brand: 'LG',
          description: 'LG 10kg front load washing machine. Steam technology, 6 motion, A+++ energy rating. Barely used.',
          sellerName: 'Sophia Clark',
          sellerPhone: '+971-56-567-8901',
          sellerImage: 'https://i.pravatar.cc/150?img=33'
        }
      ];
      
      this.filteredListings = [...this.listings];
      this.isLoading = false;
    }, 500);
  }

  // View listing detail
  viewListing(listingId: number): void {
    const listing = this.listings.find(l => l.id === listingId);
    if (listing) {
      this.selectedListing = listing;
      this.currentImageIndex = 0;
      this.isFavorite = false;
    }
  }

  closeDetail(): void {
    this.selectedListing = null;
  }

  // Image carousel methods
  previousImage(): void {
    if (this.selectedListing?.images && this.selectedListing.images.length > 1) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1 + this.selectedListing.images.length) % this.selectedListing.images.length;
    }
  }

  nextImage(): void {
    if (this.selectedListing?.images && this.selectedListing.images.length > 1) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.selectedListing.images.length;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Actions
  callSeller(): void {
    if (this.selectedListing?.sellerPhone) {
      window.location.href = `tel:${this.selectedListing.sellerPhone}`;
    }
  }

  chatWhatsApp(): void {
    if (this.selectedListing?.sellerPhone) {
      const phone = this.selectedListing.sellerPhone.replace(/\D/g, '');
      const message = encodeURIComponent(`Hi, I'm interested in "${this.selectedListing.title}"`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  reportAd(): void {
    const confirmed = confirm('Are you sure you want to report this ad?');
    if (confirmed) {
      alert('Thank you for reporting. We will review this listing.');
    }
  }

  // Filter methods - ELECTRONICS SPECIFIC
  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  toggleBrand(brand: string): void {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  toggleRam(ram: string): void {
    const index = this.selectedRam.indexOf(ram);
    if (index > -1) {
      this.selectedRam.splice(index, 1);
    } else {
      this.selectedRam.push(ram);
    }
    this.applyFilters();
  }

  isRamSelected(ram: string): boolean {
    return this.selectedRam.includes(ram);
  }

  toggleStorage(storage: string): void {
    const index = this.selectedStorage.indexOf(storage);
    if (index > -1) {
      this.selectedStorage.splice(index, 1);
    } else {
      this.selectedStorage.push(storage);
    }
    this.applyFilters();
  }

  isStorageSelected(storage: string): boolean {
    return this.selectedStorage.includes(storage);
  }

  // Sort methods
  selectSortBy(sort: string): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string): boolean {
    return this.selectedSortBy === sort;
  }

  // Condition filter
  selectCondition(condition: string): void {
    this.selectedCondition = condition;
    this.applyFilters();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedCondition === condition;
  }

  // Apply all filters
  applyFilters(): void {
    this.filteredListings = this.listings.filter(listing => {
      // Price filters
      if (this.minPrice > 0 && listing.price < this.minPrice) return false;
      if (this.maxPrice > 0 && listing.price > this.maxPrice) return false;
      
      // Category filter
      if (this.selectedCategories.length > 0 && !this.selectedCategories.includes(listing.brand || '')) {
        return false;
      }
      
      // Brand filter
      if (this.selectedBrands.length > 0 && !this.selectedBrands.includes(listing.brand || '')) {
        return false;
      }
      
      // RAM filter
      if (this.selectedRam.length > 0 && !this.selectedRam.includes(listing.ram || '')) {
        return false;
      }
      
      // Storage filter
      if (this.selectedStorage.length > 0 && !this.selectedStorage.includes(listing.storage || '')) {
        return false;
      }
      
      // Condition filter
      if (listing.condition?.toLowerCase() !== this.selectedCondition.toLowerCase()) {
        return false;
      }
      
      return true;
    });

    this.sortListings();
  }

  sortListings(): void {
    switch (this.selectedSortBy) {
      case 'price-low':
        this.filteredListings.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredListings.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        break;
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredListings = this.listings.filter(listing =>
        listing.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.applyFilters();
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }
}
