import { isPlatformBrowser, NgFor, CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ListingsService } from '../../services/listing-service';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BannerService, Banner } from '../../services/banner.service';

interface Listing {
  id: number;
  title: string;
  price: string;
  city: string;
  imageUrl: string;
  categorySlug: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NgFor, CommonModule, RouterLink,FormsModule,TranslateModule],
  providers: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

  /* ===================== CATEGORY SEARCH ===================== */
  selectedCategory = 'All';

  categories = [
    'All',
    'Property',
    'Jobs',
    'Electronics',
    'Motors',
    'Classifieds',
    'Furniture',
    'Rooms for Rent',
    'Interior Designers'
  ];

  showCmgSoon = false; 

  categoryMap: Record<string, number | null> = {
    All: null,
    Property: 3,
    Jobs: 2,
    Electronics: 5,
    Motors: 1,
    Classifieds: 4,
    Furniture: 6,
    'Rooms for Rent': 9,
    'Interior Designers': 10
  };

  searchQuery = '';
  searchResults: Listing[] = [];
  isSearching = false;
  hasSearched = false;

  /* ===================== LISTINGS ===================== */
  featuredListings: Listing[] = [];
  popularCars: Listing[] = [];
  popularFurniture: Listing[] = [];
  residentialListings: Listing[] = [];
  electronicsListings: Listing[] = [];
  classifiedListings: Listing[] = [];

  banners: Banner[] = [];
  dynamicCategories: any[] = [];
  // Categories hidden from the Browse-by-Category grid (keeps it at 12 cards).
  private readonly hiddenCategorySlugs = ['services', 'interior-designers', 'home-appliances'];
  categoryIntervals: any[] = [];

  isLoading = false;

  popularCategoriesData = [
    {
      title: 'Motors',
      icon: 'bi-car-front',
      slug: 'motors',
      routePath: 'motors',
      items: [
        { label: 'Used Cars', slug: 'used-cars' },
        { label: 'Rental Cars', slug: 'rental-cars', isNew: true },
        { label: 'New Cars', slug: 'new-cars' },
        { label: 'Export Cars', slug: 'export-cars' },
        { label: 'All in Motors', slug: 'motors', isAll: true }
      ]
    },
    {
      title: 'Property for Rent',
      icon: 'bi-building',
      slug: 'property-for-rent',
      routePath: 'property',
      items: [
        { label: 'Residential', slug: 'residential-for-rent' },
        { label: 'Commercial', slug: 'commercial-for-rent' },
        { label: 'Rooms For Rent', slug: 'rooms-for-rent' },
        { label: 'Monthly Short Term', slug: 'monthly-short-term' },
        { label: 'All in Property for Rent', slug: 'property-for-rent', isAll: true }
      ]
    },
    {
      title: 'Property for Sale',
      icon: 'bi-house-heart',
      slug: 'property-for-sale',
      routePath: 'property',
      items: [
        { label: 'Residential', slug: 'residential-for-sale' },
        { label: 'Commercial', slug: 'commercial-for-sale' },
        { label: 'New Projects', slug: 'new-projects' },
        { label: 'Off-Plan', slug: 'off-plan' },
        { label: 'All in Property for Sale', slug: 'property-for-sale', isAll: true }
      ]
    },
    {
      title: 'Classifieds',
      icon: 'bi-box-seam',
      slug: 'classifieds',
      routePath: 'classifieds',
      items: [
        { label: 'Electronics', slug: 'electronics' },
        { label: 'Computers & Networking', slug: 'computers-networking' },
        { label: 'Clothing & Accessories', slug: 'clothing-accessories' },
        { label: 'Jewelry & Watches', slug: 'jewelry-watches' },
        { label: 'All in Classifieds', slug: 'classifieds', isAll: true }
      ]
    },
    {
      title: 'Jobs',
      icon: 'bi-briefcase',
      slug: 'jobs',
      routePath: 'jobs',
      items: [
        { label: 'Accounting / Finance', slug: 'accounting-finance' },
        { label: 'Engineering', slug: 'engineering' },
        { label: 'Sales / Business Development', slug: 'sales-business-development' },
        { label: 'Secretarial / Front Office', slug: 'secretarial-front-office' },
        { label: 'All in Jobs', slug: 'jobs', isAll: true }
      ]
    },
    {
      title: 'Community',
      icon: 'bi-people',
      slug: 'community',
      routePath: 'classifieds',
      items: [
        { label: 'Freelancers', slug: 'freelancers' },
        { label: 'Home Maintenance', slug: 'home-maintenance' },
        { label: 'Other Services', slug: 'other-services' },
        { label: 'Tutors & Classes', slug: 'tutors-classes' },
        { label: 'All in Community', slug: 'community', isAll: true }
      ]
    },
    {
      title: 'Business & Industrial',
      icon: 'bi-buildings',
      slug: 'business-industrial',
      routePath: 'classifieds',
      items: [
        { label: 'Businesses for Sale', slug: 'businesses-for-sale' },
        { label: 'Construction', slug: 'construction' },
        { label: 'Food & Beverage', slug: 'food-beverage' },
        { label: 'Industrial Supplies', slug: 'industrial-supplies' },
        { label: 'All in Business & Industrial', slug: 'business-industrial', isAll: true }
      ]
    },
    {
      title: 'Home Appliances',
      icon: 'bi-washing-machine',
      slug: 'home-appliances',
      routePath: 'electronics',
      items: [
        { label: 'Large Appliances / White Goods', slug: 'large-appliances-white-goods' },
        { label: 'Small Kitchen Appliances', slug: 'small-kitchen-appliances' },
        { label: 'Outdoor Appliances', slug: 'outdoor-appliances' },
        { label: 'Small Bathroom Appliances', slug: 'small-bathroom-appliances' },
        { label: 'All in Home Appliances', slug: 'home-appliances', isAll: true }
      ]
    },
    {
      title: 'Furniture, Home & Garden',
      icon: 'bi-couch',
      slug: 'furniture-home-garden',
      routePath: 'furniture',
      items: [
        { label: 'Furniture', slug: 'furniture' },
        { label: 'Home Accessories', slug: 'home-accessories' },
        { label: 'Garden & Outdoor', slug: 'garden-outdoor' },
        { label: 'Lighting & Fans', slug: 'lighting-fans' },
        { label: 'All in Furniture, Home & Garden', slug: 'furniture-home-garden', isAll: true }
      ]
    },
    {
      title: 'Mobile Phones & Tablets',
      icon: 'bi-phone',
      slug: 'mobile-phones-tablets',
      routePath: 'electronics',
      items: [
        { label: 'Mobile Phones', slug: 'mobile-phones' },
        { label: 'Mobile Phone & Tablet Accessories', slug: 'mobile-phone-tablet-accessories' },
        { label: 'Tablets', slug: 'tablets' },
        { label: 'Other Mobile Phones & Tablets', slug: 'other-mobile-phones-tablets' },
        { label: 'All in Mobile Phones & Tablets', slug: 'mobile-phones-tablets', isAll: true }
      ]
    }
  ];

  constructor(
    private listingsService: ListingsService,
    private bannerService: BannerService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    this.loadCategories();
  }

  loadCategories(): void {
    this.listingsService.getCategories().subscribe({
      next: (res: any) => {
        this.dynamicCategories = res.data
          .filter((cat: any) => !this.hiddenCategorySlugs.includes(cat.slug))
          .map((cat: any) => {
          const rawThumbs = Array.isArray(cat.thumbnails)
            ? cat.thumbnails
            : (cat.imageUrl ? [cat.imageUrl] : []);
          return {
            ...cat,
            currentThumbIndex: 0,
            // Prefix relative /uploads paths with the backend origin so images
            // resolve against the API server, not the frontend host.
            thumbnails: rawThumbs
              .filter((t: any) => !!t)
              .map((t: string) =>
                typeof t === 'string' && t.startsWith('/uploads/')
                  ? `${environment.apiUrl}${t}`
                  : t
              )
          };
        });
        this.startThumbnailRotation();
      },
      error: (err: any) => console.error('Failed to load categories', err)
    });
  }

  startThumbnailRotation(): void {
    if (this.categoryIntervals.length || !isPlatformBrowser(this.platformId)) return;
    
    // Rotate thumbnails every 3 seconds for categories with multiple images
    // Run outside Angular to avoid constant change detection cycles
    this.ngZone.runOutsideAngular(() => {
      const interval = setInterval(() => {
        let changed = false;
        this.dynamicCategories.forEach(cat => {
          if (cat.thumbnails?.length > 1) {
            cat.currentThumbIndex = (cat.currentThumbIndex + 1) % cat.thumbnails.length;
            changed = true;
          }
        });
        
        if (changed) {
          // Manually trigger change detection only when data actually changes
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        }
      }, 3000);
      
      this.categoryIntervals.push(interval);
    });
  }

  ngOnDestroy(): void {
     this.categoryIntervals.forEach(i => clearInterval(i));
  }

  /* ===================== CATEGORY CLICK ===================== */
  onCategoryClick(cat: string): void {
    this.selectedCategory = cat;
    this.onSearch();
  }

  get searchPlaceholder(): string {
    return `Searching in ${this.selectedCategory}`;
  }

  /* ===================== SEARCH ===================== */
  onSearch(): void {
    if (!this.searchQuery.trim() && this.selectedCategory === 'All') {
      console.log('Empty search query');
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    const categoryId = this.categoryMap[this.selectedCategory];

    this.listingsService.searchListings({
      q: this.searchQuery,
      categoryId: categoryId ?? undefined,
      limit: 20
    }).subscribe({
      next: (res) => {
        this.searchResults = this.mapListings(res.data);
        console.log('Search results:', this.searchResults);
        this.isSearching = false;
      },
      error: () => {
        console.error('Search failed');
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  clearSearch(): void {
    this.hasSearched = false;
    this.searchResults = [];
  }

  openCmgSoon(): void {
    this.showCmgSoon = true;
    setTimeout(() => {    
      this.showCmgSoon = false;
    }, 3000);


  }

  /* ===================== HOME DATA ===================== */
  loadHomeData(): void {
    this.isLoading = true;

    // Featured (ALL → show 5)
    this.listingsService.getAllListings().subscribe({
      next: (res) => {
        this.featuredListings = this.mapListings(res.data).slice(0, 5);
        this.isLoading = false;
      },
      error: () => {
        this.featuredListings = [];
        this.isLoading = false;
      }
    });

    // Motors
    this.listingsService.getListingsPaginated(1, 1, 5).subscribe(res => {
      this.popularCars = this.mapListings(res.data);
    });

    // Properties
    this.listingsService.getListingsPaginated(3, 1, 5).subscribe(res => {
      this.residentialListings = this.mapListings(res.data);
    });

    // Electronics
    this.listingsService.getListingsPaginated(5, 1, 5).subscribe(res => {
      this.electronicsListings = this.mapListings(res.data);
    });

    // Furniture
    this.listingsService.getListingsPaginated(6, 1, 5).subscribe(res => {
      this.popularFurniture = this.mapListings(res.data);
    });

    // Classifieds
    this.listingsService.getListingsPaginated(4, 1, 5).subscribe(res => {
      this.classifiedListings = this.mapListings(res.data);
    });

    // Banners
    this.bannerService.getBanners().subscribe(data => {
      this.banners = data;
      // Initialize Bootstrap Carousel manually after DOM updates
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const carouselElement = document.getElementById('promoCarousel');
          if (carouselElement) {
            // Manually set first item as active since we removed Angular's binding
            const firstIndicator = carouselElement.querySelector('.indicator-bar');
            const firstSlide = carouselElement.querySelector('.carousel-item');
            if (firstIndicator) firstIndicator.classList.add('active');
            if (firstSlide) firstSlide.classList.add('active');

            if (typeof (window as any).bootstrap !== 'undefined') {
              // Initialize and force cycle
              const carousel = new (window as any).bootstrap.Carousel(carouselElement, {
                interval: 2500,
                ride: 'carousel',
                pause: false
              });
              carousel.cycle();
            }
          }
        }, 100);
      }
    });
  }

  /* ===================== MAPPER ===================== */
  mapListings(data: any[]): Listing[] {
    return (data || []).map(item => {
      // Prefer the lightweight thumbnail for cards; fall back to the full image.
      const firstImage = item.images?.[0];
      let imgUrl = firstImage?.thumbnailUrl || firstImage?.imageUrl || 'assets/placeholder.png';
      if (imgUrl.startsWith('/uploads/')) {
        imgUrl = `${environment.apiUrl}${imgUrl}`;
      }
      return {
        id: item.id,
        title: item.title,
        price: `${item.currency || 'AED'} ${Number(item.price).toLocaleString()}`,
        city: item.city,
        imageUrl: imgUrl,
        categorySlug: item.category?.name?.toLowerCase() || ''
      };
    });
  }

  /* ===================== NAVIGATION ===================== */
  goToCategory(listing: Listing): void {
    if (!listing.categorySlug) return;
    this.router.navigate([`/listings/${listing.categorySlug}`]);
  }

  /** Open the full product details page for a listing. */
  goToProduct(listing: Listing): void {
    if (!listing.id) return;
    this.router.navigate([`/listing/${listing.id}`]);
  }

  handleImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBob3RvIENvbWluZyBTb29uPC90ZXh0Pjwvc3ZnPg=='; 
  }
}
