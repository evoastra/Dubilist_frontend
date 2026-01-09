// job.model.ts
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  currency: string;        // 'AED'
  type: 'Full Time' | 'Part Time' | 'Contract' | 'Internship';
  level: 'Entry' | 'Mid' | 'Senior';
  isFeatured?: boolean;
  imageUrl?: string;
  category?: string;       // e.g. 'Marketing'
}

export interface JobApplication {
  jobId: number;
  fullName: string;
  dateOfBirth: string;
  qualification: string;
  email: string;
  mobile: string;
  resumeUrl: string;
  coverLetter?: string;
  salaryExpectation: number;
}
