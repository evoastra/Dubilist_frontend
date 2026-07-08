import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ListingsService } from '../../services/listing-service';
import { AuthService } from '../../services/auth-service';
import { ChatService } from '../../services/chat-service';
import { environment } from '../../../environments/environment';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetailsComponent implements OnInit {

  /* ===================== STATE ===================== */
  listing: any = null;
  images: string[] = [];
  detailRows: DetailRow[] = [];

  currentImageIndex = 0;
  isLoading = true;
  notFound = false;

  isLoggedIn = false;
  isFavorite = false;

  /* ===================== REPORT MODAL ===================== */
  showReportModal = false;
  reportReason = '';
  reportDetails = '';
  isReporting = false;
  reportReasons = [
    'Fraud / Scam',
    'Inappropriate Content',
    'Duplicate Listing',
    'Wrong Information',
    'Other'
  ];

  showShareToast = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private authService: AuthService,
    private chatService: ChatService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.notFound = true;
        this.isLoading = false;
        return;
      }
      this.loadListing(id);
    });
  }

  private loadListing(id: number): void {
    this.isLoading = true;
    this.notFound = false;

    this.listingsService.getSingleListing(id).subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (!data) {
          this.notFound = true;
          this.isLoading = false;
          return;
        }

        this.listing = data;
        this.images = (data.images || [])
          .map((img: any) => this.resolveImageUrl(img.imageUrl))
          .filter(Boolean);
        if (!this.images.length) {
          this.images = ['assets/placeholder.png'];
        }
        this.currentImageIndex = 0;
        this.detailRows = this.buildDetailRows(data);
        this.isLoading = false;

        this.checkFavorite(id);
        this.scrollToTop();
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  private checkFavorite(id: number): void {
    if (!this.isLoggedIn) return;
    this.listingsService.getFavoriteListingIds().subscribe({
      next: (ids: number[]) => (this.isFavorite = (ids || []).includes(id)),
      error: () => {}
    });
  }

  /* ===================== IMAGE HELPERS ===================== */
  private resolveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `${environment.apiUrl}${url}`;
    return url;
  }

  selectImage(i: number): void {
    this.currentImageIndex = i;
  }

  previousImage(): void {
    if (!this.images.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage(): void {
    if (!this.images.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  handleImageError(event: any): void {
    event.target.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBob3RvIENvbWluZyBTb29uPC90ZXh0Pjwvc3ZnPg==';
  }

  /* ===================== FORMATTING ===================== */
  get formattedPrice(): string {
    if (!this.listing) return '';
    const currency = this.listing.currency || 'AED';
    return `${currency} ${Number(this.listing.price).toLocaleString()}`;
  }

  get categoryName(): string {
    return this.listing?.category?.name || 'Listing';
  }

  get categorySlug(): string {
    return (this.listing?.category?.name || '').toLowerCase();
  }

  /* ===================== DYNAMIC DETAILS ===================== */
  private buildDetailRows(l: any): DetailRow[] {
    const rows: DetailRow[] = [];

    const push = (label: string, value: any, suffix = '') => {
      if (value === null || value === undefined || value === '') return;
      rows.push({ label, value: `${value}${suffix}` });
    };

    const cap = (v: any) =>
      typeof v === 'string' && v.length
        ? v.charAt(0).toUpperCase() + v.slice(1)
        : v;

    const m = l.motorDetails;
    if (m) {
      push('Make', m.make);
      push('Model', m.model);
      push('Year', m.year);
      push('Kilometres', m.kilometres ? Number(m.kilometres).toLocaleString() : null, ' km');
      push('Fuel Type', cap(m.fuelType));
      push('Transmission', cap(m.transmission));
      push('Body Type', cap(m.bodyType));
      push('Color', cap(m.color));
      push('Condition', cap(m.condition));
    }

    const p = l.propertyDetails;
    if (p) {
      push('Property Type', cap(p.propertyType));
      push('Purpose', cap(p.purpose));
      push('Bedrooms', p.bedrooms);
      push('Bathrooms', p.bathrooms);
      push('Area', p.area ? Number(p.area).toLocaleString() : null, ' sqft');
      push('Furnishing', cap(p.furnishing));
    }

    const e = l.electronicDetails;
    if (e) {
      push('Brand', e.brand);
      push('Model', e.model);
      push('Condition', cap(e.condition));
      push('Warranty', cap(e.warranty));
    }

    const f = l.furnitureDetails;
    if (f) {
      push('Type', cap(f.type));
      push('Material', cap(f.material));
      push('Condition', cap(f.condition));
    }

    const c = l.classifiedDetails;
    if (c) {
      push('Type', cap(c.type));
      push('Condition', cap(c.condition));
    }

    const j = l.jobDetails;
    if (j) {
      push('Company', j.company);
      push('Employment Type', cap(j.employmentType));
      push('Experience', cap(j.experienceLevel));
      push('Salary', j.salaryMin ? `${Number(j.salaryMin).toLocaleString()} - ${Number(j.salaryMax).toLocaleString()}` : null);
    }

    // Generic location fields
    push('City', l.city);
    push('Country', l.country);

    return rows;
  }

  /* ===================== ACTIONS ===================== */
  private requireLogin(): boolean {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }

  toggleFavorite(): void {
    if (!this.requireLogin() || !this.listing) return;

    const prev = this.isFavorite;
    this.isFavorite = !prev;

    const req = this.isFavorite
      ? this.listingsService.addToFavorites(this.listing.id)
      : this.listingsService.removeFromFavorites(this.listing.id);

    req.subscribe({
      error: () => {
        this.isFavorite = prev;
        alert('Unable to update favorite');
      }
    });
  }

  callSeller(): void {
    if (!this.requireLogin()) return;
    const phone = this.listing?.contactPhone;
    if (phone && isPlatformBrowser(this.platformId)) {
      window.location.href = `tel:${phone}`;
    }
  }

  chatWhatsApp(): void {
    if (!this.requireLogin()) return;
    const raw = this.listing?.contactWhatsapp || this.listing?.contactPhone;
    if (!raw) return;
    const phone = String(raw).replace(/\D/g, '');
    if (isPlatformBrowser(this.platformId)) {
      const text = encodeURIComponent(`Hi, I'm interested in your listing: ${this.listing?.title}`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  }

  startChat(): void {
    if (!this.requireLogin() || !this.listing) return;

    this.chatService.createOrGetRoom(this.listing.id).subscribe({
      next: (res: any) => {
        const roomId = res?.data?.id;
        if (roomId) {
          this.router.navigate(['/my-chats'], { queryParams: { roomId } });
        }
      },
      error: () => alert('Unable to start chat')
    });
  }

  shareListing(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;
    const nav: any = window.navigator;
    if (nav.share) {
      nav.share({ title: this.listing?.title, url }).catch(() => {});
    } else if (nav.clipboard) {
      nav.clipboard.writeText(url).then(() => {
        this.showShareToast = true;
        setTimeout(() => (this.showShareToast = false), 2000);
      });
    }
  }

  goBack(): void {
    if (isPlatformBrowser(this.platformId) && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  /* ===================== REPORT ===================== */
  openReport(): void {
    if (!this.requireLogin()) return;
    this.reportReason = '';
    this.reportDetails = '';
    this.showReportModal = true;
  }

  closeReport(): void {
    this.showReportModal = false;
  }

  submitReport(): void {
    if (!this.reportReason.trim()) {
      alert('Please select a reason');
      return;
    }
    this.isReporting = true;
    this.listingsService.reportListing(this.listing.id, {
      reason: this.reportReason,
      details: this.reportDetails
    }).subscribe({
      next: () => {
        this.isReporting = false;
        this.closeReport();
        alert('Report submitted successfully ✅');
      },
      error: (err: any) => {
        this.isReporting = false;
        alert(err?.error?.message || err?.message || 'Failed to submit report');
      }
    });
  }

  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
