import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UrlService } from './url.service';

export interface DashboardFilters {
  from_date?: string;
  to_date?: string;
  year?: number;
  weeks?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base: string;
    constructor(private http: HttpClient, private _url: UrlService) {
      this.base = `${this._url.getApiUrl()}`;
    }

  private params(filters: DashboardFilters): HttpParams {
    let p = new HttpParams();
    if (filters.from_date) p = p.set('from_date', filters.from_date);
    if (filters.to_date) p = p.set('to_date', filters.to_date);
    if (filters.year) p = p.set('year', filters.year);
    if (filters.weeks) p = p.set('weeks', filters.weeks);
    return p;
  }

  getSummary(filters: DashboardFilters): Observable<any> {
    return this.http.get(`${this.base}dashboard/summary`, { params: this.params(filters) });
  }

  getByResource(filters: DashboardFilters): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}dashboard/by-resource`, { params: this.params(filters) });
  }

  getByDateRange(from_date: string, to_date: string): Observable<any> {
    return this.http.get(`${this.base}dashboard/by-date-range`, {
      params: new HttpParams().set('from_date', from_date).set('to_date', to_date)
    });
  }

  getWeekWise(filters: DashboardFilters): Observable<any> {
  return this.http.get(`${this.base}dashboard/week-wise`, {
    params: this.params(filters)
  });
}

  getMonthWise(filters: DashboardFilters): Observable<any> {
  return this.http.get(`${this.base}dashboard/month-wise`, {
    params: this.params(filters)
  });
}

  getYearWise(years = 3): Observable<any> {
    return this.http.get(`${this.base}dashboard/year-wise`, {
      params: new HttpParams().set('years', years)
    });
  }

  getByManager(filters: DashboardFilters): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}dashboard/by-manager`, { params: this.params(filters) });
  }

  getByProject(filters: DashboardFilters): Observable<any> {
    return this.http.get(`${this.base}dashboard/by-project`, { params: this.params(filters) });
  }

  getByBusinessUnit(filters: DashboardFilters): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}dashboard/by-business-unit`, { params: this.params(filters) });
  }

  getSubmissionCompliance(weeks = 8): Observable<any> {
    return this.http.get(`${this.base}dashboard/submission-compliance`, {
      params: new HttpParams().set('weeks', weeks)
    });
  }

  getBenchResources(threshold = 50, weeks = 4): Observable<any> {
    return this.http.get(`${this.base}dashboard/bench-resources`, {
      params: new HttpParams().set('threshold', threshold).set('weeks', weeks)
    });
  }
}