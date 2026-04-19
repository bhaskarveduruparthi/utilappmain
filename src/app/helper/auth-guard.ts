import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '@/pages/service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.tokenValue;
    const isLoggedIn = !!token?.access_token;

    if (!isLoggedIn) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false; // Block navigation
    }
    return true; // Allow navigation
  }
}
