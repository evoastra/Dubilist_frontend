import { Component, HostListener } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-landing-page',
  imports: [ RouterLink,CommonModule,TranslateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
    emirates = [
    'Dubai',
    'Sharjah',
    'Abu Dhabi',
    'Ajman',
    'Al Ain',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain'
  ];
features = [
  {
    icon: 'fas fa-camera',
    iconClass: 'icon-1',
    title: 'Easy Posting',
    description: 'Post ads in seconds with our streamlined flow.'
  },
  {
    icon: 'fas fa-search-plus',
    iconClass: 'icon-2',
    title: 'Smart Search',
    description: 'Find exactly what you need with advanced filters.'
  },
  {
    icon: 'fas fa-magic',
    iconClass: 'icon-3',
    title: 'AI Descriptions',
    description: 'Our AI tool generates professional descriptions for you.'
  },
  {
    icon: 'fas fa-shield-alt',
    iconClass: 'icon-4',
    title: 'Verified Users',
    description: 'Trade with confidence with our verification system.'
  },
  {
    icon: 'fas fa-comment-alt',
    iconClass: 'icon-5',
    title: 'Real-Time Chat',
    description: 'Negotiate deals safely without sharing your number.'
  },
  {
    icon: 'fas fa-tools',
    iconClass: 'icon-6',
    title: 'Designers',
    description: 'Connect with top interior designers instantly.'
  }
];

 

}