// src/app/components/add-post/add-post.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

import { DraftListingService, DraftListingData } from '../../services/draft-listing.service';
import { AiDescriptionService } from '../../services/ai-description-service';

/* -------------------------------- INTERFACES -------------------------------- */

interface MainCategory {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  parentId: number;
}

/* -------------------------------- COMPONENT -------------------------------- */

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.html',
  styleUrls: ['./add-post.css']
})
export class AddPostComponent implements OnInit, OnDestroy {

  math = Math;

  /* -------------------- CATEGORY DATA -------------------- */

  mainCategories: MainCategory[] = [
    { id: 1, name: 'Motors' },
    { id: 2, name: 'Jobs' },
    { id: 3, name: 'Property' },
    { id: 4, name: 'Classifieds' },
    { id: 5, name: 'Electronics' },
    { id: 6, name: 'Furniture' }
  ];

  subCategories: SubCategory[] = [
    { id: 10, name: 'Cars', parentId: 1 },
    { id: 11, name: 'Bikes', parentId: 1 },
    { id: 12, name: 'Heavy Vehicles', parentId: 1 },
    { id: 13, name: 'Others', parentId: 1 },

    { id: 60, name: 'Full-time', parentId: 2 },
    { id: 61, name: 'Part-time', parentId: 2 },
    { id: 62, name: 'Freelance', parentId: 2 },
    { id: 63, name: 'Internship', parentId: 2 },

    { id: 30, name: 'Apartment', parentId: 3 },
    { id: 31, name: 'Villa', parentId: 3 },
    { id: 32, name: 'Commercial', parentId: 3 },
    { id: 33, name: 'Land', parentId: 3 },
    { id: 34, name: 'Flats', parentId: 3 },
    { id: 35, name: 'Others', parentId: 3 },

    { id: 40, name: 'Books', parentId: 4 },
    { id: 41, name: 'Clothing', parentId: 4 },
    { id: 42, name: 'Sports Equipment', parentId: 4 },
    { id: 43, name: 'Musical Instruments', parentId: 4 },
    { id: 44, name: 'Gym Equipment', parentId: 4 },
    { id: 45, name: 'Others', parentId: 4 },

    { id: 20, name: 'Mobiles', parentId: 5 },
    { id: 21, name: 'Laptops', parentId: 5 },
    { id: 22, name: 'Washing Machines', parentId: 5 },
    { id: 23, name: 'Televisions', parentId: 5 },
    { id: 24, name: 'Others', parentId: 5 },

    { id: 50, name: 'Home Furniture', parentId: 6 },
    { id: 51, name: 'Office Furniture', parentId: 6 },
    { id: 52, name: 'Outdoor Furniture', parentId: 6 },
    { id: 53, name: 'Others', parentId: 6 }
  ];

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'AC', 'Lift', 'Security', 'Balcony'];

  selectedMainCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  showSelectCategoryModal = false;

  /* -------------------- FILE UPLOAD -------------------- */

  files: File[] = [];
  imagePreviews: string[] = [];
  maxImages = 5;

  logoFile: File | null = null;
  logoPreview: string | null = null;

  acceptedFileTypes = 'image/png,image/jpeg,image/webp';

  /* -------------------- FORM MODEL (API ALIGNED) -------------------- */

 model: any = {
  title: '',
  description: '',
  price: null,
  currency: 'AED',
  isNegotiable: false,
  city: '',
  country: 'UAE',
  address: '',

  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactWhatsapp: '',

  // Motors
  make: '',
  model: '',
  variant: '',
  motor_type: '',

  year: null,
  kilometres: null,
  transmission: '',
  fuelType: '',
  bodyType: '',
  color: '',
  serviceHistory: false,

  // Electronics / Classifieds / Furniture
  subCategory: '',
  brand: '',
  modelName: '',
  condition: '',
  storage: '',

  // Property
  listingType: '',
  propertyType: '',
  areaSqft: null,
  bedrooms: 0,
  bathrooms: 0,
  halls: 0,
  furnishing: '',
  rentFrequency: '',
  amenities: [] as string[],

  // Jobs
  jobTitle: '',
  companyName: '',
  industry: '',
  jobType: '',
  workplaceType: '',
  experienceMin: null,
  experienceMax: null,
  salaryMin: null,
  salaryMax: null,
  salaryPeriod: 'Monthly',
  skillsRequired: [] as string[],
  responsibilities: [] as string[],
  applicationEmail: ''
};


  constructor(
    private draftService: DraftListingService,
    private router: Router,
    private aiService: AiDescriptionService
  ) {}

  /* -------------------- LIFECYCLE -------------------- */

  ngOnInit(): void {
    const draft = this.draftService.getDraft();
    if (!draft) return;

    this.selectedMainCategoryId = draft.selectedMainCategoryId;
    this.selectedSubCategoryId = draft.selectedSubCategoryId;
    this.model = { ...this.model, ...draft.model };

    this.files = draft.files || [];
    this.imagePreviews = this.files.map(f => URL.createObjectURL(f));

    this.logoFile = draft.logoFile || null;
    if (this.logoFile) {
      this.logoPreview = URL.createObjectURL(this.logoFile);
    }
  }

  ngOnDestroy(): void {
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (this.logoPreview) URL.revokeObjectURL(this.logoPreview);
  }

  /* -------------------- GETTERS -------------------- */

  get filteredSubCategories(): SubCategory[] {
    return this.subCategories.filter(s => s.parentId === this.selectedMainCategoryId);
  }

  get isJobsCategory(): boolean {
    return this.selectedMainCategoryId === 2;
  }

  get mainCategoryName(): string {
    return this.mainCategories.find(c => c.id === this.selectedMainCategoryId)?.name || '';
  }

  get fileUploadLabel(): string {
    return this.isJobsCategory ? 'Company Logo' : 'Upload Images';
  }

  /* -------------------- CATEGORY HANDLING -------------------- */

  onMainCategoryChange(id: number) {
    this.selectedMainCategoryId = id;
    this.selectedSubCategoryId = null;

    this.files = [];
    this.imagePreviews.forEach(u => URL.revokeObjectURL(u));
    this.imagePreviews = [];

    this.removeLogo();
  }

  onSubCategoryChange(id: number) {
    this.selectedSubCategoryId = id;
     this.applySubCategoryToModel(id);
  }

  onFieldAttemptFocus(event: Event) {
    if (!this.selectedMainCategoryId) {
      event.preventDefault();
      this.showSelectCategoryModal = true;
    }
  }

  closeCategoryModal() {
    this.showSelectCategoryModal = false;
  }

  /* -------------------- AMENITIES -------------------- */

  toggleAmenity(a: string) {
    const idx = this.model.amenities.indexOf(a);
    idx >= 0 ? this.model.amenities.splice(idx, 1) : this.model.amenities.push(a);
  }

  /* -------------------- FILE HANDLING -------------------- */

  onFileChange(event: any) {
    const inputFiles = event.target?.files || event.dataTransfer?.files;
    if (!inputFiles) return;

    if (this.isJobsCategory) {
      const file = inputFiles[0];
      if (this.logoPreview) URL.revokeObjectURL(this.logoPreview);
      this.logoFile = file;
      this.logoPreview = URL.createObjectURL(file);
    } else {
      Array.from(inputFiles)
        .slice(0, this.maxImages - this.files.length)
        .forEach((f: any) => {
          this.files.push(f);
          this.imagePreviews.push(URL.createObjectURL(f));
        });
    }

    if (event.target) event.target.value = '';
  }

  removeImage(i: number) {
    URL.revokeObjectURL(this.imagePreviews[i]);
    this.imagePreviews.splice(i, 1);
    this.files.splice(i, 1);
  }

  removeLogo() {
    if (this.logoPreview) URL.revokeObjectURL(this.logoPreview);
    this.logoFile = null;
    this.logoPreview = null;
  }
  
  applySubCategoryToModel(id: number) {
  const sub = this.subCategories.find(s => s.id === id);
  if (!sub) return;

  switch (this.selectedMainCategoryId) {
    case 1:
      this.model.motor_type = sub.name;
      break;
    case 2:
      this.model.jobType = sub.name;
      break;
    case 3:
      this.model.propertyType = sub.name;
      break;
    case 4:
    case 5:
    case 6:
      this.model.subCategory = sub.name;
      break;
  }
}





  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDragLeave(e: DragEvent) { e.preventDefault(); }
  onDropFiles(e: DragEvent) { e.preventDefault(); this.onFileChange(e); }
  onDropLogo(e: DragEvent) { e.preventDefault(); this.onFileChange(e); }

  /* -------------------- AI DESCRIPTION -------------------- */

  generateDescription() {
    if (!this.model.title || !this.selectedMainCategoryId) {
      alert('Select category and title first');
      return;
    }

    const email = localStorage.getItem('userEmail') || 'anonymous';
    const userIdHash = CryptoJS.SHA256(email).toString();

    const payload: any = {
      user_id: userIdHash,
      user_details: {
        title: this.model.title,
        category: this.mainCategoryName,
        price: this.model.price,
        city: this.model.city
      }
    };

    this.aiService.generate(payload).subscribe({
      next: res => this.model.description = res?.description || '',
      error: () => alert('AI generation failed')
    });
  }

  /* -------------------- SUBMIT -------------------- */

  submit(form?: NgForm) {
    if (!this.selectedMainCategoryId) {
      this.showSelectCategoryModal = true;
      return;
    }

    if (!this.model.title) {
      alert('Title is required');
      return;
    }
    if (this.selectedMainCategoryId === 2) {
  this.model.skillsRequired =
    typeof this.model.skillsRequired === 'string'
      ? this.model.skillsRequired.split('\n').filter(Boolean)
      : this.model.skillsRequired;

  this.model.responsibilities =
    typeof this.model.responsibilities === 'string'
      ? this.model.responsibilities.split('\n').filter(Boolean)
      : this.model.responsibilities;
}


    if (this.selectedMainCategoryId !== 2 && !this.model.price) {
      alert('Price is required');
      return;
    }

    const draft: DraftListingData = {
      categoryId: this.selectedMainCategoryId,

      selectedMainCategoryId: this.selectedMainCategoryId,
      selectedSubCategoryId: this.selectedSubCategoryId,
      model: this.model,
      files: this.files,
      logoFile: this.logoFile,
      logoPreview: this.logoPreview
    };

    this.draftService.setDraft(draft);
    this.router.navigate(['/add-post/review']);
  }
}
