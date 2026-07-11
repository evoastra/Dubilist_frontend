import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddPostService } from '../../services/add-post.service';
import { DraftListingService, DraftListingData } from '../../services/draft-listing.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-review-listing',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './review-listing.html',
  styleUrls: ['./review-listing.css']
})
export class ReviewListingComponent implements OnInit, OnDestroy {
  draft!: DraftListingData | null;
  model: any = {};
  mainCatSlug: string | null = null;
  mainCatName = '';

  get isMotorsCategory(): boolean { return this.mainCatSlug === 'motors'; }
  get isJobsCategory(): boolean { return this.mainCatSlug === 'jobs'; }
  get isPropertyCategory(): boolean { return this.mainCatSlug === 'property'; }
  get isClassifiedsCategory(): boolean { return this.mainCatSlug === 'classifieds'; }
  get isMobilesCategory(): boolean { return this.mainCatSlug === 'mobiles-tablets'; }
  get isFurnitureCategory(): boolean { return this.mainCatSlug === 'furniture-garden'; }
  
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
    this.mainCatSlug = this.draft.selectedMainCategorySlug;
    this.mainCatName = this.getMainCategoryName(this.mainCatSlug);
    
    this.generatePreviews();
  }

generatePreviews(): void {
  if (!this.draft?.files?.length) return;

  this.imagePreviews = this.draft.files.map(file =>
    URL.createObjectURL(file)
  );
}


  getMainCategoryName(slug: string | null): string {
    const map: Record<string, string> = {
      motors: 'Motors',
      jobs: 'Jobs',
      property: 'Property',
      classifieds: 'Classifieds',
      'mobiles-tablets': 'Mobiles & Tablets',
      'furniture-garden': 'Furniture & Garden',
      community: 'Community',
    };
    return slug ? (map[slug] || 'Listing') : 'Listing';
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
      // Backend sends { success:false, error:{ message } }, so the real reason is
      // at err.error.error.message — check that first before the generic HTTP message.
      const msg =
        err.error?.error?.message ||
        err.error?.message ||
        err.message ||
        'Something went wrong. Please try again.';
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
    this.router.navigate(['/my-ads']); // Adjust route as needed
  }
ngOnDestroy(): void {
  this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
}

 
}