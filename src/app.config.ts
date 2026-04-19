import { provideHttpClient,  withInterceptors, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { AuthGuard } from '@/helper/auth-guard';
 
 
import { ErrorInterceptor } from '@/helper/error-interceptor';
import { jwtInterceptor } from '@/helper/jwt-interceptor';
 
export const appConfig: ApplicationConfig = {
    providers: [
        AuthGuard,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withInterceptors([jwtInterceptor]), withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura,  options: { darkModeSelector: '.app-dark' } } }),
        
        
    ]
};
 
 