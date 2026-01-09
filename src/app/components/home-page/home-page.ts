import { CommonModule, NgFor } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


interface Listing {
  title: string;
  price: string;
  city: string;
  imageUrl: string;
}


@Component({
  selector: 'app-home-page',
  imports: [NgFor, CommonModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

  // in your component.ts
selectedCategory = 'All';

categories = ['All', 'Properties', 'Jobs', 'Electronics', 'Motors', 'Classifieds', 'Furniture'];

onCategoryClick(cat: string) {
  this.selectedCategory = cat;
}

get searchPlaceholder(): string {
  return `Searching in ${this.selectedCategory}`;
}


  listings: Listing[] = [
    {
    title: '2018 Sedan, Excellent Condition',
    price: 'AED 45,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cozy 2-Bedroom Apartment',
    price: 'AED 1,200,000',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'High-End Gaming Laptop',
    price: 'AED 8,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Sofa Set',
    price: 'AED 3,500',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'AI-Powered Software',
    price: 'AED 250',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  ];

  popularCars: Listing[] = [
  {
    title: 'Lexus LX-series',
    price: 'AED 45,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1628188859552-132bbeac6204?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Toyota Fortuner SR5',
    price: 'AED 149,000',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', // SUV offroad
  },
  {
    title: 'Peugeot Partner',
    price: 'AED 53,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80', // white car in nature
  },
  {
    title: 'Mercedes‑Benz V‑Class V260',
    price: 'AED 258,000',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80', // Mercedes in city
  },
  {
    title: 'Mercedes‑Benz EQE 350',
    price: 'AED 155,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', // grey sport car
  },
];
   
  popularFurniture: Listing[] = [
  {
    title: 'Stylish Grey Vimle SofaBed',
    price: 'AED 1,995',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', // grey sofa bed
  },
  {
    title: 'Stylish and Comfortable L‑Shaped Sofa',
    price: 'AED 999',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80', // blue sectional
  },
  {
    title: 'Stylish Red Wooden Dressing Table',
    price: 'AED 53,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80', // red cabinet
  },
  {
    title: 'Stylish Grey Coloured Sofa',
    price: 'AED 950',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', // green/grey sofa
  },
  {
    title: 'Comfortable Office Chairs Set',
    price: 'AED 155',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80', // office desk + chair
  },
];
 
residentialListings = [
  {
    title: 'Luxury Apartment',
    price: 'AED 1,995 / Month',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern House',
    price: 'AED 500,000',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Townhouse',
    price: 'AED 350,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36f89?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Pent House',
    price: 'AED 950 / Month',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Villa',
    price: 'AED 800,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  },
];

electronicsListings = [
  {
    title: 'Apple iPhone 15',
    price: 'AED 1,995',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Samsung S-24 Ultra',
    price: 'AED 5,000',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1610945415295-d96bf06715e4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Dell Inspiron Laptop',
    price: 'AED 35,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1593642632823-8f7853674697?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'OnePlus 50 inch TV',
    price: 'AED 950',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'LG Refrigerator 10L',
    price: 'AED 800,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80',
  },
];

classifiedListings = [
  {
    title: 'Blue Shirt',
    price: 'AED 199',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Adjustable Dumbbell',
    price: 'AED 5,000',
    city: 'Abu Dhabi',
    imageUrl:
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Guitar',
    price: 'AED 35,000',
    city: 'Sharjah',
    imageUrl:
      'https://images.unsplash.com/photo-1550985543-f4423c9d7481?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Footwear',
    price: 'AED 950',
    city: 'Ajman',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Professional Tennis Racket',
    price: 'AED 800,000',
    city: 'Dubai',
    imageUrl:
      'https://images.unsplash.com/photo-1617083934555-563d6412e9ae?auto=format&fit=crop&w=1200&q=80',
  },
];
  
}


