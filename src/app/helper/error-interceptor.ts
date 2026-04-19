import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '@/pages/service/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // Use inject to get the service instance
  private authenticationService = inject(AuthenticationService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if ([401, 403].includes(err.status)) {
          this.authenticationService.logout();
        }
        const error = err.error?.message || err.statusText;
        return throwError(() => new Error(error));
      })
    );
  }
}
