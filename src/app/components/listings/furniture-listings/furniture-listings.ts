import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface FurnitureListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images?: string[]; // Multiple images for detail view
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
  listings: FurnitureListing[] = [];
  filteredListings: FurnitureListing[] = [];
  selectedListing: FurnitureListing | null = null;
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

  // Filters
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadListings();
    
    // Check if ID is in route params
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && this.listings.length > 0) {
        this.viewListing(+id);
      }
    });
  }

  loadListings(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.listings = [
        {
          id: 1,
          title: 'Coffee Table',
          price: 250,
          currency: 'AED',
          location: 'Dubai',
          image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          material: 'Wood',
          description: 'Beautiful handcrafted coffee table made from solid oak wood. Perfect centerpiece for your living room. Features smooth finish and sturdy construction.',
          lengthCm: 120,
          widthCm: 60,
          heightCm: 45,
          sellerName: 'Sophia Clark',
          sellerPhone: '+971-50-123-4567',
          sellerEmail: 'sophia.clark@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=47'
        },
        {
          id: 2,
          title: 'Accent Chair',
          price: 180,
          currency: 'AED',
          location: 'Sharjah',
          image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop'
          ],
          condition: 'Like New',
          material: 'Wood',
          description: 'Stylish accent chair with comfortable cushioning. Adds elegance to any room. Wooden frame with fabric upholstery.',
          lengthCm: 70,
          widthCm: 75,
          heightCm: 90,
          sellerName: 'Ahmed Hassan',
          sellerPhone: '+971-55-987-6543',
          sellerEmail: 'ahmed@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=12'
        },
        {
          id: 3,
          title: 'King Bed',
          price: 850,
          currency: 'AED',
          location: 'Abu Dhabi',
          image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          material: 'Wood',
          description: 'Luxurious king-size bed with premium mattress. Perfect for master bedrooms. Solid wood construction with elegant headboard design.',
          lengthCm: 200,
          widthCm: 180,
          heightCm: 120,
          sellerName: 'Sara Ahmed',
          sellerPhone: '+971-50-234-5678',
          sellerEmail: 'sara@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=32'
        },
        {
          id: 4,
          title: 'Storage Cabinet',
          price: 420,
          currency: 'AED',
          location: 'Ajman',
          image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop'
          ],
          condition: 'Used',
          material: 'Wood',
          description: 'Spacious storage cabinet with multiple compartments. Ideal for organizing your belongings. Durable construction.',
          lengthCm: 80,
          widthCm: 40,
          heightCm: 180,
          sellerName: 'Mohammed Ali',
          sellerPhone: '+971-52-345-6789',
          sellerEmail: 'mohammed@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=15'
        },
        {
          id: 5,
          title: 'Modern Sofa',
          price: 1200,
          currency: 'AED',
          location: 'Ras Al Khaimah',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          material: 'Leather',
          description: 'Premium leather sofa with modern design. Comfortable seating for 3 people. Perfect for contemporary living rooms.',
          lengthCm: 220,
          widthCm: 90,
          heightCm: 85,
          sellerName: 'Fatima Khan',
          sellerPhone: '+971-54-456-7890',
          sellerEmail: 'fatima@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=25'
        },
        {
          id: 6,
          title: 'Dining Table',
          price: 650,
          currency: 'AED',
          location: 'Fujairah',
          image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop'
          ],
          condition: 'Like New',
          material: 'Wood',
          description: 'Elegant dining table for 6 people. Solid wood construction with smooth finish. Perfect for family gatherings.',
          lengthCm: 180,
          widthCm: 90,
          heightCm: 75,
          sellerName: 'Ali Raza',
          sellerPhone: '+971-56-567-8901',
          sellerEmail: 'ali@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=33'
        },
        {
          id: 7,
          title: 'Ergonomic Chair',
          price: 320,
          currency: 'AED',
          location: 'Al Ain',
          image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop'
          ],
          condition: 'New',
          material: 'Plastic',
          description: 'Comfortable ergonomic office chair. Adjustable height and backrest. Perfect for home office or workspace.',
          lengthCm: 60,
          widthCm: 60,
          heightCm: 120,
          sellerName: 'Omar Hussain',
          sellerPhone: '+971-58-678-9012',
          sellerEmail: 'omar@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=51'
        },
        {
          id: 8,
          title: 'Queen Bed Frame',
          price: 680,
          currency: 'AED',
          location: 'Dubai',
          image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=300&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop'
          ],
          condition: 'Like New',
          material: 'Metal',
          description: 'Sturdy metal bed frame with modern design. Queen size. Easy to assemble and maintain.',
          lengthCm: 200,
          widthCm: 160,
          heightCm: 110,
          sellerName: 'Aisha Mohamed',
          sellerPhone: '+971-50-789-0123',
          sellerEmail: 'aisha@example.com',
          sellerImage: 'https://i.pravatar.cc/150?img=38'
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
      
      // Update URL without reloading page
      window.history.pushState({}, '', `/listing/furniture/${listingId}`);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Close detail view
  closeDetail(): void {
    this.selectedListing = null;
    
    // Update URL back to listing page
    window.history.pushState({}, '', '/listing/furniture');
  }

  // Image carousel methods
  previousImage(): void {
    if (this.selectedListing && this.selectedListing.images) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1 + this.selectedListing.images.length) % this.selectedListing.images.length;
    }
  }

  nextImage(): void {
    if (this.selectedListing && this.selectedListing.images) {
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
    console.log(this.isFavorite ? 'Added to favorites' : 'Removed from favorites');
  }

  reportAd(): void {
    const confirmed = confirm('Are you sure you want to report this ad?');
    if (confirmed) {
      alert('Thank you for reporting. We will review this listing.');
    }
  }

  // Sort methods
  selectSortBy(sort: string): void {
    this.selectedSortBy = sort;
    this.applyFilters();
  }

  isSortSelected(sort: string): boolean {
    return this.selectedSortBy === sort;
  }

  // Furniture type filter
  toggleFurnitureType(type: string): void {
    const index = this.selectedFurnitureTypes.indexOf(type);
    if (index > -1) {
      this.selectedFurnitureTypes.splice(index, 1);
    } else {
      this.selectedFurnitureTypes.push(type);
    }
  }

  isFurnitureTypeSelected(type: string): boolean {
    return this.selectedFurnitureTypes.includes(type);
  }

  // Material filter
  toggleMaterial(material: string): void {
    const index = this.selectedMaterials.indexOf(material);
    if (index > -1) {
      this.selectedMaterials.splice(index, 1);
    } else {
      this.selectedMaterials.push(material);
    }
  }

  isMaterialSelected(material: string): boolean {
    return this.selectedMaterials.includes(material);
  }

  // Condition filter
  selectCondition(condition: string): void {
    this.selectedCondition = condition.toLowerCase();
  }

  isConditionSelected(condition: string): boolean {
    return this.selectedCondition === condition.toLowerCase();
  }

  // Apply all filters
  applyFilters(): void {
    this.filteredListings = this.listings.filter(listing => {
      if (this.minPrice > 0 && listing.price < this.minPrice) return false;
      if (this.maxPrice > 0 && listing.price > this.maxPrice) return false;
      if (this.selectedCondition !== 'new' && listing.condition?.toLowerCase() !== this.selectedCondition) {
        return false;
      }
      if (this.selectedMaterials.length > 0 && !this.selectedMaterials.includes(listing.material || '')) {
        return false;
      }
      return true;
    });

    this.sortListings();
  }

  sortListings(): void {
    switch (this.selectedSortBy) {
      case 'relevance':
        break;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
