// src/app/components/review-listing/review-listing.component.ts
import { Component, OnInit } from '@angular/core';
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
export class ReviewListingComponent implements OnInit {

  draft!: DraftListingData | null;
  model: any = {};

  mainCatId!: number;
  mainCatName = '';

  imagePreviews: string[] = [];
  isSubmitting = false;

  constructor(
    private draftService: DraftListingService,
    private addPostService: AddPostService,
    private router: Router
  ) {}

  /* ---------------- INIT ---------------- */

  ngOnInit(): void {
    this.draft = this.draftService.getDraft();

    if (!this.draft) return;

    this.model = this.draft.model;
    this.mainCatId = this.draft.selectedMainCategoryId!;
    this.mainCatName = this.getMainCategoryName(this.mainCatId);

    // Images OR logo preview
    if (this.draft.logoPreview) {
      this.imagePreviews = [this.draft.logoPreview];
    } else {
      this.imagePreviews = (this.draft.files || []).map(f =>
        URL.createObjectURL(f)
      );
    }
  }

  /* ---------------- HELPERS ---------------- */

  getMainCategoryName(id: number): string {
    const map: Record<number, string> = {
      1: 'Motors',
      2: 'Electronics',
      3: 'Property',
      4: 'Classifieds',
      5: 'Furniture',
      6: 'Jobs'
    };
    return map[id] || '';
  }

  /* ---------------- ACTIONS ---------------- */

  editAd() {
    this.router.navigate(['/add-post']);
  }

  async publishAd() {
    if (!this.draft || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      await this.addPostService.createListingFromDraft(this.draft);

      // clear draft after success
      this.draftService.clearDraft();

      // redirect to success / listings
      this.router.navigate(['/my-listings']);
    } catch (err) {
      console.error('Publish failed', err);
      alert('Failed to publish ad. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
