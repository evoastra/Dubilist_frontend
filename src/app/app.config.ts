import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
     provideHttpClient(withFetch(),withInterceptors([authInterceptor])),
   provideRouter(routes), 
  ]
};
