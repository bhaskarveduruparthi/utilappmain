import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '@/pages/service/authentication.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
 
export const jwtInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authenticationService = inject(AuthenticationService);
  const token = authenticationService.tokenValue;
  const isLoggedIn = !!token?.access_token;
  const isApiUrl = request.url.startsWith(`${environment.protocol}://${environment.apiBaseHost}/`);
  
  if (isLoggedIn && isApiUrl) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token.access_token}`
      }
    });
  }
 
  return next(request);
};