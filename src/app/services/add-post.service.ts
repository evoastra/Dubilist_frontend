// src/app/services/add-post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { DraftListingData } from './draft-listing.service';

@Injectable({ providedIn: 'root' })
export class AddPostService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async createListingFromDraft(draft: DraftListingData) {
    const m = draft.model;
    const payload: any = {
      title: m.title,
      description: m.description,
      price: m.price,
      currency: m.currency || 'AED',
      categoryId: draft.categoryId,
      city: m.city,
      country: 'UAE'
    };

    switch (draft.selectedMainCategoryId) {
      case 1:
        payload.make = m.makeModel;
        payload.year = m.year;
        payload.condition = m.itemCondition;
        break;

      case 2:
        payload.brand = m.brand;
        payload.model = m.electronicsModel;
        payload.condition = m.electronicsCondition;
        payload.subCategory = m.electronicsType;
        break;

      case 3:
        payload.saleType = m.saleType;
        payload.bedrooms = m.bedrooms;
        payload.bathrooms = m.bathrooms;
        payload.area = m.area;
        payload.furnishing = m.furnishing;
        payload.attributes = m.amenities;
        break;

      case 4:
      case 5:
        payload.condition = m.itemCondition;
        payload.attributes = {
          material: m.material,
          dimensions: `${m.lengthCm}x${m.widthCm}x${m.heightCm}`,
          weight: m.weight
        };
        break;

      case 6:
        payload.jobTitle = m.jobTitle;
        payload.companyName = m.companyName;
        payload.industry = m.industry;
        payload.jobType = m.jobType;
        payload.experience = m.experience;
        payload.salaryMin = m.salaryMin;
        payload.salaryMax = m.salaryMax;
        payload.jobDescription = m.jobDescription;
        payload.responsibilities = m.responsibilities;
        payload.requirements = m.requirements;
        payload.benefits = m.benefits;
        payload.contactWebsite = m.companyWebsite;
        break;
    }

    const listing = await firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/listings`, payload)
    );

    if (draft.files?.length) {
      await this.uploadFilesAndAttachToListing(listing.data.id, draft.files);
    }

    return listing;
  }

  async uploadImageFile(file: File, opts?: { folder?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    if (opts?.folder) formData.append('folder', opts.folder);

    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/upload/image`, formData)
    );
  }

  async uploadFilesAndAttachToListing(listingId: number, files: File[]) {
    for (let i = 0; i < files.length; i++) {
      const upload = await this.uploadImageFile(files[i], { folder: 'listings' });
      await this.addImageToListing(listingId, {
        url: upload.data.url,
        key: upload.data.s3Key,
        orderIndex: i,
        isPrimary: i === 0
      });
    }
  }

  addImageToListing(
    listingId: number,
    image: { url: string; key?: string; orderIndex: number; isPrimary: boolean }
  ) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/listings/${listingId}/images`, image)
    );
  }
}
