import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingsService } from '../../services/listing-service';

interface FavouriteListing {
  id: number;
  title: string;
  price: number;
  currency: string;
  city: string;
  image: string;
  categoryName: string;
}

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-favourites.html',
  styleUrls: ['./my-favourites.css']
})
export class FavouritesComponent implements OnInit {

  favourites: FavouriteListing[] = [];
  filtered: FavouriteListing[] = [];

  isLoading = false;
  searchQuery = '';

  constructor(private listingsService: ListingsService) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

  // ======================
  // LOAD FAVORITES
  // ======================
  loadFavourites() {
    this.isLoading = true;

    this.listingsService.getMyFavorites().subscribe({
      next: (res: any) => {
        this.favourites = (res.data || []).map((f: any) =>
          this.mapBackendFavourite(f)
        );
        this.filtered = [...this.favourites];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  // ======================
  // SEARCH
  // ======================
  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.favourites.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.categoryName.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q)
    );
  }

  // ======================
  // REMOVE FAVORITE
  // ======================
  removeFavorite(listingId: number, event: MouseEvent) {
    event.stopPropagation();

    this.listingsService.removeFromFavorites(listingId).subscribe(() => {
      this.favourites = this.favourites.filter(f => f.id !== listingId);
      this.filtered = this.filtered.filter(f => f.id !== listingId);
    });
  }

  // ======================
  // MAP BACKEND → UI
  // ======================
  mapBackendFavourite(f: any): FavouriteListing {
    const l = f.listing;
    return {
      id: l.id,
      title: l.title,
      price: +l.price,
      currency: l.currency || 'AED',
      city: l.city || 'Dubai',
      image: l.images?.[0]?.imageUrl || 'assets/no-image.jpg',
      categoryName: l.category?.name || ''
    };
  }
}
