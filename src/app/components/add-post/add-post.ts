import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

import { DraftListingService, DraftListingData } from '../../services/draft-listing.service';
import { AiDescriptionService } from '../../services/ai-description-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ListingsService } from '../../services/listing-service';

/* -------------------------------- INTERFACES -------------------------------- */

interface MainCategory {
  id: number;
  name: string;
  slug: string;
  children?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  parentId: number;
  slug: string;
}

/* -------------------------------- COMPONENT -------------------------------- */

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-post.html',
  styleUrls: ['./add-post.css']
})
export class AddPostComponent implements OnInit {

  math = Math;

  /* -------------------- CATEGORY DATA -------------------- */

  mainCategories: MainCategory[] = [];
  subCategories: SubCategory[] = [];
  mainCategoryName: string = '';
  loadingCategories = false;

  // Fallback subcategories in case API fails
  fallbackSubCategories: SubCategory[] = [
    // Furniture & Garden (Navbar Match)
    { id: 50, name: 'Home Accessories', parentId: 6, slug: 'home-accessories' },
    { id: 51, name: 'Garden & Outdoor', parentId: 6, slug: 'garden-outdoor' },
    { id: 52, name: 'Lighting & Fans', parentId: 6, slug: 'lighting-fans' },
    { id: 53, name: 'Rugs & Carpets', parentId: 6, slug: 'rugs-carpets' },
    { id: 54, name: 'Curtains & Blinds', parentId: 6, slug: 'curtains-blinds' },
    { id: 55, name: 'Tools & Home Improvement', parentId: 6, slug: 'tools-home-improvement' },
    { id: 56, name: 'Others', parentId: 6, slug: 'others' }
  ];

  motorBrands = [
    'Toyota', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 
    'Hyundai', 'Ford', 'Chevrolet', 'Kia', 'Mitsubishi', 'Land Rover', 
    'Jeep', 'Porsche', 'Lexus', 'Dodge', 'Others'
  ];

  mobileBrands = [
    'Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'Oppo', 
    'OnePlus', 'Honor', 'Vivo', 'Realme', 'Sony Ericsson', 'Nokia', 'Motorola', 'Others'
  ];

  amenitiesOptions = ['Parking', 'Gym', 'Pool', 'AC', 'Lift', 'Security', 'Balcony'];

  selectedMainCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  showSelectCategoryModal = false;

  /* -------------------- FILE UPLOAD -------------------- */

  files: File[] = [];
  imagePreviews: string[] = [];
  maxImages = 10; // Increased default to allow more images
  minImages = 1; // Require at least one image; any count above that (2, 3…) is fine
  imageUploadError: string | null = null;
  imageUploadSuccess: string | null = null;
  showImageQualityInfo = false;
  isValidatingImages = false; // Loading state for image validation

  // Enhanced quality thresholds
  minFileSize = 100 * 1024; // 100KB minimum
  maxFileSize = 10 * 1024 * 1024; // 10MB maximum
  minResolution = 800; // Minimum width/height in pixels





  acceptedFileTypes = 'image/png,image/jpeg,image/webp,image/jpg';

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
  material: '',

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


  private draftService!: DraftListingService;
  private listingService!: ListingsService;
  private router!: Router;
  private aiService!: AiDescriptionService;
  private translate!: TranslateService;
  private cdr!: ChangeDetectorRef;

  constructor() {
    this.draftService = inject(DraftListingService);
    this.listingService = inject(ListingsService);
    this.router = inject(Router);
    this.aiService = inject(AiDescriptionService);
    this.translate = inject(TranslateService);
    this.cdr = inject(ChangeDetectorRef);
  }

  /* -------------------- LIFECYCLE -------------------- */

  ngOnInit(): void {
    // Fetch categories from backend immediately
    this.loadDynamicCategories();

    const draft = this.draftService.getDraft();
    if (!draft) return;

    this.selectedMainCategoryId = draft.selectedMainCategoryId;
    this.selectedSubCategoryId = draft.selectedSubCategoryId;
    this.model = { ...this.model, ...draft.model };

    this.files = draft.files || [];
    this.imagePreviews = this.files.map(f => URL.createObjectURL(f));

   
  }

 
  private loadDynamicCategories() {
    this.loadingCategories = true;
    this.listingService.getCategories().subscribe({
      next: (res: any) => {
        this.loadingCategories = false;
        if (res.success && Array.isArray(res.data)) {
          // Map Main Categories
          this.mainCategories = res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            children: c.children || []
          }));

          // Map Subcategories and flatten them
          const allSubs: SubCategory[] = [];
          res.data.forEach((parent: any) => {
            if (Array.isArray(parent.children)) {
              parent.children.forEach((child: any) => {
                allSubs.push({
                  id: child.id,
                  name: child.name,
                  parentId: parent.id,
                  slug: child.slug
                });
              });
            }
            // Always ensure an "Others" option for every parent
            allSubs.push({
              id: parent.id * 1000 + 999, // Unique ID for Others
              name: 'Others',
              parentId: parent.id,
              slug: 'others'
            });
          });
          this.subCategories = allSubs;
          this.cdr.detectChanges(); // Force detection after dynamic data
        } else {
          console.error('Invalid categories response:', res);
          this.fallbackToStaticCategories();
        }
      },
      error: (err) => {
        console.error('Failed to load dynamic categories', err);
        this.loadingCategories = false;
        this.fallbackToStaticCategories();
      }
    });
  }

  private fallbackToStaticCategories() {
    // Fallback to static categories if API fails
    this.mainCategories = [
      { id: 1, name: 'Motors', slug: 'motors' },
      { id: 2, name: 'Jobs', slug: 'jobs' },
      { id: 3, name: 'Property', slug: 'property' },
      { id: 4, name: 'Classifieds', slug: 'classifieds' },
      { id: 5, name: 'Mobiles & Tablets', slug: 'mobiles-tablets' },
      { id: 6, name: 'Furniture & Garden', slug: 'furniture-garden' },
      { id: 7, name: 'Community', slug: 'community' }
    ];

    this.subCategories = [
      // Motors
      { id: 10, name: 'Used Cars', parentId: 1, slug: 'used-cars' },
      { id: 11, name: 'New Cars', parentId: 1, slug: 'new-cars' },
      { id: 12, name: 'Export Cars', parentId: 1, slug: 'export-cars' },
      { id: 13, name: 'Rental Cars', parentId: 1, slug: 'rental-cars' },
      { id: 14, name: 'Motorcycles', parentId: 1, slug: 'motorcycles' },
      { id: 15, name: 'Auto Accessories & Parts', parentId: 1, slug: 'auto-accessories' },
      { id: 16, name: 'Heavy Vehicles', parentId: 1, slug: 'heavy-vehicles' },
      { id: 17, name: 'Boats', parentId: 1, slug: 'boats' },
      { id: 18, name: 'Number Plates', parentId: 1, slug: 'number-plates' },
      { id: 1999, name: 'Others', parentId: 1, slug: 'others' },

      // Jobs
      { id: 60, name: 'IT & Telecoms', parentId: 2, slug: 'it-telecoms' },
      { id: 61, name: 'Healthcare', parentId: 2, slug: 'healthcare' },
      { id: 62, name: 'Sales & Marketing', parentId: 2, slug: 'sales-marketing' },
      { id: 63, name: 'Hospitality & Tourism', parentId: 2, slug: 'hospitality-tourism' },
      { id: 64, name: 'Finance & Banking', parentId: 2, slug: 'finance-banking' },
      { id: 65, name: 'Engineering', parentId: 2, slug: 'engineering' },
      { id: 66, name: 'Education', parentId: 2, slug: 'education' },
      { id: 67, name: 'Construction', parentId: 2, slug: 'construction' },
      { id: 2999, name: 'Others', parentId: 2, slug: 'others' },

      // Property
      { id: 30, name: 'Apartment (For Sale)', parentId: 3, slug: 'apartment-sale' },
      { id: 31, name: 'Villa (For Sale)', parentId: 3, slug: 'villa-sale' },
      { id: 32, name: 'Townhouse (For Sale)', parentId: 3, slug: 'townhouse-sale' },
      { id: 33, name: 'New Projects', parentId: 3, slug: 'new-projects' },
      { id: 34, name: 'Off-Plan', parentId: 3, slug: 'off-plan' },
      { id: 35, name: 'Land', parentId: 3, slug: 'land' },
      { id: 36, name: 'Apartment (For Rent)', parentId: 3, slug: 'apartment-rent' },
      { id: 37, name: 'Villa (For Rent)', parentId: 3, slug: 'villa-rent' },
      { id: 38, name: 'Office (For Rent)', parentId: 3, slug: 'office-rent' },
      { id: 39, name: 'Monthly Short Term', parentId: 3, slug: 'monthly-short-term' },
      { id: 3999, name: 'Others', parentId: 3, slug: 'others' },

      // Classifieds
      { id: 40, name: 'Home Audio & Turntables', parentId: 4, slug: 'home-audio' },
      { id: 41, name: 'DVD & Home Theater', parentId: 4, slug: 'dvd-theater' },
      { id: 42, name: 'Gadgets', parentId: 4, slug: 'gadgets' },
      { id: 43, name: 'Smart Home', parentId: 4, slug: 'smart-home' },
      { id: 44, name: 'Televisions', parentId: 4, slug: 'televisions' },
      { id: 45, name: 'Electronic Accessories', parentId: 4, slug: 'electronic-accessories' },
      { id: 46, name: 'Car Electronics', parentId: 4, slug: 'car-electronics' },
      { id: 47, name: 'Wearable Technology', parentId: 4, slug: 'wearable-tech' },
      { id: 4999, name: 'Others', parentId: 4, slug: 'others' },

      // Mobiles & Tablets
      { id: 20, name: 'Mobile Phones', parentId: 5, slug: 'mobile-phones' },
      { id: 21, name: 'Tablets', parentId: 5, slug: 'tablets' },
      { id: 22, name: 'Accessories', parentId: 5, slug: 'accessories' },
      { id: 5999, name: 'Others', parentId: 5, slug: 'others' },

      // Furniture & Garden
      { id: 50, name: 'Home Accessories', parentId: 6, slug: 'home-accessories' },
      { id: 51, name: 'Garden & Outdoor', parentId: 6, slug: 'garden-outdoor' },
      { id: 52, name: 'Lighting & Fans', parentId: 6, slug: 'lighting-fans' },
      { id: 53, name: 'Rugs & Carpets', parentId: 6, slug: 'rugs-carpets' },
      { id: 54, name: 'Curtains & Blinds', parentId: 6, slug: 'curtains-blinds' },
      { id: 55, name: 'Tools & Home Improvement', parentId: 6, slug: 'tools-improvement' },
      { id: 6999, name: 'Others', parentId: 6, slug: 'others' },

      // Community
      { id: 70, name: 'Auto Services', parentId: 7, slug: 'auto-services' },
      { id: 71, name: 'Consultancy Services', parentId: 7, slug: 'consultancy-services' },
      { id: 72, name: 'Domestic', parentId: 7, slug: 'domestic' },
      { id: 7999, name: 'Others', parentId: 7, slug: 'others' }
    ];
    this.cdr.detectChanges();
  }

  /* -------------------- GETTERS -------------------- */

  get filteredSubCategories(): SubCategory[] {
    return this.subCategories.filter(s => s.parentId === this.selectedMainCategoryId);
  }

  get isJobsCategory(): boolean {
    return this.selectedMainCategoryId === 2;
  }

  get isOthersSelected(): boolean {
    const sub = this.subCategories.find(s => s.id === this.selectedSubCategoryId);
    return sub?.name === 'Others';
  }

  getCustomPlaceholder(): string {
    const placeholders: { [key: number]: string } = {
      1: 'Vintage Car, Luxury Sedan, Electric Vehicle...',
      2: 'Software Developer, Marketing Manager, Teacher...',
      3: 'Penthouse, Studio Apartment, Commercial Space...',
      4: 'Gaming Console, Camera Equipment, Musical Instruments...',
      5: 'Smartphone, Tablet, Phone Accessories...',
      6: 'Sofa Set, Garden Furniture, Kitchen Appliances...',
      7: 'Plumbing Service, Tutoring, Cleaning Service...'
    };
    return placeholders[this.selectedMainCategoryId || 0] || 'Specify the type...';
  }

  get totalFileSize(): string {
    if (this.files.length === 0) return '0.0';
    const totalBytes = this.files.reduce((sum, f) => sum + f.size, 0);
    const totalMB = totalBytes / (1024 * 1024);
    return totalMB.toFixed(1);
  }

  get fileUploadLabel(): string {
    return this.isJobsCategory ? 'Company Logo' : 'Upload Images';
  }

  get imageRequirementMessage(): string {
    if (this.isJobsCategory) {
      return 'Upload a professional company logo (PNG, JPEG, JPG, or WebP). Higher-quality images look best.';
    }
    return 'Add clear photos (PNG, JPEG, JPG, or WebP). For the best results, use high-quality images above 100KB — smaller images are fine too.';
  }

  getImageQualityStatus(file: File): string {
    if (file.size > this.maxFileSize) return 'Too Large';
    if (file.size < this.minFileSize) return 'Standard';   // allowed, just lower quality
    return 'Good Quality';
  }

  getImageQualityClass(file: File): string {
    if (file.size > this.maxFileSize) return 'text-danger';
    if (file.size < this.minFileSize) return 'text-warning'; // soft hint, not an error
    return 'text-success';
  }

  // Enhanced quality check with dimension validation
  async checkImageQuality(file: File): Promise<{ isValid: boolean; message: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        // Dimensions/aspect are only recommendations now — never block the upload.
        // Any readable image is accepted; higher resolution is simply preferred.
        resolve({ isValid: true, message: 'Image accepted' });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ isValid: false, message: 'Unable to read image file' });
      };

      img.src = url;
    });
  }

  /* -------------------- CATEGORY HANDLING -------------------- */

  onMainCategoryChange(id: number) {
    this.selectedMainCategoryId = id;
    this.mainCategoryName = this.mainCategories.find(c => c.id === id)?.name || '';
    this.selectedSubCategoryId = null;
    this.model.subCategory = ''; // Clear custom subcategory

    this.files = [];
    this.imagePreviews.forEach(u => URL.revokeObjectURL(u));
    this.imagePreviews = [];

    // Reset error when category changes
    this.imageUploadError = null;
    this.showImageQualityInfo = true;

    if (id === 2) {
      this.maxImages = 1;
      this.minImages = 1;
    } else {
      this.maxImages = 10;
      this.minImages = 1;
    }
  }



  onSubCategoryChange(id: number) {
    this.selectedSubCategoryId = id;

    // Clear custom subcategory if not selecting "Others"
    const sub = this.subCategories.find(s => s.id === id);
    if (sub && sub.name !== 'Others') {
      this.model.subCategory = '';
    }

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

  async onFileChange(event: any) {
    const inputFiles = event.target?.files || event.dataTransfer?.files;
    if (!inputFiles) return;

    this.isValidatingImages = true;
    const newFiles = Array.from(inputFiles) as File[];
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of newFiles) {
      // Check file type
      if (!this.acceptedFileTypes.split(',').some(type => file.type === type.trim())) {
        errors.push(`${file.name}: Invalid file type. Only PNG, JPEG, JPG, and WebP are allowed.`);
        continue;
      }

      // Note: images below 100KB are allowed — quality is only a recommendation,
      // shown as a soft label per image rather than blocking the upload.

      if (file.size > this.maxFileSize) {
        errors.push(`${file.name}: File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum 10MB allowed.`);
        continue;
      }

      // Check for duplicates
      const isDuplicate = this.files.some(existing => existing.name === file.name && existing.size === file.size);
      if (isDuplicate) {
        errors.push(`${file.name}: This image is already uploaded.`);
        continue;
      }

      // For image files, check dimensions (async)
      if (file.type.startsWith('image/')) {
        try {
          const qualityCheck = await this.checkImageQuality(file);
          if (!qualityCheck.isValid) {
            errors.push(`${file.name}: ${qualityCheck.message}`);
            continue;
          }
        } catch (error) {
          // If dimension check fails, still allow the file but log warning
          console.warn('Could not check image dimensions for', file.name);
        }
      }

      validFiles.push(file);
    }

    // Check if adding these files would exceed the limit
    if (this.files.length + validFiles.length > this.maxImages) {
      errors.push(`Cannot add ${validFiles.length} images. Maximum ${this.maxImages} images allowed. You currently have ${this.files.length}.`);
      validFiles.splice(this.maxImages - this.files.length);
    }

    // Add valid files
    validFiles.forEach(file => {
      this.files.push(file);
      this.imagePreviews.push(URL.createObjectURL(file));
    });

    // Show success message if files were added
    if (validFiles.length > 0) {
      this.imageUploadSuccess = `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} uploaded successfully!`;
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        this.imageUploadSuccess = null;
        this.cdr.detectChanges();
      }, 3000);
    }

    // Show errors if any
    if (errors.length > 0) {
      this.imageUploadError = errors.join('\n');
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        this.imageUploadError = null;
        this.cdr.detectChanges();
      }, 5000);
    }

    this.validateImages();

    if (event.target) event.target.value = '';

    this.isValidatingImages = false;
  }

  public validateImages() {
    this.imageUploadError = null;

    // Skip validation for jobs (only need company logo)
    if (this.selectedMainCategoryId === 2) return;

    // Images below 100KB are allowed — no minimum-count or minimum-size blocking.
    // Only genuinely oversized files (over the 10MB storage cap) are rejected.

    // Check for oversized images
    const oversizedFiles = this.files.filter(f => f.size > this.maxFileSize);
    if (oversizedFiles.length > 0) {
      this.imageUploadError = `❌ ${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's are' : ' is'} too large. Maximum file size is 10MB.`;
      return;
    }

    // All validations passed
    this.imageUploadError = null;
  }

  public removeImage(i: number) {
    URL.revokeObjectURL(this.imagePreviews[i]);
    this.imagePreviews.splice(i, 1);
    this.files.splice(i, 1);
    
    this.validateImages();
  }

 
  
  public applySubCategoryToModel(id: number) {
  const sub = this.subCategories.find(s => s.id === id);
  if (!sub) return;

  // Handle "Others" case - use custom input value
  if (sub.name === 'Others') {
    if (!this.model) return;
    switch (this.selectedMainCategoryId) {
      case 1:
        this.model.motor_type = this.model.subCategory || 'Others';
        break;
      case 2:
        this.model.jobType = this.model.subCategory || 'Others';
        break;
      case 3:
        this.model.propertyType = this.model.subCategory || 'Others';
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        this.model.subCategory = this.model.subCategory || 'Others';
        break;
    }
  } else {
    // Handle regular subcategory selection
    if (!this.model) return;
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
      case 7:
        this.model.subCategory = sub.name;
        break;
    }
  }
}

  /* -------------------- AI DESCRIPTION -------------------- */

  public generateDescription() {
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
        brand: this.model.brand || '',
        model: this.selectedMainCategoryId === 1 ? this.model.model : (this.model.modelName || ''),
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

  public submit(form?: NgForm) {
    if (!this.selectedMainCategoryId) {
      this.showSelectCategoryModal = true;
      return;
    }

    if (!this.model.title) {
      alert('Title is required');
      return;
    }

    if (this.files.length < this.minImages && this.selectedMainCategoryId !== 2) {
      this.imageUploadError = 'Please add at least one image to proceed.';
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
     
    };

    this.draftService.setDraft(draft);
    this.router.navigate(['/add-post/review']);
  }

  public onDragOver(e: DragEvent) { e.preventDefault(); }
  public onDragLeave(e: DragEvent) { e.preventDefault(); }
  public async onDropFiles(e: DragEvent) { e.preventDefault(); await this.onFileChange(e); }

  ngOnDestroy(): void {
    // Revoke all image URLs to prevent memory leaks
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }
}
