import { Component, HostListener, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LandingPage } from './components/landing-page/landing-page';
import { HomePage } from './components/home-page/home-page';
import { NavigationEnd, Router, RouterOutlet, RouterLinkWithHref } from "@angular/router";
import { AddPostComponent } from './components/add-post/add-post';
import { NavbarComponent } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/internal/operators/filter';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoadingService } from './services/loading-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',  
  imports: [RouterOutlet, NavbarComponent, CommonModule, FormsModule, RouterLinkWithHref,TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})
export class App {
  hideFooter = false;
  showCmgSoon = false;

  protected readonly title = signal('Dubilist');

  loading$!: Observable<boolean>;



   constructor(
     private router: Router,
     private loadingService: LoadingService,
     private translate: TranslateService,
     @Inject(PLATFORM_ID) private platformId: Object
   ) {
    this.loading$ = this.loadingService.loading$;
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

  switchLanguage(lang: string) {
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("app_lang", lang);
      document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
  }

  openCmgSoon(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showCmgSoon = true;
    setTimeout(() => {
      this.showCmgSoon = false;
    }, 3000);
  }
  
  

   @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (isPlatformBrowser(this.platformId)) {
      const cursor = document.querySelector('.custom-cursor') as HTMLElement;
      if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    }
}


}
