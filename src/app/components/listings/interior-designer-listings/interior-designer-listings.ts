import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignerService } from '../../../services/designer-service';

interface UIDesigner {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  priceRange: string;
  phone: string;
  about: string;
  services: string[];
  styles: string[];
}

@Component({
  selector: 'app-interior-designer-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interior-designer-listings.html',
  styleUrls: ['./interior-designer-listings.css']
})
export class InteriorDesignerListingsComponent implements OnInit {

  designers: UIDesigner[] = [];
  selectedDesigner: UIDesigner | null = null;
  isLoading = false;

  // Filters
  selectedStyle = '';
  selectedCity = 'Dubai';
  minRate?: number;
  maxRate?: number;
  sort = 'rating_desc';

  constructor(private designerService: DesignerService) {}

  ngOnInit(): void {
    this.loadDesigners();
  }

  /** 🔹 LOAD DESIGNERS */
  loadDesigners(): void {
    this.isLoading = true;

    this.designerService.getAllDesigners({
      city: this.selectedCity,
      style: this.selectedStyle,
      minRate: this.minRate,
      maxRate: this.maxRate,
      sort: this.sort
    }).subscribe({
      next: (res) => {
        this.designers = res.map(d => this.mapDesigner(d));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /** 🔹 VIEW PROFILE */
  goToProfile(designer: UIDesigner): void {
    this.designerService.getDesignerById(designer.id).subscribe(d => {
      this.selectedDesigner = this.mapDesigner(d);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  closeDetail(): void {
    this.selectedDesigner = null;
  }

  /** 🔹 MAP BACKEND → UI */
  private mapDesigner(d: any): UIDesigner {
    return {
      id: d.id,
      name: d.user?.name || 'Designer',
      image: d.profileImage || 'https://via.placeholder.com/400',
      rating: d.averageRating || 0,
      reviews: d.reviewsCount || 0,
      location: d.location,
      about: d.bio,
      services: d.services || [],
      styles: d.specializations || [],
      phone: d.user?.phone || '',
      priceRange: `${d.currency} ${d.hourlyRate} / Hour`
    };
  }

  /** 🔹 FILTER ACTION */
  applyFilters(): void {
    this.loadDesigners();
  }

  /** 🔹 CONTACT */
  callDesigner(): void {
    if (this.selectedDesigner?.phone) {
      window.location.href = `tel:${this.selectedDesigner.phone}`;
    }
  }

  chatWhatsApp(): void {
    if (this.selectedDesigner?.phone) {
      const phone = this.selectedDesigner.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  }

  /** 🔹 BOOK CONSULTATION */
  bookConsultation(): void {
    if (!this.selectedDesigner) return;

    const payload = {
      dateTime: new Date().toISOString(),
      duration: 60,
      bookingType: 'consultation',
      userName: 'Guest User',
      userPhone: '+971500000000',
      meetingType: 'in-person'
    };

    this.designerService
      .createBooking(this.selectedDesigner.id, payload)
      .subscribe(() => {
        alert('Consultation booked successfully!');
      });
  }
}
