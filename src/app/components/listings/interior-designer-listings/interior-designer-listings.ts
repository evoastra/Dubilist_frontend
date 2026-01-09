import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';

interface Designer {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  priceRange: string;
  phone: string;
  about: string;
  services: string[];
  styles: string[];
  image: string;
}

@Component({
  selector: 'app-interior-designer-listings',
  templateUrl: './interior-designer-listings.html',
  styleUrls: ['./interior-designer-listings.css'],
  imports:[CommonModule,FormsModule]
})
export class InteriorDesignerListingsComponent {
  searchForm: FormGroup;
  selectedDesigner: Designer | null = null;

  // Reliable image URLs from Picsum
  designers: Designer[] = [
    {
      id: 1,
      name: 'Olivia Carter',
      location: 'Business Bay, Dubai',
      rating: 4.7,
      reviews: 234,
      priceRange: 'AED 150 / Hour',
      phone: '056-1234567',
      about: '8 years in industry specializing in creating interiors that reflect my client\'s lifestyle. Translating over 10 functional and aesthetical spaces with sustainable interior design.',
      services: ['Full-service Residential Design', 'Color Consultation', 'Virtual client consultation'],
      styles: ['Modern Residential', 'Commercial Offices', 'Luxury', 'Eco Friendly', 'Remote Design'],
      image: 'https://picsum.photos/id/1027/400/400'
    },
    {
      id: 2,
      name: 'Amelia Yusuf',
      location: 'Business Bay, Dubai',
      rating: 4.8,
      reviews: 32,
      priceRange: 'AED 200 / Hour',
      phone: '050-9876543',
      about: 'Specialist in Bohemian & Rustic Interiors. Focused on creating warm, organic living environments for modern professionals.',
      services: ['Interior Styling', 'Furniture Selection', 'On-site consultation'],
      styles: ['Bohemian', 'Rustic', 'Modern', 'Coastal'],
      image: 'https://picsum.photos/id/342/400/400'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [''],
      location: ['Dubai'],
      style: ['Modern']
    });
  }

  goToProfile(designer: Designer) {
    this.selectedDesigner = designer;
   // window.scrollTo(0, 0); // Reset scroll to top of modal
  }

  closeDetail() {
    this.selectedDesigner = null;
  }
}
