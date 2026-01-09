// src/app/components/add-post/add-post.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DraftListingService, DraftListingData } from '../../services/draft-listing.service';

interface MainCategory {
  id: number;
  name: string;
}
interface SubCategory {
  id: number;
  name: string;
  parentId: number;
}

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.html',
  styleUrls: ['./add-post.css']
})
export class AddPostComponent implements OnInit {
generateDescription() {
throw new Error('Method not implemented.');
}

  math = Math;

  /* ---------------- CATEGORIES ---------------- */

  mainCategories: MainCategory[] = [
    { id: 1, name: 'Motors' },
    { id: 2, name: 'Electronics' },
    { id: 3, name: 'Property' },
    { id: 4, name: 'Classifieds' },
    { id: 5, name: 'Furniture' },
    { id: 6, name: 'Jobs' }
  ];

  subCategories: SubCategory[] = [
    { id: 10, name: 'Cars', parentId: 1 },
    { id: 11, name: 'Bikes', parentId: 1 },
    { id: 12, name: 'Trucks', parentId: 1 },

    { id: 20, name: 'Mobiles', parentId: 2 },
    { id: 21, name: 'Laptops', parentId: 2 },
    { id: 22, name: 'TVs', parentId: 2 },

    { id: 30, name: 'Apartment', parentId: 3 },
    { id: 31, name: 'Villa', parentId: 3 },
    { id: 32, name: 'Office', parentId: 3 },

    { id: 40, name: 'General', parentId: 4 },
    { id: 41, name: 'Services', parentId: 4 },

    { id: 50, name: 'Home Furniture', parentId: 5 },
    { id: 51, name: 'Office Furniture', parentId: 5 },

    { id: 60, name: 'Full-time', parentId: 6 },
    { id: 61, name: 'Part-time', parentId: 6 },
    { id: 62, name: 'Contract', parentId: 6 },
    { id: 63, name: 'Internship', parentId: 6 }
  ];

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'AC', 'Lift', 'Security', 'Balcony'];

  selectedMainCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;

  showSelectCategoryModal = false;

  /* ---------------- FILE UPLOAD ---------------- */

  files: File[] = [];
  imagePreviews: string[] = [];
  maxImages = 5;

  logoFile: File | null = null;
  logoPreview: string | null = null;

  acceptedFileTypes = 'image/png,image/jpeg,image/webp';

  /* ---------------- FORM MODEL ---------------- */

  model: any = {
    title: '',
    description: '',
    price: null,
    currency: 'AED',
    negotiable: false,

    city: '',
    neighbourhood: '',
    name: '',
    phone: '',
    showPhone: false,
    companyWebsite: '',

    // Motors
    makeModel: '',
    year: '',
    kilometres: '',
    hoursUsed: '',
    payloadCapacity: '',
    fuelType: '',
    transmission: '',

    // Electronics
    brand: '',
    electronicsModel: '',
    electronicsCondition: '',
    storage: '',
    colour: '',
    electronicsType: '',
    dimensions: '',

    // Property
    saleType: '',
    bedrooms: 0,
    bathrooms: 0,
    area: '',
    amenities: [],
    furnishing: '',

    // Classifieds / Furniture
    itemCondition: '',
    material: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    weight: '',

    // Jobs
    jobTitle: '',
    companyName: '',
    industry: '',
    skillsRequired: '',
    education: '',
    jobType: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    jobDescription: '',
    responsibilities: '',
    requirements: '',
    benefits: ''
  };

  constructor(
    private draftService: DraftListingService,
    private router: Router
  ) {}

  /* ---------------- INIT ---------------- */

  ngOnInit(): void {
    const draft = this.draftService.getDraft();
    if (!draft) return;

    this.selectedMainCategoryId = draft.selectedMainCategoryId;
    this.selectedSubCategoryId = draft.selectedSubCategoryId;
    this.model = { ...draft.model };

    this.files = draft.files || [];
    this.imagePreviews = this.files.map(f => URL.createObjectURL(f));

    this.logoFile = draft.logoFile || null;
    this.logoPreview = draft.logoPreview || null;
  }

  /* ---------------- GETTERS ---------------- */

  get filteredSubCategories(): SubCategory[] {
    return this.subCategories.filter(s => s.parentId === this.selectedMainCategoryId);
  }

  get isJobsCategory(): boolean {
    return this.selectedMainCategoryId === 6;
  }

  get mainCatName(): string {
    return this.mainCategories.find(c => c.id === this.selectedMainCategoryId)?.name || '';
  }

  getSubCategoryName(id: number): string {
    return this.subCategories.find(s => s.id === id)?.name || '';
  }

  get fileUploadLabel(): string {
    return this.isJobsCategory ? 'Company Logo' : 'Upload Images';
  }

  /* ---------------- CATEGORY HANDLING ---------------- */
   
  get logoSizeMB(): number {
  if (!this.logoFile) return 0;
  return this.logoFile.size / 1024 / 1024;
}


  onMainCategoryChange(id: number) {
    this.selectedMainCategoryId = id;
    this.selectedSubCategoryId = null;
    this.files = [];
    this.imagePreviews = [];
    this.logoFile = null;
    this.logoPreview = null;
  }

  onSubCategoryChange(id: number) {
    this.selectedSubCategoryId = id;
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

  /* ---------------- AMENITIES ---------------- */

  toggleAmenity(a: string) {
    const idx = this.model.amenities.indexOf(a);
    idx > -1
      ? this.model.amenities.splice(idx, 1)
      : this.model.amenities.push(a);
  }

  /* ---------------- FILE HANDLING ---------------- */

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    if (this.isJobsCategory) {
      const file = input.files[0];
      this.logoFile = file;
      this.logoPreview = URL.createObjectURL(file);
    } else {
      const newFiles = Array.from(input.files).slice(
        0,
        this.maxImages - this.files.length
      );

      newFiles.forEach(f => {
        this.files.push(f);
        this.imagePreviews.push(URL.createObjectURL(f));
      });
    }

    input.value = '';
  }

  removeImage(index: number) {
    URL.revokeObjectURL(this.imagePreviews[index]);
    this.imagePreviews.splice(index, 1);
    this.files.splice(index, 1);
  }

  removeLogo() {
    if (this.logoPreview) URL.revokeObjectURL(this.logoPreview);
    this.logoFile = null;
    this.logoPreview = null;
  }

  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDragLeave(e: DragEvent) { e.preventDefault(); }

  onDropFiles(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer?.files) return;
    this.onFileChange({ target: { files: e.dataTransfer.files } } as any);
  }

  onDropLogo(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer?.files?.length) return;
    this.logoFile = e.dataTransfer.files[0];
    this.logoPreview = URL.createObjectURL(this.logoFile);
  }

  /* ---------------- SUBMIT ---------------- */

  submit(f?: NgForm) {
    if (!this.selectedMainCategoryId) {
      this.showSelectCategoryModal = true;
      return;
    }

    if (!this.model.title || !this.model.price) {
      alert('Title and price are required');
      return;
    }

    const draft: DraftListingData = {
      categoryId: this.selectedSubCategoryId ?? this.selectedMainCategoryId,
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
