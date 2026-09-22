import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

// Talks only to /historical/* -- the read-only endpoints backing pre-launch
// data (resources/historical_reports.py). Deliberately a separate service
// from ReportsService: the two hit different API surfaces backed by
// different tables, and keeping them apart mirrors the backend's Option B
// separation (historical data never merges into or is queried alongside
// live report data).
@Injectable({ providedIn: 'root' })
export class HistoricalReportsService {
  private base: string;

  constructor(private http: HttpClient, private _url: UrlService) {
    this.base = `${this._url.getApiUrl()}`;
  }

  // ── Weekly ──────────────────────────────────────────────────────────────
  getWeekly(weekStart: string): Observable<any> {
    const params = new HttpParams().set('week_start', weekStart);
    return this.http.get(`${this.base}historical/weekly`, { params });
  }

  exportWeekly(weekStart: string): Observable<Blob> {
    const params = new HttpParams().set('week_start', weekStart);
    return this.http.get(`${this.base}historical/export/weekly`, { params, responseType: 'blob' });
  }

  // ── Monthly ─────────────────────────────────────────────────────────────
  getMonthly(year: number, month: number): Observable<any> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get(`${this.base}historical/monthly`, { params });
  }

  exportMonthly(year: number, month: number): Observable<Blob> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get(`${this.base}historical/export/monthly`, { params, responseType: 'blob' });
  }

  // ── Yearly ──────────────────────────────────────────────────────────────
  getYearly(year: number): Observable<any> {
    const params = new HttpParams().set('year', year);
    return this.http.get(`${this.base}historical/yearly`, { params });
  }

  exportYearly(year: number): Observable<Blob> {
    const params = new HttpParams().set('year', year);
    return this.http.get(`${this.base}historical/export/yearly`, { params, responseType: 'blob' });
  }

  // ── Custom Range ────────────────────────────────────────────────────────
  getCustom(from: string, to: string): Observable<any> {
    const params = new HttpParams().set('from_date', from).set('to_date', to);
    return this.http.get(`${this.base}historical/custom`, { params });
  }

  exportCustom(from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from_date', from).set('to_date', to);
    return this.http.get(`${this.base}historical/export/custom`, { params, responseType: 'blob' });
  }
}
