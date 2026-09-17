import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';


import { AuthenticationService } from '../service/authentication.service';
import { TimesheetService } from '../service/timsheet.service';
import { Card } from "primeng/card";

interface TimesheetRow {
  id?: number;
  project_id: number | null;
  project_name: string;
  project_code: string;
  project_type: string;
  mon: number; tue: number; wed: number;
  thu: number; fri: number; sat: number; sun: number;
  total: number;
}

@Component({
  selector: 'app-submit-timesheet',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, ToastModule, TagModule, TooltipModule,
    ConfirmDialogModule, SelectModule,
    Card
],
  providers: [MessageService, ConfirmationService],
  template: `
  <p-card>
  <p-toast position="top-right" />
<p-confirmDialog />
<div class="ts-page">

  <!-- Top Info Bar -->
  <div class="ts-topbar">
    <div class="ts-meta-card">
      <div class="ts-meta-icon hours-icon"><i class="pi pi-clock"></i></div>
      <div>
        <div class="ts-meta-label">Attended / Scheduled</div>
        <div class="ts-meta-value">
          <span [class.over]="totalHours() > scheduledHours">{{ totalHours() }} hrs</span>
          <span class="sep">/</span>
          <span class="sched">{{ scheduledHours }} hrs</span>
        </div>
      </div>
    </div>

    <div class="ts-meta-card week-card">
      <button class="week-nav" (click)="prevWeek()"><i class="pi pi-chevron-left"></i></button>
      <div class="week-center">
        <div class="week-month">{{ weekMonthLabel }}</div>
        <div class="week-range">{{ weekDayRange }}</div>
      </div>
      <button class="week-nav" (click)="nextWeek()"><i class="pi pi-chevron-right"></i></button>
    </div>

    <div class="ts-meta-card">
      <div class="ts-meta-icon" [ngClass]="statusIconBg()"><i class="pi" [ngClass]="statusIconPi()"></i></div>
      <div>
        <div class="ts-meta-label">Status</div>
        <p-tag [value]="timesheetStatus()" [severity]="statusSeverity()" />
      </div>
    </div>

    <div class="ts-meta-card approver-card">
      <div class="ts-meta-icon approver-icon"><i class="pi pi-user-edit"></i></div>
      <div>
        <div class="ts-meta-label">Goes To (IRM / Manager)</div>
        <div class="ts-meta-value approver-name">{{ approverName() }}</div>
        <div class="ts-meta-hint">{{ approverEmail() }}</div>
      </div>
    </div>

    
  </div>

  <!-- Status Banners -->
  @if (timesheetStatus() === 'Submitted') {
    <div class="banner info-banner">
      <i class="pi pi-send banner-icon"></i>
      <div>
        <div class="banner-title">Billable effort submitted successfully</div>
        <div class="banner-sub">Sent to <strong>{{ approverName() }}</strong> for approval. You can view the details below (read-only).</div>
      </div>
    </div>
  }
  @if (timesheetStatus() === 'Approved') {
    <div class="banner success-banner">
      <i class="pi pi-verified banner-icon"></i>
      <div>
        <div class="banner-title">Billable effort approved by {{ approverName() }}</div>
        <div class="banner-sub">Your billable effort is finalized.</div>
      </div>
    </div>
  }
  @if (timesheetStatus() === 'Rejected') {
    <div class="banner danger-banner">
      <i class="pi pi-times-circle banner-icon"></i>
      <div>
        <div class="banner-title">Billable effort rejected — please correct and resubmit</div>
        <div class="banner-sub">{{ rejectionRemarks() }}</div>
      </div>
    </div>
  }

  <!-- Timesheet Table -->
  <div class="ts-table-card">
    <div class="ts-table-header">
      <span class="ts-table-title">Billable Effort (Fill in only Customer Approved Billable Efforts)</span>
      <div class="ts-header-right">
        @if (isLocked()) {
          <span class="readonly-badge"><i class="pi pi-lock"></i> Read-only</span>
        } @else {
          <button class="copy-btn" (click)="copyPrevWeek()"><i class="pi pi-copy"></i> Copy Previous Week</button>
        }
      </div>
    </div>

    <div class="ts-grid-wrapper">
      <table class="ts-table">
        <thead>
          <tr>
            <th class="col-project">Project</th>
            <th class="col-type">Type</th>
            @for (dh of dayHeaders(); track dh.key) {
              <th class="col-day" [class.weekend]="dh.weekend">
                <span class="day-name">{{ dh.label }}</span>
                <span class="day-num">{{ dh.date }}</span>
              </th>
            }
            <th class="col-total">Total</th>
            @if (!isLocked()) { <th class="col-actions"></th> }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index; let i = $index) {
            <tr>
              <td class="col-project">
                @if (!isLocked()) {
                  <p-select [options]="projectOptions" [(ngModel)]="row.project_id"
                    optionLabel="label" optionValue="value" placeholder="Select Project"
                    [filter]="true" filterBy="label"
                    (onChange)="onProjectChange(i, $event)"
                    styleClass="w-full project-select" appendTo="body" />
                } @else {
                  <span class="proj-readonly">{{ row.project_name || '—' }}</span>
                }
              </td>
              <td class="col-type">
                <span class="type-badge" [class]="'type-' + (row.project_type?.toLowerCase() || '')">{{ row.project_type || '—' }}</span>
              </td>
              @for (dk of dayKeys; track dk; let di = $index) {
                <td class="col-day" [class.weekend]="di >= 5">
                  @if (!isLocked()) {
                    <input type="number" class="hour-input"
                      [class.has-value]="getDay(row,dk) > 0"
                      [ngModel]="getDay(row,dk)"
                      (ngModelChange)="setDay(row,i,dk,$event)"
                      min="0" max="24" step="0.5" placeholder="0" />
                  } @else {
                    <span class="hour-readonly" [class.has-value]="getDay(row,dk) > 0">
                      {{ getDay(row,dk) > 0 ? getDay(row,dk) : '—' }}
                    </span>
                  }
                </td>
              }
              <td class="col-total"><span class="total-badge" [class.full]="row.total >= 40">{{ row.total }}</span></td>
              @if (!isLocked()) {
                <td class="col-actions">
                  <button class="row-action" (click)="addRow()" pTooltip="Add row" tooltipPosition="top"><i class="pi pi-plus"></i></button>
                  <button class="row-action del" (click)="deleteRow(i)" pTooltip="Remove" tooltipPosition="top"><i class="pi pi-trash"></i></button>
                  <button class="row-action" (click)="duplicateRow(i)" pTooltip="Duplicate" tooltipPosition="top"><i class="pi pi-copy"></i></button>
                </td>
              }
            </tr>
          }
          <tr class="totals-row">
            <td colspan="2"><strong>Daily Total</strong></td>
            @for (dk of dayKeys; track dk; let di = $index) {
              <td class="col-day" [class.over]="dayTotal(dk) > 9" [class.weekend]="di >= 5">
                <strong>{{ dayTotal(dk) || '' }}</strong>
              </td>
            }
            <td class="col-total grand-total"><strong>{{ totalHours() }}</strong></td>
            @if (!isLocked()) { <td></td> }
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ts-progress-row">
      <span class="prog-label">{{ totalHours() }} / {{ scheduledHours }} hrs</span>
      <div class="prog-bar-wrap">
        <div class="prog-bar" [style.width]="progressPct() + '%'" [class.over]="totalHours() > scheduledHours"></div>
      </div>
      <span class="prog-pct" [class.over]="totalHours() > scheduledHours">{{ progressPct() }}%</span>
    </div>

    <div class="ts-footer-actions">
      @if (!isLocked() && timesheetStatus() !== 'Approved') {
        <button class="btn-secondary" (click)="addRow()"><i class="pi pi-plus"></i> Add Row</button>
        <span class="spacer"></span>
        <button class="btn-ghost" (click)="saveDraft()" [disabled]="saving()">
          <i class="pi" [class.pi-save]="!saving()" [class.pi-spin]="saving()" [class.pi-spinner]="saving()"></i>
          {{ saving() ? 'Saving…' : 'Save Draft' }}
        </button>
        <button class="btn-primary" (click)="confirmSubmit()" [disabled]="submitting() || totalHours() === 0">
          <i class="pi" [class.pi-send]="!submitting()" [class.pi-spin]="submitting()" [class.pi-spinner]="submitting()"></i>
          {{ submitting() ? 'Submitting…' : 'Submit for Approval' }}
        </button>
      }
      @if (timesheetStatus() === 'Submitted') {
        <div class="footer-info-msg"><i class="pi pi-info-circle"></i>
          Awaiting approval from <strong>{{ approverName() }}</strong>.
          <a routerLink="/timesheet/history">View all timesheets →</a>
        </div>
      }
      @if (timesheetStatus() === 'Approved') {
        <div class="footer-success-msg"><i class="pi pi-check-circle"></i> Approved.</div>
      }
      @if (timesheetStatus() === 'Rejected') {
        <span class="spacer"></span>
        <button class="btn-primary" (click)="confirmSubmit()" [disabled]="submitting()">
          <i class="pi pi-send"></i> Resubmit
        </button>
      }
    </div>
  </div>
</div>
  </p-card>

  `,
  styles: [`
    :host { display: block; }
    .ts-page { padding: 2.5rem 3rem; max-width: 1700px; margin: 0 auto; }
    .ts-topbar { display: flex; gap: 0.875rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .ts-meta-card {
      background: white; border: 1px solid #E5E7EB; border-radius: 10px;
      padding: 0.875rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; flex: 1; min-width: 155px;
    }
    .ts-meta-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
    .hours-icon { background: #EEF2FF; color: #4F46E5; }
    .holiday-icon { background: #FEF3C7; color: #D97706; }
    .approver-icon { background: #F0FDF4; color: #16A34A; }
    .status-blue { background: #DBEAFE; color: #2563EB; }
    .status-green { background: #DCFCE7; color: #16A34A; }
    .status-red { background: #FEE2E2; color: #DC2626; }
    .status-gray { background: #F3F4F6; color: #6B7280; }
    .ts-meta-label { font-size: 0.75rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .ts-meta-value { font-size: 1.1rem; font-weight: 700; color: #111827; }
    .ts-meta-value .over { color: #DC2626; }
    .ts-meta-value .sched { color: #F59E0B; }
    .ts-meta-value .sep { color: #9CA3AF; margin: 0 0.2rem; }
    .ts-meta-hint { font-size: 0.68rem; color: #9CA3AF; }
    .approver-name { color: #1E3A5F; }
    .week-card { flex: 1.8; justify-content: space-between; }
    .week-nav { background: none; border: 1px solid #E5E7EB; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #6B7280; transition: all 0.15s; }
    .week-nav:hover { background: #F3F4F6; }
    .week-center { text-align: center; flex: 1; }
    .week-month { font-size: 0.68rem; color: #6B7280; }
    .week-range { font-size: 1rem; font-weight: 800; color: #111827; }
    .banner { display: flex; align-items: flex-start; gap: 0.875rem; border-radius: 10px; padding: 0.875rem 1.25rem; margin-bottom: 1rem; }
    .banner-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 2px; }
    .banner-title { font-weight: 700; font-size: 0.88rem; color: #111827; }
    .banner-sub { font-size: 0.8rem; color: #374151; margin-top: 2px; }
    .info-banner { background: #EFF6FF; border: 1px solid #BFDBFE; }
    .info-banner .banner-icon { color: #2563EB; }
    .success-banner { background: #F0FDF4; border: 1px solid #BBF7D0; }
    .success-banner .banner-icon { color: #16A34A; }
    .danger-banner { background: #FEF2F2; border: 1px solid #FECACA; }
    .danger-banner .banner-icon { color: #DC2626; }
    .ts-table-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
    .ts-table-header { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.5rem; border-bottom: 1px solid #F3F4F6; }
    .ts-table-title { font-size: 0.95rem; font-weight: 700; color: #111827; }
    .ts-header-right { display: flex; align-items: center; gap: 0.75rem; }
    .copy-btn { background: none; border: 1px solid #E5E7EB; border-radius: 8px; padding: 5px 12px; font-size: 0.78rem; color: #4F46E5; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .copy-btn:hover { background: #EEF2FF; }
    .readonly-badge { font-size: 0.73rem; color: #6B7280; background: #F3F4F6; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 0.3rem; }
    .ts-grid-wrapper { overflow-x: auto; }
    .ts-table { width: 100%; border-collapse: collapse; font-size: var(--fs-table-body); }
    .ts-table thead th { background: #F8FAFC; padding: 0.8rem 0.6rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB; white-space: nowrap; font-size: var(--fs-table-header); }
    .col-project { width: 230px; text-align: left !important; padding-left: 1rem !important; }
    .col-type { width: 90px; }
    .col-day { width: 64px; }
    .col-total { width: 68px; }
    .col-actions { width: 94px; }
    .day-name { display: block; font-size: 0.65rem; color: #6B7280; }
    .day-num { display: block; font-size: 0.85rem; font-weight: 700; color: #111827; }
    .weekend { background: #FAFAFA; }
    th.weekend { background: #F1F5F9; }
    .ts-table tbody tr:hover { background: #F9FAFB; }
    .ts-table tbody td { padding: 0.6rem 0.5rem; border-bottom: 1px solid #F3F4F6; text-align: center; vertical-align: middle; }
    .ts-table tbody td.col-project { text-align: left; padding-left: 1rem; }
    .hour-input { width: 60px; height: 34px; border: 1px solid #E5E7EB; border-radius: 6px; text-align: center; font-size: 0.9rem; background: #FAFAFA; outline: none; transition: all 0.15s; }
    .hour-input:focus { border-color: #4F46E5; background: white; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
    .hour-input.has-value { background: #EEF2FF; border-color: #C7D2FE; font-weight: 700; color: #4338CA; }
    .hour-readonly { font-size: 0.83rem; color: #9CA3AF; }
    .hour-readonly.has-value { font-weight: 700; color: #4338CA; }
    .proj-readonly { font-weight: 600; color: #1E3A5F; font-size: 0.83rem; }
    .type-badge { font-size: 0.66rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; }
    .type-billable { background: #DCFCE7; color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave { background: #FEF3C7; color: #92400E; }
    .type-pmo { background: #F3E8FF; color: #7E22CE; }
    .total-badge { font-weight: 700; color: #374151; font-size: 0.88rem; }
    .total-badge.full { color: #16A34A; }
    .totals-row td { background: #F8FAFC; border-top: 2px solid #E5E7EB; font-size: 0.83rem; }
    .totals-row td.over { color: #DC2626; }
    .grand-total { color: #1E3A5F; font-weight: 800 !important; }
    .row-action { background: none; border: none; cursor: pointer; width: 26px; height: 26px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 0.78rem; transition: all 0.15s; }
    .row-action:hover { background: #F3F4F6; color: #111827; }
    .row-action.del:hover { background: #FEF2F2; color: #DC2626; }
    .ts-progress-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1.5rem; border-top: 1px solid #F3F4F6; background: #FAFAFA; }
    .prog-label { font-size: 0.75rem; font-weight: 600; color: #374151; min-width: 80px; }
    .prog-bar-wrap { flex: 1; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
    .prog-bar { height: 100%; background: linear-gradient(90deg, #1E3A5F, #4F46E5); border-radius: 3px; transition: width 0.3s; }
    .prog-bar.over { background: linear-gradient(90deg, #EF4444, #DC2626); }
    .prog-pct { font-size: 0.75rem; font-weight: 700; color: #4F46E5; min-width: 36px; text-align: right; }
    .prog-pct.over { color: #DC2626; }
    .ts-footer-actions { padding: 0.875rem 1.5rem; display: flex; gap: 0.75rem; align-items: center; border-top: 1px solid #F3F4F6; flex-wrap: wrap; }
    .spacer { flex: 1; }
    .btn-primary { background: #1E3A5F; color: white; border: none; border-radius: 8px; padding: 0.6rem 1.4rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; }
    .btn-primary:hover:not(:disabled) { background: #162D4D; }
    .btn-primary:disabled { opacity: 0.5; cursor: default; }
    .btn-ghost { background: white; color: #374151; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0.6rem 1.4rem; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s; }
    .btn-ghost:hover { border-color: #D1D5DB; background: #F9FAFB; }
    .btn-secondary { background: #F3F4F6; color: #374151; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0.6rem 1.4rem; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
    .footer-info-msg { font-size: 0.82rem; color: #374151; display: flex; align-items: center; gap: 0.5rem; flex: 1; flex-wrap: wrap; }
    .footer-info-msg i { color: #2563EB; }
    .footer-info-msg a { color: #4F46E5; font-weight: 600; text-decoration: none; }
    .footer-success-msg { font-size: 0.82rem; color: #16A34A; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    ::ng-deep .project-select .p-inputtext { font-size: 0.81rem !important; }
  `]
})
export class SubmitTimesheetComponent implements OnInit {
  rows = signal<TimesheetRow[]>([]);
  saving = signal(false);
  submitting = signal(false);
  timesheetId: number | null = null;
  timesheetStatus = signal<string>('Not Submitted');
  rejectionRemarks = signal<string>('');
  scheduledHours = 45;
  currentWeekStart: Date = new Date();
  projectOptions: { label: string; value: number; type: string }[] = [];
  approverName = signal<string>('Manager (IRM)');
  approverEmail = signal<string>('');

  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  constructor(
    private tsService: TimesheetService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    if (params['week_start']) {
      // Parse as local date (not UTC)
      const [y, m, d] = params['week_start'].split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setHours(0, 0, 0, 0);
      // Snap to Monday
      const day = date.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      date.setDate(date.getDate() + diff);
      this.currentWeekStart = date;
    } else {
      this.setToCurrentWeek();
    }
    this.loadApprover();
    this.loadProjects();
    this.loadTimesheet();
  });
}

  setToCurrentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // go back to Monday
  today.setDate(today.getDate() + diff);
  this.currentWeekStart = today;
}

  get weekMonthLabel() {
  const end = new Date(this.currentWeekStart);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 6);
  return end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

get weekDayRange() {
  const start = this.currentWeekStart;
  const end = new Date(start);
  end.setHours(0, 0, 0, 0);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} – ${end.getDate()}`;
}

  dayHeaders() {
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => {
      const d = new Date(this.currentWeekStart); d.setDate(d.getDate() + i);
      return { key: this.dayKeys[i], label, date: d.getDate().toString(), weekend: i >= 5 };
    });
  }

  totalHours = computed(() => this.rows().reduce((s, r) => s + (r.total || 0), 0));
  progressPct = computed(() => Math.min(Math.round((this.totalHours() / this.scheduledHours) * 100), 100));
  isLocked = computed(() => ['Submitted', 'Approved'].includes(this.timesheetStatus()));

  statusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = this.timesheetStatus();
    if (s === 'Approved') return 'success';
    if (s === 'Submitted') return 'info';
    if (s === 'Rejected') return 'danger';
    return 'secondary';
  }
  statusIconBg() {
    const s = this.timesheetStatus();
    if (s === 'Approved') return 'ts-meta-icon status-green';
    if (s === 'Rejected') return 'ts-meta-icon status-red';
    if (s === 'Submitted') return 'ts-meta-icon status-blue';
    return 'ts-meta-icon status-gray';
  }
  statusIconPi() {
    const s = this.timesheetStatus();
    if (s === 'Approved') return 'pi-check-circle';
    if (s === 'Rejected') return 'pi-times-circle';
    if (s === 'Submitted') return 'pi-send';
    return 'pi-circle';
  }

  dayTotal(dk: string) { return this.rows().reduce((s, r) => s + (this.getDay(r, dk) || 0), 0); }
  getDay(row: TimesheetRow, dk: string): number { return (row as any)[dk] || 0; }
  setDay(row: TimesheetRow, i: number, dk: string, val: number) {
    (row as any)[dk] = Number(val) || 0;
    this.rows.update(rows => { rows[i].total = this.dayKeys.reduce((s, k) => s + ((rows[i] as any)[k] || 0), 0); return [...rows]; });
  }

  recalcRow(i: number) {
    this.rows.update(rows => {
      rows[i].total = this.dayKeys.reduce((s, k) => s + ((rows[i] as any)[k] || 0), 0);
      return [...rows];
    });
  }

  prevWeek() {
  const d = new Date(this.currentWeekStart);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 7);
  this.currentWeekStart = d;
  this.loadTimesheet();
}

nextWeek() {
  const d = new Date(this.currentWeekStart);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  this.currentWeekStart = d;
  this.loadTimesheet();
}

  loadApprover() {
    const user = this.authService.userValue;
    this.approverName.set(user?.irm || 'Manager (IRM)');
    
  }

  loadProjects() {
    // Every active project is visible to every user here (2026-09-09) —
    // see /timesheet/my-projects on the backend.
    this.tsService.getMyTimesheetProjects().subscribe({
      next: (projects) => {
        this.projectOptions = projects.map((p: any) => ({ label: p.project_name, value: p.id, type: p.project_type }));
      }
    });
  }

  weekStartIso(): string {
  const d = this.currentWeekStart;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

  loadTimesheet() {
  this.rows.set([]);  // ← clear immediately so stale data doesn't show
  this.timesheetId = null;
  this.timesheetStatus.set('Not Submitted');

  this.tsService.getWeekTimesheet(this.weekStartIso()).subscribe({
    next: (ts: any) => {
      this.timesheetId = ts.id;
      this.timesheetStatus.set(ts.status || 'Draft');
      this.rejectionRemarks.set(ts.remarks || '');
      this.scheduledHours = ts.scheduled_hours || 45;

      if (ts.entries?.length > 0) {
        this.rows.set(ts.entries.map((e: any) => ({
          id: e.id,
          project_id: e.project_id,
          project_name: e.project_name,
          project_code: e.project_code,
          project_type: e.project_type,
          mon: e.mon_hours || 0, tue: e.tue_hours || 0,
          wed: e.wed_hours || 0, thu: e.thu_hours || 0,
          fri: e.fri_hours || 0, sat: e.sat_hours || 0,
          sun: e.sun_hours || 0,
          total: e.total_hours || 0,
        })));
      } else {
        this.rows.set([this.emptyRow()]);
      }
    },
    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load timesheet' })
  });
}

  emptyRow(): TimesheetRow {
    return { project_id: null, project_name: '', project_code: '', project_type: '', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0, total: 0 };
  }

  addRow() { if (!this.isLocked()) this.rows.update(r => [...r, this.emptyRow()]); }
  deleteRow(i: number) { this.rows.update(r => r.filter((_, x) => x !== i)); if (!this.rows().length) this.addRow(); }
  duplicateRow(i: number) { const row = { ...this.rows()[i], id: undefined }; this.rows.update(r => [...r.slice(0, i + 1), row, ...r.slice(i + 1)]); }

  onProjectChange(index: number, event: any) {
    const proj = this.projectOptions.find(p => p.value === event.value);
    this.rows.update(rows => { rows[index].project_type = proj?.type || ''; rows[index].project_name = proj?.label || ''; return [...rows]; });
  }

  buildPayload() {
    return {
      timesheet_id: this.timesheetId,
      entries: this.rows().filter(r => r.project_id !== null).map(r => ({
        project_id: r.project_id,
        mon_hours: r.mon, tue_hours: r.tue, wed_hours: r.wed,
        thu_hours: r.thu, fri_hours: r.fri, sat_hours: r.sat, sun_hours: r.sun,
      })),
    };
  }

  saveDraft() {
    this.saving.set(true);
    this.tsService.saveTimesheet(this.buildPayload()).subscribe({
      next: (ts: any) => { this.saving.set(false); this.timesheetStatus.set(ts.status || 'Draft'); this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Draft saved' }); },
      error: () => { this.saving.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' }); }
    });
  }

  confirmSubmit() {
    this.confirmationService.confirm({
      message: `Submit this timesheet to <strong>${this.approverName()}</strong> for approval?<br>You cannot edit it after submitting.`,
      header: 'Submit for Approval',
      icon: 'pi pi-send',
      acceptLabel: 'Yes, Submit',
      rejectLabel: 'Cancel',
      accept: () => this.doSubmit(),
    });
  }

  doSubmit() {
    this.submitting.set(true);
    this.tsService.saveTimesheet(this.buildPayload()).subscribe({
      next: () => {
        this.tsService.submitTimesheet({ timesheet_id: this.timesheetId }).subscribe({
          next: () => {
            this.submitting.set(false);
            // ✅ FIX: reload from server so entries + status are all fresh
            this.loadTimesheet();
            this.messageService.add({
              severity: 'success', summary: 'Submitted!',
              detail: `Sent to ${this.approverName()} for approval`, life: 5000,
            });
          },
          error: () => this.submitting.set(false),
        });
      }
    });
  }

  copyPrevWeek() {
    const prev = new Date(this.currentWeekStart); prev.setDate(prev.getDate() - 7);
    // Local Y/M/D, not toISOString() — currentWeekStart is local midnight, and
    // toISOString() would roll it back a day in IST, making the backend snap to the
    // wrong Monday (a week earlier than intended).
    const prevIso = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    this.tsService.getWeekTimesheet(prevIso).subscribe({
      next: (ts: any) => {
        if (ts.entries?.length > 0) {
          this.rows.set(ts.entries.map((e: any) => ({ ...this.emptyRow(), project_id: e.project_id, project_name: e.project_name, project_code: e.project_code, project_type: e.project_type })));
          this.messageService.add({ severity: 'info', summary: 'Copied', detail: 'Projects copied — enter your hours' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'No data', detail: 'No entries in previous week' });
        }
      }
    });
  }
}