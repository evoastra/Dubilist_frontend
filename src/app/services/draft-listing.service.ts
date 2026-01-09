// src/app/services/draft-listing.service.ts
import { Injectable } from '@angular/core';

export interface DraftListingData {
  categoryId: number;
  selectedMainCategoryId: number | null;
  selectedSubCategoryId: number | null;

  model: any;

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

      // deep-ish copy for safety
      model: { ...data.model },

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
