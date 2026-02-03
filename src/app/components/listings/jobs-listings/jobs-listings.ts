import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';
import { AuthService } from '../../../services/auth-service';
import { routes } from '../../../app.routes';
import { Router } from '@angular/router';


interface Job {
  id: number;
  applicationEmail?: string;
  applicationUrl?: string;
  applicationDeadline?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  level: string;
  isFeatured: boolean;
  imageUrl: string;
  logoUrl: string;
  category: string;
  description: string;
  longDescription?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
}

@Component({
  selector: 'app-jobs-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './jobs-listings.html',
  styleUrls: ['./jobs-listings.css']
})
export class JobsListingsComponent implements OnInit {

  // =====================
  // STATE
  // =====================
  currentView = signal<'list' | 'details' | 'apply'>('list');

  // =====================
  // FILTERS
  // =====================
  searchTerm = '';
  sortBy = 'newest';
  experienceFilter: string | null = null;
  employmentFilter: string | null = null;
  locationFilter = '';
  minSalary: number | null = null;
  maxSalary: number | null = null;
  isloggedIn = false;

  // =====================
  // PAGINATION
  // =====================
  currentPage = 1;
  pageSize = 4;
  resumeFile: File | null = null;
isSubmitting = false;


  // =====================
  // DATA
  // =====================
  jobs: Job[] = [];
  isLoading = false;
  selectedJob:Job|null = null ;
  // =====================
  // FORM
  // =====================
  applyForm: FormGroup;
  uploadedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService,
    private authService: AuthService,
    private router: Router
  ) {
   this.applyForm = this.fb.group({
  fullName: ['', Validators.required],
  dateOfBirth: ['', Validators.required],
  qualification: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  mobile: ['', Validators.required],
  jobStatus: ['', Validators.required], // 🔥 REQUIRED
  coverLetter: [''],
  salaryExpectation: ['', Validators.required]
});

  }

  ngOnInit() {
    if(this.authService.isLoggedIn()){
      this.isloggedIn = true;
    }

    this.loadJobs();
  }

  // =====================
  // API FETCH (ONCE)
  // =====================
  loadJobs() {
    this.isLoading = true;

    // categoryId = 2 → Jobs
    this.listingsService.getAllListings(2).subscribe({
      next: (res: any) => {
           this.isLoading = false;
        this.jobs = res.data.map(this.mapBackendJob);
     
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
  const file = event.target.files[0];

  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    this.showToast('File size must be under 5MB', 'error');
    return;
  }

  this.resumeFile = file;
  this.uploadedFileName = file.name;
}

  // =====================
  // COMPUTED
  // =====================
 
  get filteredJobs() {
    return this.jobs
      .filter(job => {
        const matchSearch =
          !this.searchTerm ||
          job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchExperience =
          !this.experienceFilter || job.level === this.experienceFilter;

        const matchEmployment =
          !this.employmentFilter || job.type === this.employmentFilter;

        const matchLocation =
          !this.locationFilter ||
          job.location.toLowerCase().includes(this.locationFilter.toLowerCase());

        const matchMinSal =
          !this.minSalary || job.minSalary >= this.minSalary;

        const matchMaxSal =
          !this.maxSalary || job.maxSalary <= this.maxSalary;

        return (
          matchSearch &&
          matchExperience &&
          matchEmployment &&
          matchLocation &&
          matchMinSal &&
          matchMaxSal
        );
      })
      .sort((a, b) => {
        if (this.sortBy === 'lowToHigh') return a.minSalary - b.minSalary;
        if (this.sortBy === 'highToLow') return b.minSalary - a.minSalary;
        if (this.sortBy === 'newest') return b.id - a.id;
        return 0;
      });
  }

  get paginatedJobs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredJobs.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  get pagesArray() {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  // =====================
  // FILTER ACTIONS
  // =====================
  toggleExperience(level: string) {
    this.experienceFilter = this.experienceFilter === level ? null : level;
    this.currentPage = 1;
  }

  toggleEmployment(type: string) {
    this.employmentFilter = this.employmentFilter === type ? null : type;
    this.currentPage = 1;
  }

  applyFilters() {
    this.currentPage = 1;
  }

  resetFilters() {
    this.sortBy = 'newest';
    this.experienceFilter = null;
    this.employmentFilter = null;
    this.locationFilter = '';
    this.minSalary = null;
    this.maxSalary = null;
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // =====================
  // NAVIGATION
  // =====================
  viewJobDetails(id: number) {
    this.listingsService.getSingleListing(id).subscribe({
      next: (res: any) => {
        this.selectedJob = this.mapBackendJob(res.data);  
        this.currentView.set('details');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  goToApply() {
     if (!this.isloggedIn) {
      this.showToast('Please log in to apply for jobs', 'warning');
    this.router.navigate(['/auth/login']);
    return;
  }
    this.currentView.set('apply');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  goBack() {
    if (this.currentView() === 'apply') {
      this.currentView.set('details');
    } else {
      this.currentView.set('list');
      this.selectedJob = null;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // =====================
  // FORM
  // =====================

submitApplication() {
  if (!this.selectedJob) {
    this.showToast('No job selected', 'error');
    return;
  }

  if (this.applyForm.invalid || !this.resumeFile) {
    this.showToast('Please complete all fields and upload resume', 'error');
    return;
  }

  const jobId = this.selectedJob.id; // ✅ TS now knows this is NOT null
  this.isSubmitting = true;

  this.listingsService.uploadResume(this.resumeFile).subscribe({
    next: (uploadRes: any) => {

      const payload = {
        name: this.applyForm.value.fullName,
        email: this.applyForm.value.email,
        mobileNo: this.applyForm.value.mobile,
        dob: this.applyForm.value.dateOfBirth,
        qualification: this.applyForm.value.qualification,
        jobStatus: this.applyForm.value.jobStatus,
        salaryExpectation: this.applyForm.value.salaryExpectation,
        salaryCurrency: 'AED',
        resumeUrl: uploadRes.data.url,
        resumeS3Key: uploadRes.data.s3Key,
        coverLetter: this.applyForm.value.coverLetter
      };

      this.listingsService.applyToJob(jobId, payload).subscribe({
        next: () => {
          this.showToast('Application submitted successfully 🎉', 'success');
          this.applyForm.reset();
          this.resumeFile = null;
          this.uploadedFileName = null;
          this.goBack();
          this.isSubmitting = false;
        },
        error: err => {
          this.isSubmitting = false;

          if (err.error?.message === 'Already applied') {
            this.showToast('You have already applied for this job', 'warning');
          } else {
            this.showToast(err.error?.message || 'Application failed', 'error');
          }
        }
      });
    },
    error: () => {
      this.isSubmitting = false;
      this.showToast('Resume upload failed', 'error');
    }
  });
}

toastMessage = '';
toastType: 'success' | 'error' | 'warning' = 'success';
showToastFlag = false;

showToast(message: string, type: 'success' | 'error' | 'warning') {
  this.toastMessage = message;
  this.toastType = type;
  this.showToastFlag = true;

  setTimeout(() => this.showToastFlag = false, 3000);
}


  // =====================
  // BACKEND → UI MAPPER
  // =====================
 mapBackendJob(l: any): Job {
  const details = l.jobDetails;
  const images = l.images || [];

  return {
    id: l.id,

    // Core info
    title: details?.jobTitle || l.title,
    company: details?.companyName || l.user?.name || 'Company',
    category: l.category?.name || 'Jobs',

    // Location & type
    location: l.city || 'UAE',
    type: details?.jobType || 'Full-time',

    // Salary (respect hideSalary)
    minSalary: details?.hideSalary ? 0 : Number(details?.salaryMin || 0),
    maxSalary: details?.hideSalary ? 0 : Number(details?.salaryMax || 0),
    currency: details?.currency || l.currency || 'AED',

    // Experience
    level:
      details?.experienceLevel ||
      (details?.experienceMin >= 5
        ? 'Senior'
        : details?.experienceMin >= 2
        ? 'Mid'
        : 'Entry'),

    // Flags
    isFeatured: !!l.isFeatured,

    // Images
    imageUrl:
      images[0]?.imageUrl ||
      details?.companyLogoUrl ||
      'assets/job-placeholder.jpg',

    logoUrl:
      details?.companyLogoUrl ||
      l.user?.avatarUrl ||
      'assets/company-logo.png',

    // Descriptions
    description: l.description || '',
    longDescription: l.description || '',

    // Arrays (safe defaults)
    responsibilities: details?.responsibilities || [],
    requirements: details?.skillsRequired || [],
    benefits: details?.benefits || [],

    // Extra useful fields (optional but good)
    applicationEmail: details?.applicationEmail || l.contactEmail,
    applicationUrl: details?.applicationUrl || null,
    applicationDeadline: details?.applicationDeadline || null
  };
}

}
