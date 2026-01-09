import { Component, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
  logoUrl: string; // Added specifically for details view
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
export class JobsListingsComponent {
  
  // State Management
  currentView = signal<'list' | 'details' | 'apply'>('list');
  selectedJobId = signal<number | null>(null);
  
  // Filters
  searchTerm = '';
  sortBy = 'newest';
  experienceFilter: string | null = null;
  employmentFilter: string | null = null;
  locationFilter = '';
  minSalary: number | null = null;
  maxSalary: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 4;

  // Forms
  applyForm: FormGroup;
  uploadedFileName: string | null = null;

  // Data aligned with Screenshots
  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc',
      location: 'Dubai, UAE',
      type: 'Full Time',
      minSalary: 120000,
      maxSalary: 140000,
      currency: 'AED',
      level: 'Senior',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732200.png', // Placeholder logo
      category: 'Software',
      description: 'Tech Solutions Inc is seeking a highly skilled Senior Software Engineer...',
      longDescription: 'As a Senior Software Engineer, you will lead the development of high-scale applications...',
      responsibilities: ['Architect scalable solutions', 'Mentor junior devs', 'Code review'],
      requirements: ['BS in CS', '5+ years experience'],
      benefits: ['Health insurance', 'Yearly bonus']
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'Tech Innovators Inc.',
      location: 'Dubai, UAE',
      type: 'Full Time',
      minSalary: 80000,
      maxSalary: 100000,
      currency: 'AED',
      level: 'Mid',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&auto=format&fit=crop&q=60',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
      category: 'Marketing',
      description: 'Tech Innovators Inc. is seeking a dynamic and experienced Marketing Manager to lead our marketing efforts.',
      longDescription: 'As a Marketing Manager at Tech Innovators Inc., you will be responsible for developing and implementing comprehensive marketing strategies to drive brand awareness, generate leads, and support sales efforts.',
      responsibilities: [
        'Lead UX research, wireframing, prototyping & final UI design.', // Copied from your screenshot text
        'Develop design systems and maintain visual consistency.',
        'Collaborate with product, engineering & stakeholders.',
        'Conduct usability testing & iterate based on feedback.'
      ],
      requirements: [
         "Bachelor's degree in Marketing, Business Administration.",
         "5-7 years of experience in marketing.",
         "Proven track record of executing successful strategies."
      ],
      benefits: [
        "Competitive salary & performance bonuses.",
        "Medical insurance & paid leaves.",
        "Creative and collaborative work culture.",
        "Hybrid/remote flexibility."
      ]
    },
    {
      id: 3,
      title: 'Data Analyst',
      company: 'Data Insights Co.',
      location: 'Dubai, UAE',
      type: 'Full Time',
      minSalary: 70000,
      maxSalary: 85000,
      currency: 'AED',
      level: 'Mid',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2800/2800209.png',
      category: 'Analytics',
      description: 'Analyze data trends to help business growth.',
      longDescription: 'Deep dive into data lakes to find actionable insights...',
      responsibilities: ['Data mining', 'Reporting', 'SQL optimization'],
      requirements: ['Strong SQL', 'Python knowledge'],
      benefits: ['Gym membership', 'Remote work']
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      company: 'Creative Minds Agency',
      location: 'Dubai, UAE',
      type: 'Contract',
      minSalary: 70000,
      maxSalary: 85000,
      currency: 'AED',
      level: 'Mid',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/5611/5611108.png',
      category: 'Design',
      description: 'Create beautiful user interfaces.',
      longDescription: 'Design user flows and visual layers for web apps...',
      responsibilities: ['Figma prototyping', 'User research'],
      requirements: ['Portfolio required', '3 years exp'],
      benefits: ['Flexible hours', 'MacBook Pro provided']
    },
    {
        id: 5,
        title: 'Project Manager',
        company: 'Global Projects Ltd.',
        location: 'Dubai, UAE',
        type: 'Full Time',
        minSalary: 90000,
        maxSalary: 110000,
        currency: 'AED',
        level: 'Senior',
        isFeatured: false,
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop&q=60',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/3281/3281329.png',
        category: 'Management',
        description: 'Oversee timeline and delivery.',
        longDescription: 'Ensure projects are delivered on time and within budget...',
        responsibilities: ['Sprint planning', 'Risk assessment'],
        requirements: ['PMP Certification', 'Agile experience'],
        benefits: ['Stock options', 'Private insurance']
      }
  ];

  constructor(private fb: FormBuilder) {
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

  // --- Computed Signals ---
  
  selectedJob = computed(() => {
    const id = this.selectedJobId();
    return this.jobs.find(j => j.id === id) || null;
  });

  // Filter Logic
  get filteredJobs() {
    return this.jobs.filter(job => {
      const matchSearch = !this.searchTerm || 
          job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
          job.company.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchExperience = !this.experienceFilter || job.level === this.experienceFilter;
      const matchEmployment = !this.employmentFilter || job.type === this.employmentFilter;
      const matchLocation = !this.locationFilter || job.location.toLowerCase().includes(this.locationFilter.toLowerCase());
      const matchMinSal = !this.minSalary || job.minSalary >= this.minSalary;
      const matchMaxSal = !this.maxSalary || job.maxSalary <= this.maxSalary;

      return matchSearch && matchExperience && matchEmployment && matchLocation && matchMinSal && matchMaxSal;
    }).sort((a, b) => {
        if(this.sortBy === 'lowToHigh') return a.minSalary - b.minSalary;
        if(this.sortBy === 'highToLow') return b.minSalary - a.minSalary;
        if(this.sortBy === 'newest') return b.id - a.id;
        return 0; // relevance
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
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- Actions ---

  toggleExperience(level: string) {
    this.experienceFilter = this.experienceFilter === level ? null : level;
    this.currentPage = 1;
  }

  toggleEmployment(type: string) {
    this.employmentFilter = this.employmentFilter === type ? null : type;
    this.currentPage = 1;
  }

  applyFilters() {
    // Logic already handled in getters, but we reset page
    this.currentPage = 1;
    // Mobile sidebar toggle logic could go here
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
    if(page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Navigation
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

  // Form Handling
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.uploadedFileName = file.name;
    }
  }

  submitApplication() {
    if(this.applyForm.valid) {
        alert(`Application Submitted for ${this.selectedJob()?.title}!`);
        this.applyForm.reset();
        this.uploadedFileName = null;
        this.goBack();
    } else {
        alert('Please fill all required fields');
    }
  }
}