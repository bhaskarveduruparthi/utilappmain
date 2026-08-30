// ─── timesheet.service.ts ───────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UrlService } from './url.service';


interface TeamResponse {
  week_start: string;
  week_end: string;
  data: TeamMember[];
}

interface TeamMember {
  user_id: number;
  user_name: string;
  yash_id: string;
  b_unit: string;
  irm: string;
  status: string;
  timesheet: any | null;
  _approving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  
  private base: string;
  constructor(private http: HttpClient, private _url: UrlService) {
    this.base = `${this._url.getApiUrl()}`;
  }

  

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}timesheet/projects`);
  }

  /** Projects the *current* user may log timesheet hours against (assignment-gated for Billable projects). */
  getMyTimesheetProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}timesheet/my-projects`);
  }

  /** Manager/Superadmin only: users this manager may assign projects to. */
  getAllocatableUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}timesheet/allocatable-users`);
  }

  /** Manager/Superadmin only: list project allocations, optionally for one user. */
  getAllocations(userId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (userId) params = params.set('user_id', userId);
    return this.http.get<any[]>(`${this.base}timesheet/allocations`, { params });
  }

  createAllocation(payload: { user_id: number; project_id: number; start_date: string; end_date?: string | null }): Observable<any> {
    return this.http.post<any>(`${this.base}timesheet/allocate`, payload);
  }

  updateAllocation(id: number, payload: { start_date?: string; end_date?: string | null }): Observable<any> {
    return this.http.put<any>(`${this.base}timesheet/allocations/${id}`, payload);
  }

  deleteAllocation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}timesheet/allocations/${id}`);
  }

  getWeekTimesheet(weekStart: string): Observable<any> {
    return this.http.get<any>(`${this.base}timesheet/week`, {
      params: new HttpParams().set('week_start', weekStart)
    });
  }

  saveTimesheet(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}timesheet/save`, payload);
  }

  submitTimesheet(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}timesheet/submit`, payload);
  }

  approveTimesheet(id: number): Observable<any> {
    return this.http.post<any>(`${this.base}timesheet/${id}/approve`, {});
  }

  rejectTimesheet(id: number, remarks: string): Observable<any> {
    return this.http.post<any>(`${this.base}timesheet/${id}/reject`, { remarks });
  }

  getMyHistory(page = 1, limit = 10, year?: number, month?: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    return this.http.get<any>(`${this.base}timesheet/my-history`, { params });
  }

  getTeamTimesheets(week?: string | null) {
  let url = `${this.base}timesheet/team/v2`;

  if (week) {
    url += `?week_start=${week}`;
  }

  return this.http.get<TeamResponse>(url);
}
 
  getTeamPendingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/timesheet/team/pending-count`);
  }
}



