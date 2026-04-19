import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url :string;
  constructor(private http: HttpClient , private _url : UrlService) {
    this.url = `${this._url.getApiUrl()}`
  }

  getToken(yash_id:string,password:string) {
    const userData = {yash_id,password};
    return this.http.post(`${this.url}users/login`, userData);
  }

  getUserDetails() {
    return this.http.get(`${this.url}users/getuser`)
  }

  changePassword(old_password:string, new_password:string) {
    const userdata = {old_password, new_password};
    return this.http.post(`${this.url}users/changepassword`, userdata);
  }

}
