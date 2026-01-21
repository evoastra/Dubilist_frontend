import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListingsService } from '../../services/listing-service';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-ads.html',
  styleUrls: ['./my-ads.css']
})
export class MyAdsComponent implements OnInit {

  listings: any[] = [];
  loading = true;
  activeTab: 'active' | 'inactive' = 'active';

  constructor(
    private myListingsService: ListingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyAds();
  }

  loadMyAds() {
    this.loading = true;
    this.myListingsService.getMyListings().subscribe({
      next: (res: any) => {
        this.listings = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load ads');
      }
    });
  }

  get filteredAds() {
    return this.listings.filter(ad =>
      this.activeTab === 'active'
        ? ad.status === 'approved'
        : ad.status !== 'approved'
    );
  }

  removeAd(id: number) {
    if (!confirm('Are you sure you want to remove this ad?')) return;

    this.myListingsService.deleteListing(id).subscribe({
      next: () => {
        this.listings = this.listings.filter(a => a.id !== id);
      },
      error: () => alert('Failed to remove ad')
    });
  }

  postNewAd() {
    this.router.navigate(['/add-post']);
  }
}
