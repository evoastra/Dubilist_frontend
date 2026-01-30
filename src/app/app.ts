import { Component, HostListener, signal } from '@angular/core';
import { LandingPage } from './components/landing-page/landing-page';
import { HomePage } from './components/home-page/home-page';
import { NavigationEnd, Router, RouterOutlet, RouterLinkWithHref } from "@angular/router";
import { AddPostComponent } from './components/add-post/add-post';
import { NavbarComponent } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'app-root',  
  imports: [RouterOutlet, NavbarComponent, CommonModule, FormsModule, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})
export class App {
  hideFooter = false;

  protected readonly title = signal('Dubilist');

   constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = [
          '/auth/login',
          '/auth/register',
          '/auth/signUp'
        ];

        this.hideFooter = hiddenRoutes.some(route =>
          event.urlAfterRedirects.startsWith(route)
        );
      });
  }
  

   @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const cursor = document.querySelector('.custom-cursor') as HTMLElement;
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
}
}
