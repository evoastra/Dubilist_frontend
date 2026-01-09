// classifieds-listings.component.ts - COMPLETE
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClassifiedsListing {
  id: number; title: string; price: number; currency: string; location: string;
  image: string; images: string[]; condition: string; material?: string;
  description?: string; sellerName: string; sellerPhone: string; sellerImage: string;
}

@Component({
  selector: 'app-classifieds-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classified-listings.html',
  styleUrls: ['./classified-listings.css']
})
export class ClassifiedListingsComponent implements OnInit {
  listings: ClassifiedsListing[] = [];
  filteredListings: ClassifiedsListing[] = [];
  selectedListing: ClassifiedsListing | null = null;
  isLoading = false;
  currentImageIndex = 0;
  isFavorite = false;
  searchQuery = '';
  selectedSortBy = 'newest';
  selectedCategories: string[] = [];
  categories = ['Sports','Musical Instruments','Fitness','Clothing'];
  minPrice = 0; maxPrice = 0; selectedCondition = 'New';
  conditions = ['New','Like New','Used'];

  ngOnInit() { this.loadListings(); }

  loadListings() {
    this.isLoading = true;
    setTimeout(() => {
      this.listings = [
        {id:1,title:'Vintage Tennis Racket',price:150,currency:'AED',location:'Downtown, Dubai',
         image:'https://images.unsplash.com/photo-1579952363873-27d3bfad9c93?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1579952363873-27d3bfad9c93?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1605296867304-46d5465a2429?w=800&h=600&fit=crop'],
         condition:'Used',material:'Wood Grip',description:'Vintage tennis racket perfect for collectors.',
         sellerName:'Sophia Clark',sellerPhone:'+971501234567',sellerImage:'https://i.pravatar.cc/150?img=47'},
        {id:2,title:'Fender Acoustic Guitar',price:850,currency:'AED',location:'Used Clubs, Dubai',
         image:'https://images.unsplash.com/photo-1541736799729-c94f6d68e19d?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1541736799729-c94f6d68e19d?w=800&h=600&fit=crop'],
         condition:'Like New',material:'Wood',description:'Fender acoustic guitar, excellent condition.',
         sellerName:'Ahmed Khan',sellerPhone:'+971559876543',sellerImage:'https://i.pravatar.cc/150?img=12'},
        {id:3,title:'Weight Bench Set',price:450,currency:'AED',location:'Sharjah',
         image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'],
         condition:'New',material:'Metal',description:'Complete weight bench set, brand new.',
         sellerName:'Mohammed Ali',sellerPhone:'+971523456789',sellerImage:'https://i.pravatar.cc/150?img=32'}
      ];
      this.filteredListings = [...this.listings]; this.isLoading = false;
    }, 500);
  }

  viewListing(id:number) { this.selectedListing = this.listings.find(l=>l.id===id)!; this.currentImageIndex=0; }
  closeDetail() { this.selectedListing = null; }
  previousImage() { if(this.selectedListing) this.currentImageIndex = (this.currentImageIndex-1+this.selectedListing.images.length)%this.selectedListing.images.length; }
  nextImage() { if(this.selectedListing) this.currentImageIndex = (this.currentImageIndex+1)%this.selectedListing.images.length; }
  selectImage(i:number) { this.currentImageIndex = i; }
  callSeller() { if(this.selectedListing) window.location.href = `tel:${this.selectedListing.sellerPhone}`; }
  chatWhatsApp() { if(this.selectedListing) window.open(`https://wa.me/${this.selectedListing.sellerPhone.replace(/\D/g,'')}`,'_blank'); }
  toggleFavorite() { this.isFavorite = !this.isFavorite; }

  toggleCategory(cat:string) {
    const i = this.selectedCategories.indexOf(cat); 
    if(i>-1) this.selectedCategories.splice(i,1); else this.selectedCategories.push(cat);
    this.applyFilters();
  }
  isCategorySelected(cat:string) { return this.selectedCategories.includes(cat); }
  selectCondition(cond:string) { this.selectedCondition=cond; this.applyFilters(); }
  isConditionSelected(cond:string) { return this.selectedCondition===cond; }
  selectSortBy(sort:string) { this.selectedSortBy=sort; this.applyFilters(); }
  isSortSelected(sort:string) { return this.selectedSortBy===sort; }

  applyFilters() {
    this.filteredListings = this.listings.filter(l => {
      if(this.minPrice>0 && l.price<this.minPrice) return false;
      if(this.maxPrice>0 && l.price>this.maxPrice) return false;
      if(this.selectedCategories.length && !this.selectedCategories.includes(l.material||'')) return false;
      return l.condition===this.selectedCondition;
    });
  }

  onSearch() {
    if(this.searchQuery.trim()) this.filteredListings = this.listings.filter(l=>l.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    else this.applyFilters();
  }
}
