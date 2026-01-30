import { Routes } from '@angular/router';

import { HomePage } from './components/home-page/home-page';
import { LandingPage } from './components/landing-page/landing-page';

import { AddPostComponent } from './components/add-post/add-post';
import { ReviewListingComponent } from './components/review-listing/review-listing';

import { PropertyListingsComponent } from './components/listings/property-listings/property-listings';
import { MotorListingsComponent } from './components/listings/motor-listings/motor-listings';
import { ElectronicsListingsComponent } from './components/listings/electronics-listings/electronics-listings';
import { FurnitureListingsComponent } from './components/listings/furniture-listings/furniture-listings';
import { JobsListingsComponent } from './components/listings/jobs-listings/jobs-listings';
import { ClassifiedListingsComponent } from './components/listings/classified-listings/classified-listings';
import { InteriorDesignerListingsComponent } from './components/listings/interior-designer-listings/interior-designer-listings';

import { AuthSignupComponent } from './components/auth-sign-up/auth-sign-up';
import { AuthLoginComponent } from './components/auth-login/auth-login';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { MyAdsComponent } from './components/my-ads/my-ads';
import { FavouritesComponent } from './components/my-favourites/my-favourites';
import { ChatComponent } from './components/my-chats/my-chats';

import { AuthGuard } from './guards/auth-guard';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy';
import { AboutUsComponent } from './components/about-us/about-us';

export const routes: Routes = [

  /* =======================
     PUBLIC ROUTES
     ======================= */

  { path: '', component: LandingPage },
  { path: 'home', component: HomePage },
  {path:'privacy-policy',component:PrivacyPolicyComponent},
  {path:'about-us',component:AboutUsComponent},

  /* AUTH */
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/signUp', component: AuthSignupComponent },

  /* PUBLIC LISTINGS */
  { path: 'listings/property', component: PropertyListingsComponent },
  { path: 'listings/motors', component: MotorListingsComponent },
  { path: 'listings/electronics', component: ElectronicsListingsComponent },
  { path: 'listings/jobs', component: JobsListingsComponent },
  { path: 'listings/furniture', component: FurnitureListingsComponent },
  { path: 'listings/classifieds', component: ClassifiedListingsComponent },
  { path: 'listings/interior-designers', component: InteriorDesignerListingsComponent },

  /* PUBLIC JOB ROUTES */
  { path: 'jobs/:id', component: JobsListingsComponent },
  { path: 'jobs/:id/apply', component: JobsListingsComponent },

  /* =======================
     PROTECTED ROUTES
     ======================= */

  {
    path: 'add-post',
    component: AddPostComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-post/review',
    component: ReviewListingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-ads',
    component: MyAdsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-favourites',
    component: FavouritesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-chats',
    component: ChatComponent,
    canActivate: [AuthGuard]
  },

  /* =======================
     ADMIN (OPTIONAL)
     ======================= */

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard] // later you can replace with AdminGuard
  },

  /* =======================
     FALLBACK
     ======================= */

  { path: '**', redirectTo: '' }
];
