import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  yash_id?: number;
  name?: string;
  password?: string;
  irm?: string;
  srm?: string;
  buh?: string;
  bgh?: string;
  email?: string;
  b_unit?: string;
  active?: string;
  type?: string;
}

export interface LoginLog {
  id?: number;
  yash_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  success?: boolean;
  message?: string | null;
  timestamp?: string;
}



@Injectable()
export class ManageAdminsService {
    
  private url: string;
  
  constructor(private http: HttpClient, private _url: UrlService) {
    this.url = `${this._url.getApiUrl()}`;
  }

  // ========== Existing Methods ==========

  getUsers(page: number = 1, search: string = '', perPage: number = 10): Observable<any> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return this.http.get(`${this.url}users/getallusers?page=${page}&per_page=${perPage}${searchParam}`);
  }

  // Full, unpaginated user list - used only by the Manage Users Excel
  // export button, not the normal page load.
  getAllUsersRecords(): Observable<any> {
    return this.http.get(`${this.url}users/getallusersrecords`);
  }

  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}users/getallmanagers`);
  }

  add_user(user: User): Observable<User> {
    const url = `${this.url}users/adduser`;
    return this.http.post<User>(url, user);
  }

  delete_user(yash_id: any): Observable<any> {
    const url = `${this.url}users/deleteuser/${yash_id}`;
    return this.http.delete(url);
  }

  getuser_by_id(yash_id: any): Observable<User> {
    const url = `${this.url}users/getuser_by_id/${yash_id}`;
    return this.http.get<User>(url);
  }

  edit_User(user: User): Observable<User> {
    const url = `${this.url}users/edituser/${user.yash_id}`;
    return this.http.put<User>(url, user);
  }

  get_log_records() {
    return this.http.get(`${this.url}users/getlogrecords`);
  }

  getalllogs(page: number) {
    return this.http.get(`${this.url}users/getlogs?page=${page}`);
  }

  downloadAllLogs(): Observable<LoginLog[]> {
      return this.http.get<LoginLog[]>(`${this.url}repos/download-all-logs`);
    }

}