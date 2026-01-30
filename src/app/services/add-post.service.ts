import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { DraftListingData } from './draft-listing.service';

@Injectable({ providedIn: 'root' })
export class AddPostService {

  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  async createListingFromDraft(draft: DraftListingData) {
    const m = draft.model;
    const mainCatId = draft.selectedMainCategoryId;

    /* ================= BASE PAYLOAD ================= */
    const payload: any = {
      title: m.title,
      description: m.description || '',
      price: mainCatId === 2 ? 0 : Number(m.price),
      currency: 'AED',

      categoryId: Number(draft.categoryId),
      city: m.city,
      country: 'UAE',
      address: m.address || '',
      status:'pending',
      contactPhone: m.contactPhone,
      contactEmail: m.contactEmail || null,
      contactWhatsapp: m.contactWhatsapp ? m.contactPhone : null,
      isNegotiable: !!m.isNegotiable
    };

    /* ================= MOTORS ================= */
    if (mainCatId === 1) {
      Object.assign(payload, {
        make: m.make,
        model: m.motorModel,
        variant: m.variant,
        condition: m.condition,
        year: m.year ? Number(m.year) : null,
        kilometres: m.kilometres ? Number(m.kilometres) : null,
        transmission: m.transmission,
        fuelType: m.fuelType,
        bodyType: m.bodyType,
        color: m.color,
        serviceHistory: !!m.serviceHistory
      });
    }

    /* ================= JOBS ================= */
    if (mainCatId === 2) {
      Object.assign(payload, {
        jobTitle: m.jobTitle,
        companyName: m.companyName,
        industry: m.industry,
        jobType: m.jobType,
        workplaceType: m.workplaceType,
        experienceMin: m.experienceMin,
        experienceMax: m.experienceMax,
        salaryMin: m.salaryMin,
        salaryMax: m.salaryMax,
        salaryPeriod: m.salaryPeriod,
        skillsRequired: m.skillsRequired || [],
        responsibilities: m.responsibilities || [],
        applicationEmail: m.applicationEmail
      });
    }

    /* ================= PROPERTY ================= */
    if (mainCatId === 3) {
      Object.assign(payload, {
        listingType: m.listingType,
        propertyType: m.propertyType,
        areaSqft: m.areaSqft,
        bedrooms: m.bedrooms,
        bathrooms: m.bathrooms,
        halls: m.halls,
        furnishing: m.furnishing,
        rentFrequency: m.rentFrequency,
        amenities: Array.isArray(m.amenities) ? m.amenities : []
      });
    }

    /* ================= ELECTRONICS ================= */
    if (mainCatId === 5) {
      Object.assign(payload, {
        subCategory: m.electronicSubCategory,
        brand: m.electronicBrand,
        model: m.electronicModel,
        condition: m.condition,
        storage: m.storage,
        color: m.color,
        hasOriginalBox: !!m.hasOriginalBox,
        hasCharger: !!m.hasCharger,
        warrantyStatus: m.warrantyStatus
      });
    }

    /* ================= CLASSIFIEDS / FURNITURE ================= */
    if (mainCatId === 4 || mainCatId === 6) {
      Object.assign(payload, {
        subCategory: m.subCategory,
        brand: m.brand,
        condition: m.condition,
        material: m.material || null,
        dimensions: m.dimensions || null
      });
    }

    console.log('FINAL PAYLOAD →', payload);

    /* ================= CREATE LISTING ================= */
    const response = await firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/listings`, payload)
    );

    const listingId = response?.data?.id;
    if (!listingId) throw new Error('Listing created but ID not returned');

    /* ================= IMAGE UPLOAD ================= */

    // JOBS → LOGO
    if (mainCatId === 2 && draft.logoFile) {
      const logo = await this.uploadSingleImage(draft.logoFile, 'jobs');
      await firstValueFrom(
        this.http.put(`${this.baseUrl}/listings/${listingId}`, {
          companyLogo: logo.url
        })
      );
    }

    // OTHERS → GALLERY
    if (mainCatId !== 2 && draft.files?.length) {
      await this.uploadGalleryImages(listingId, draft.files);
    }

    return response;
  }

  /* ================= UPLOAD HELPERS ================= */

  private async uploadSingleImage(file: File, folder: string) {
    console.log('Uploading image:', file.name);

    const form = new FormData();
    form.append('image', file);
    form.append('folder', folder);

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/upload/image`, form)
      );
      return res.data;
    } catch (err) {
      console.error('IMAGE UPLOAD FAILED', err);
      throw err;
    }
  }

  private async uploadGalleryImages(listingId: number, files: File[]) {
    for (let i = 0; i < files.length; i++) {
      const uploadRes = await this.uploadSingleImage(files[i], 'listings');

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/listings/${listingId}/images`, {
          url: uploadRes.url,
          s3Key: uploadRes.s3Key,
          orderIndex: i,
          isPrimary: i === 0
        })
      );
    }
  }
}
