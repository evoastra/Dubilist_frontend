import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../../services/listing-service';

interface Job {
  id: number;
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
  selectedJobId = signal<number | null>(null);

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

  // =====================
  // PAGINATION
  // =====================
  currentPage = 1;
  pageSize = 4;

  // =====================
  // DATA
  // =====================
  jobs: Job[] = [];
  isLoading = false;

  // =====================
  // FORM
  // =====================
  applyForm: FormGroup;
  uploadedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService
  ) {
    this.applyForm = this.fb.group({
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      qualification: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      coverLetter: [''],
      salaryExpectation: ['', Validators.required],
      resume: [null]
    });
  }

  ngOnInit() {
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
        this.jobs = res.data.map(this.mapBackendJob);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // =====================
  // COMPUTED
  // =====================
  selectedJob = computed(() => {
    const id = this.selectedJobId();
    return this.jobs.find(j => j.id === id) || null;
  });

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
    this.selectedJobId.set(id);
    this.currentView.set('details');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  goToApply() {
    this.currentView.set('apply');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  goBack() {
    if (this.currentView() === 'apply') {
      this.currentView.set('details');
    } else {
      this.currentView.set('list');
      this.selectedJobId.set(null);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // =====================
  // FORM
  // =====================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
    }
  }

  submitApplication() {
    if (this.applyForm.valid) {
      alert(`Application Submitted for ${this.selectedJob()?.title}!`);
      this.applyForm.reset();
      this.uploadedFileName = null;
      this.goBack();
    } else {
      alert('Please fill all required fields');
    }
  }

  // =====================
  // BACKEND → UI MAPPER
  // =====================
  mapBackendJob(l: any): Job {
    return {
      id: l.id,
      title: l.jobTitle || l.title,
      company: l.companyName || l.user?.name,
      location: l.city,
      type: l.jobType,
      minSalary: l.salaryMin,
      maxSalary: l.salaryMax,
      currency: 'AED',
      level: l.experienceMin >= 5 ? 'Senior' : l.experienceMin >= 2 ? 'Mid' : 'Entry',
      isFeatured: l.isFeatured || false,
      imageUrl: l.images?.[0]?.imageUrl || 'assets/job-placeholder.jpg',
      logoUrl: l.user?.avatarUrl || 'assets/company-logo.png',
      category: 'Jobs',
      description: l.description,
      longDescription: l.description,
      responsibilities: l.responsibilities || [],
      requirements: l.skillsRequired || [],
      benefits: l.benefits || []
    };
  }
}
