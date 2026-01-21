// src/app/services/draft-listing.service.ts
import { Injectable } from '@angular/core';

export interface DraftListingData {
  categoryId: number; // This is the specific sub-category ID (or main if no sub)
  selectedMainCategoryId: number | null;
  selectedSubCategoryId: number | null;

  model: any; // The raw form data from AddPostComponent

  // Images (non-job categories)
  files?: File[];

  // Job category (company logo)
  logoFile?: File | null;
  logoPreview?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DraftListingService {

  private draft: DraftListingData | null = null;

  setDraft(data: DraftListingData) {
    this.draft = {
      categoryId: data.categoryId,
      selectedMainCategoryId: data.selectedMainCategoryId,
      selectedSubCategoryId: data.selectedSubCategoryId,
      
      // Create a copy of the model to avoid reference issues
      model: { ...data.model },
      
      // Store raw files
      files: data.files ? [...data.files] : [],
      
      logoFile: data.logoFile ?? null,
      logoPreview: data.logoPreview ?? null
    };
  }

  getDraft(): DraftListingData | null {
    return this.draft;
  }

  clearDraft() {
    this.draft = null;
  }
}