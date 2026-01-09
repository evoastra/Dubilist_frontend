// motors-listings.component.ts - COMPLETE
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MotorsListing {
  id: number; title: string; price: number; currency: string; location: string;
  image: string; images: string[]; year: number; make: string; model: string;
  mileage: string; fuel: string; transmission: string; condition: string;
  description?: string; sellerName: string; sellerPhone: string; sellerImage: string;
}

@Component({
  selector: 'app-motors-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motor-listings.html',
  styleUrls: ['./motor-listings.css']
})
export class MotorListingsComponent implements OnInit {
  listings: MotorsListing[] = [];
  filteredListings: MotorsListing[] = [];
  selectedListing: MotorsListing | null = null;
  isLoading = false;
  currentImageIndex = 0;
  isFavorite = false;
  searchQuery = '';
  selectedSortBy = 'newest';

  selectedMakes: string[] = [];
  makes = ['Toyota','Mercedes','BMW','Honda','Yamaha','Audi'];
  selectedModels: string[] = [];
  models = ['Camry','V4','S1000RR','Civic','R1','A4'];
  minPrice = 0; maxPrice = 0; minYear = 2018; maxYear = 2024;
  minMileage = 0; maxMileage = 100000;
  selectedFuel = ''; fuels = ['Petrol','Diesel','Electric'];
  selectedTransmission = ''; transmissions = ['Automatic','Manual'];
  selectedCondition = 'New'; conditions = ['New','Like New','Used'];

  ngOnInit() { this.loadListings(); }

  loadListings() {
    this.isLoading = true;
    setTimeout(() => {
      this.listings = [
        {id:1,title:'2021 Toyota Camry',price:95000,currency:'AED',location:'Downtown, Dubai',
         year:2021,make:'Toyota',model:'Camry',mileage:'25,000 km',fuel:'Petrol',transmission:'Automatic',
         image:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1605559424843-9e4c228fb845?w=800&h=600&fit=crop'],
         condition:'Like New',description:'2021 Toyota Camry in perfect condition. Low mileage, full service history.',
         sellerName:'Sophia Clark',sellerPhone:'+971501234567',sellerImage:'https://i.pravatar.cc/150?img=47'},
        {id:2,title:'2020 Mercedes V4',price:185000,currency:'AED',location:'Abu Dhabi',
         year:2020,make:'Mercedes',model:'V4',mileage:'18,500 km',fuel:'Diesel',transmission:'Automatic',
         image:'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop'],
         condition:'Used',description:'Luxury Mercedes V4, excellent condition, serviced regularly.',
         sellerName:'Ahmed Khan',sellerPhone:'+971559876543',sellerImage:'https://i.pravatar.cc/150?img=12'},
        {id:3,title:'2019 BMW S1000RR',price:65000,currency:'AED',location:'Sharjah',
         year:2019,make:'BMW',model:'S1000RR',mileage:'12,000 km',fuel:'Petrol',transmission:'Manual',
         image:'https://images.unsplash.com/photo-1547956587-925d2e1f74d8?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1547956587-925d2e1f74d8?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1571896349840-f6d50a644dfe?w=800&h=600&fit=crop'],
         condition:'Like New',description:'BMW S1000RR superbike, track ready, low mileage.',
         sellerName:'Mohammed Ali',sellerPhone:'+971523456789',sellerImage:'https://i.pravatar.cc/150?img=32'},
        {id:4,title:'Honda Civic 2022',price:72000,currency:'AED',location:'Ajman',
         year:2022,make:'Honda',model:'Civic',mileage:'8,500 km',fuel:'Petrol',transmission:'Automatic',
         image:'https://images.unsplash.com/photo-1544622778-cd26dd43a5f9?w=400&h=300&fit=crop',
         images:['https://images.unsplash.com/photo-1544622778-cd26dd43a5f9?w=800&h=600&fit=crop'],
         condition:'New',description:'Brand new Honda Civic with full warranty.',
         sellerName:'Sara Ahmed',sellerPhone:'+971502345678',sellerImage:'https://i.pravatar.cc/150?img=15'}
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

  toggleMake(make:string) {
    const i = this.selectedMakes.indexOf(make); 
    if(i>-1) this.selectedMakes.splice(i,1); else this.selectedMakes.push(make);
    this.applyFilters();
  }
  isMakeSelected(make:string) { return this.selectedMakes.includes(make); }
  toggleModel(model:string) {
    const i = this.selectedModels.indexOf(model); 
    if(i>-1) this.selectedModels.splice(i,1); else this.selectedModels.push(model);
    this.applyFilters();
  }
  isModelSelected(model:string) { return this.selectedModels.includes(model); }
  selectFuel(fuel:string) { this.selectedFuel=fuel; this.applyFilters(); }
  selectTransmission(trans:string) { this.selectedTransmission=trans; this.applyFilters(); }
  selectCondition(cond:string) { this.selectedCondition=cond; this.applyFilters(); }
  selectSortBy(sort:string) { this.selectedSortBy=sort; this.applyFilters(); }
  isSortSelected(sort:string) { return this.selectedSortBy===sort; }

  applyFilters() {
    this.filteredListings = this.listings.filter(l => {
      if(this.minPrice>0 && l.price<this.minPrice) return false;
      if(this.maxPrice>0 && l.price>this.maxPrice) return false;
      if(this.minYear && l.year<this.minYear) return false;
      if(this.maxYear && l.year>this.maxYear) return false;
      if(this.minMileage>0 && parseInt(l.mileage.replace(/,/g,''))<this.minMileage) return false;
      if(this.maxMileage>0 && parseInt(l.mileage.replace(/,/g,''))>this.maxMileage) return false;
      if(this.selectedMakes.length && !this.selectedMakes.includes(l.make)) return false;
      if(this.selectedModels.length && !this.selectedModels.includes(l.model)) return false;
      if(this.selectedFuel && l.fuel!==this.selectedFuel) return false;
      if(this.selectedTransmission && l.transmission!==this.selectedTransmission) return false;
      return l.condition===this.selectedCondition;
    });
  }

  // Add this method to your Motors TS class (around line 120)
isConditionSelected(cond: string): boolean { 
  return this.selectedCondition === cond; 
}

  onSearch() {
    if(this.searchQuery.trim()) this.filteredListings = this.listings.filter(l=>l.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    else this.applyFilters();
  }
}
