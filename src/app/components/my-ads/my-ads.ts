import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ListingsService } from '../../services/listing-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './my-ads.html',
  styleUrls: ['./my-ads.css']
})
export class MyAdsComponent implements OnInit {

  listings: any[] = [];
  loading = true;
  activeTab: 'active' | 'inactive' = 'active';

  /* JOB APPLICATION STATES */
  showApplications = false;
  selectedJob: any = null;
  applications: any[] = [];
  selectedApplication: any = null;

  constructor(
    private listingsService: ListingsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyAds();
  }

  loadMyAds() {
    this.loading = true;
    this.listingsService.getMyListings().subscribe({
      next: (res: any) => {
        this.listings = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get filteredAds() {
    return this.listings.filter(ad =>
      this.activeTab === 'active'
        ? ad.status === 'approved'
        : ad.status !== 'approved'
    );
  }

  isJob(ad: any): boolean {
    return ad.category?.slug === 'jobs' && ad.jobDetails;
  }

  /* ---------- JOB APPLICATION FLOW ---------- */

  openApplications(ad: any) {
    this.selectedJob = ad;
    this.showApplications = true;
    this.selectedApplication = null;

    this.listingsService.getJobApplications(ad.id)
      .subscribe(res => {
        this.applications = res.data || [];
      });
  }

  openApplicant(app: any) {
    this.listingsService.getApplicationById(app.id)
      .subscribe(res => {
        this.selectedApplication = res.data;
      });
  }

  closeApplications() {
    this.showApplications = false;
    this.selectedJob = null;
    this.selectedApplication = null;
    this.applications = [];
  }

  /* ---------- OTHER ---------- */

  removeAd(id: number) {
    if (!confirm('Remove this ad?')) return;

    this.listingsService.deleteListing(id).subscribe({
      next: () => {
        this.listings = this.listings.filter(a => a.id !== id);
      }
    });
  }

  postNewAd() {
    this.router.navigate(['/add-post']);
  }
}
