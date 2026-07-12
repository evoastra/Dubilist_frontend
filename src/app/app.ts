import { Component, HostListener, HostBinding, signal, Inject, PLATFORM_ID } from '@angular/core';
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
import { Observable, delay } from 'rxjs';

@Component({
  selector: 'app-root',  
  imports: [RouterOutlet, NavbarComponent, CommonModule, FormsModule, RouterLinkWithHref,TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})
export class App {
  hideFooter = false;
  isAdminLayout = false;
  showCmgSoon = false;

  protected readonly title = signal('Dubilist');

  loading$!: Observable<boolean>;

  @HostBinding('class.admin-app-shell')
  get adminAppShell(): boolean {
    return this.isAdminLayout;
  }



   constructor(
     private router: Router,
     private loadingService: LoadingService,
     private translate: TranslateService,
     @Inject(PLATFORM_ID) private platformId: Object
   ) {
    this.loading$ = this.loadingService.loading$.pipe(delay(0));
    this.updateLayoutForRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutForRoute(event.urlAfterRedirects);
      });
  }

  private updateLayoutForRoute(url: string) {
    const hiddenFooterRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/signUp',
      '/admin'
    ];

    this.hideFooter = hiddenFooterRoutes.some(route => url.startsWith(route));
    this.isAdminLayout = url.startsWith('/admin');
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
