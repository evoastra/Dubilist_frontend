import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { AddPostComponent } from './components/add-post/add-post';
import { ReviewListingComponent } from './components/review-listing/review-listing';
import { PropertyListingsComponent } from './components/listings/property-listings/property-listings';
import { MotorListingsComponent } from './components/listings/motor-listings/motor-listings';
import { ElectronicsListingsComponent } from './components/listings/electronics-listings/electronics-listings';
import { FurnitureListingsComponent } from './components/listings/furniture-listings/furniture-listings';
import { JobsListingsComponent } from './components/listings/jobs-listings/jobs-listings';
import { ClassifiedListingsComponent } from './components/listings/classified-listings/classified-listings';
import { AuthSignupComponent } from './components/auth-sign-up/auth-sign-up';
import {  AuthLoginComponent } from './components/auth-login/auth-login';
import { InteriorDesignerListingsComponent } from './components/listings/interior-designer-listings/interior-designer-listings';
import { LandingPage } from './components/landing-page/landing-page';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  {path:'admin',component:AdminDashboardComponent},
  { path: 'add-post', component: AddPostComponent },
  { path: 'add-post/review', component: ReviewListingComponent },
   { path: 'listings/property', component: PropertyListingsComponent },
  { path: 'listings/motors', component: MotorListingsComponent }, // Create when needed
  { path: 'listings/electronics', component: ElectronicsListingsComponent }, // Create when needed
  { path: 'listings/jobs', component: JobsListingsComponent }, // Create when needed
   { path: 'jobs/:id', component: JobsListingsComponent },
      { path: 'jobs/:id/apply', component: JobsListingsComponent },
  { path: 'listings/furniture', component: FurnitureListingsComponent }, // Create when needed
  { path: 'listings/classifieds', component: ClassifiedListingsComponent }, // Create when needed
  {path: 'auth/signUp', component: AuthSignupComponent},
  {path:'listings/interior-designers', component: InteriorDesignerListingsComponent},
     {path: 'auth/login', component: AuthLoginComponent},
     {path:'',component:LandingPage},
  // Wildcard redirect
  { path: '**', redirectTo: '' }
];
