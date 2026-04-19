import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Token } from '@/helper/token.model';
import { User } from '@/pages/service/manageadmins.service';
import { UrlService } from './url.service';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private tokenSubject: BehaviorSubject<Token | null>;
  public token: Observable<Token | null>;

  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient, private _url : UrlService
  ) {
    this.tokenSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('token')!));
    this.token = this.tokenSubject.asObservable();

    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
    this.user = this.userSubject.asObservable();

  }

  public get tokenValue() {
    return this.tokenSubject.value;
  }
  public set tokenValue(token) {
    this.tokenSubject.next(token);
  }


  public get userValue() {
    return this.userSubject.value;
  }
  public set userValue(user) {
    this.userSubject.next(user);
  }

  

  
  


  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    localStorage.removeItem('user');
    
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
