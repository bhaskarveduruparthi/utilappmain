import { Injectable  } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable  } from 'rxjs';
import { UrlService } from './url.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private base :string;

  constructor(private http: HttpClient, private _url: UrlService) {
    this.base = `${this._url.getApiUrl()}`;
  }

  

  // ── Weekly ──────────────────────────────────────────────────────────────────
  getWeeklyReport(weekStart: string): Observable<any> {
    const params = new HttpParams().set('week_start', weekStart);
    return this.http.get(`${this.base}reports/weekly`, { params });
  }
 
  exportWeekly(weekStart: string): Observable<Blob> {
    const params = new HttpParams().set('week_start', weekStart);
    return this.http.get(`${this.base}reports/weekly/export`, { params, responseType: 'blob' });
  }
 
  // ── Monthly ─────────────────────────────────────────────────────────────────
  getMonthlyReport(year: number, month: number): Observable<any> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get(`${this.base}reports/monthly`, { params });
  }
 
  exportMonthly(year: number, month: number): Observable<Blob> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get(`${this.base}reports/monthly/export`, { params, responseType: 'blob' });
  }
 
  // ── Yearly ──────────────────────────────────────────────────────────────────
  getYearlyReport(year: number): Observable<any> {
    const params = new HttpParams().set('year', year);
    return this.http.get(`${this.base}reports/yearly`, { params });
  }
 
  exportYearly(year: number): Observable<Blob> {
    const params = new HttpParams().set('year', year);
    return this.http.get(`${this.base}reports/yearly/export`, { params, responseType: 'blob' });
  }
 
  // ── Custom Range ─────────────────────────────────────────────────────────────
  getCustomReport(from: string, to: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get(`${this.base}reports/custom`, { params });
  }
 
  exportCustom(from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get(`${this.base}reports/custom/export`, { params, responseType: 'blob' });
  }
 
  // ── Utility ──────────────────────────────────────────────────────────────────
  /** Returns all available week labels for populating dropdowns */
  getAvailableWeeks(): Observable<{ weeks: string[] }> {
    return this.http.get<{ weeks: string[] }>(`${this.base}reports/weeks`);
  }
}