import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddPostService } from '../../services/add-post.service';
import { DraftListingService, DraftListingData } from '../../services/draft-listing.service';

@Component({
  selector: 'app-review-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-listing.html',
  styleUrls: ['./review-listing.css']
})
export class ReviewListingComponent implements OnInit, OnDestroy {
  draft!: DraftListingData | null;
  model: any = {};
  mainCatId!: number;
  mainCatName = '';
  
  // For display
  imagePreviews: string[] = [];
  
  isSubmitting = false;
  showSuccessModal = false;

  constructor(
    private draftService: DraftListingService,
    private addPostService: AddPostService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.draft = this.draftService.getDraft();
    
    // Security: If no draft exists (direct URL access), go back
    if (!this.draft) {
      this.router.navigate(['/add-post']);
      return;
    }

    this.model = this.draft.model;
    this.mainCatId = this.draft.selectedMainCategoryId!;
    this.mainCatName = this.getMainCategoryName(this.mainCatId);
    
    this.generatePreviews();
  }

  generatePreviews() {
    if (!this.draft) return;
    
    // 1. Job Logo
    if (this.mainCatId === 2 && this.draft.logoPreview) {
      this.imagePreviews = [this.draft.logoPreview];
    } 
    // 2. Gallery Images
    else if (this.draft.files && this.draft.files.length > 0) {
      this.imagePreviews = this.draft.files.map(f => URL.createObjectURL(f));
    }
  }

  getMainCategoryName(id: number): string {
    const map: Record<number, string> = {
      1: 'Motors',
      2: 'Jobs',
      3: 'Property',
      4: 'Classifieds',
      5: 'Electronics',
      6: 'Furniture'
    };
    return map[id] || 'Listing';
  }

  async publishAd() {
    if (!this.draft || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      // Call the service to Process Data -> Call API -> Upload Images
      await this.addPostService.createListingFromDraft(this.draft);
      
      // On success:
      this.draftService.clearDraft();
      this.showSuccessModal = true;
      
    } catch (err: any) {
      console.error('Publishing error:', err);
      const msg = err.error?.message || err.message || 'Something went wrong. Please try again.';
      alert(`Error: ${msg}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  editAd() {
    // Navigate back. The AddPostComponent ngOnInit will pick up the draft data
    this.router.navigate(['/add-post']);
  }

  goToMyAds() {
    this.showSuccessModal = false;
    this.router.navigate(['/my-listings']); // Adjust route as needed
  }

  ngOnDestroy() {
    // Cleanup Object URLs specifically created in this component
    // Note: logoPreview comes from service, so we treat it carefully, 
    // but the gallery previews here are fresh ObjectURLs
    if (this.mainCatId !== 2) {
      this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    }
  }
}