import { Component, HostListener } from '@angular/core';
import { NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
@Component({
  selector: 'app-landing-page',
  imports: [NgFor, RouterLink],
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

 

}