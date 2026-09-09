import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TimesheetService } from '../service/timsheet.service';

interface TimesheetSummary {
  id: number;
  week_start_date: string;
  week_end_date: string;
  week_label: string;
  status: string;
  total_hours: number;
  scheduled_hours: number;
  submitted_at: string | null;
  approved_at: string | null;
  remarks: string | null;
  entries: any[];
}

@Component({
  selector: 'app-timesheet-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, TagModule, DialogModule,
    ToastModule, SelectModule, TooltipModule, SkeletonModule,
    TimelineModule, CardModule,
  ],
  providers: [MessageService],
  template: `
<p-card>
<p-toast position="top-right" />

<div class="hist-page">

  <!-- Header -->
  <div class="hist-header">
    <div>
      <h2 class="hist-title">My Billable Effort History</h2>
      <span class="hist-sub">View and track all your submitted billable efforts</span>
    </div>
    <div class="hist-controls">
      <p-select [options]="yearOptions" [(ngModel)]="selectedYear"
        (ngModelChange)="reload()" placeholder="Year" />
      <p-select [options]="monthOptions" [(ngModel)]="selectedMonth"
        optionLabel="label" optionValue="value"
        (ngModelChange)="reload()" placeholder="All months" [showClear]="true" />
      <p-select [options]="statusOptions" [(ngModel)]="selectedStatus"
        optionLabel="label" optionValue="value"
        (ngModelChange)="reload()" placeholder="All statuses" [showClear]="true" />
    </div>
  </div>

  <!-- Summary strip -->
  <div class="summary-strip">
    <div class="sstrip-item">
      <span class="ss-val">{{ history().length }}</span>
      <span class="ss-lbl">Weeks Logged</span>
    </div>
    <div class="sstrip-item highlight">
      <span class="ss-val">{{ totalBillableHours() }}</span>
      <span class="ss-lbl">Total Hours This Year</span>
    </div>
    <div class="sstrip-item">
      <span class="ss-val green">{{ countByStatus('Approved') }}</span>
      <span class="ss-lbl">Approved</span>
    </div>
    <div class="sstrip-item">
      <span class="ss-val blue">{{ countByStatus('Submitted') }}</span>
      <span class="ss-lbl">Pending</span>
    </div>
    <div class="sstrip-item">
      <span class="ss-val gray">{{ countByStatus('Draft') }}</span>
      <span class="ss-lbl">Draft</span>
    </div>
    <div class="sstrip-item">
      <span class="ss-val red">{{ countByStatus('Rejected') }}</span>
      <span class="ss-lbl">Rejected</span>
    </div>
  </div>

  <!-- History table -->
  <div class="hist-table-card">
    <p-table
      [value]="history()"
      [loading]="loading()"
      styleClass="p-datatable-sm hist-table"
      [paginator]="true"
      [rows]="pageSize"
      [totalRecords]="totalRecords()"
      [lazy]="true"
      (onLazyLoad)="onPageChange($event)"
      sortField="week_start_date"
      [sortOrder]="-1"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="text-align:center">Week Period</th>
          <th style="width:110px; text-align:center">Status</th>
          <th style="width:100px; text-align:center">Hours</th>
          <th style="width:130px; text-align:center">Utilization</th>
          <th style="width:150px">Submitted On</th>
          <th style="width:150px">Approved On</th>
          <th style="width:90px; text-align:center">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-ts>
        <tr [class.rejected-row]="ts.status === 'Rejected'"
            [class.draft-row]="ts.status === 'Draft'">
          <td>
            <div class="week-cell" style="min-width:50px; text-align:center">
              <span class="week-label">{{ ts.week_label }}</span>
              
            </div>
          </td>
          <td style="text-align:center">
            <p-tag [value]="ts.status" [severity]="statusSeverity(ts.status)" />
          </td>
          <td style="text-align:center">
            <span class="hours-badge" [class.low]="ts.total_hours < 30">
              {{ ts.total_hours }}
            </span>
            <span class="hours-sched">/ {{ ts.scheduled_hours }}</span>
          </td>
          <td style="text-align:center">
            <div class="util-cell">
              <div class="util-bar">
                <div class="util-fill"
                  [style.width]="utilPct(ts) + '%'"
                  [class.low]="utilPct(ts) < 60"
                  [class.over]="utilPct(ts) > 100">
                </div>
              </div>
              <span class="util-pct" [class.low]="utilPct(ts) < 60">{{ utilPct(ts) }}%</span>
            </div>
          </td>
          <td>
            @if (ts.submitted_at) {
              <span class="date-cell">{{ ts.submitted_at | date:'dd MMM, hh:mm a' }}</span>
            } @else {
              <span class="dim">—</span>
            }
          </td>
          <td>
            @if (ts.approved_at) {
              <span class="date-cell green">{{ ts.approved_at | date:'dd MMM, hh:mm a' }}</span>
            } @else if (ts.status === 'Rejected') {
              <span class="dim red">Rejected</span>
            } @else {
              <span class="dim">Pending</span>
            }
          </td>
          <td style="text-align:center">
            <button pButton icon="pi pi-eye"
              class="p-button-text p-button-rounded p-button-sm view-btn"
              pTooltip="View Details" tooltipPosition="top"
              (click)="viewTimesheet(ts)">
            </button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr><td colspan="7">
          <div class="empty-state">
            <i class="pi pi-calendar-times"></i>
            <p>No timesheets found for the selected filters</p>
          </div>
        </td></tr>
      </ng-template>
    </p-table>
  </div>

</div>
</p-card>
    


<!-- ════════════════════ View Detail Dialog ════════════════════ -->
<p-dialog
  [header]="'Timesheet — ' + (selectedTs?.week_label || '')"
  [(visible)]="viewVisible"
  [modal]="true"
  [style]="{ width: '860px', maxWidth: '95vw' }"
  [draggable]="false"
  styleClass="ts-view-dialog"
>
  @if (selectedTs) {
    <div class="view-dialog-body">

      <!-- Meta row -->
      <div class="view-meta-row">
        <div class="vm-item">
          <span class="vm-lbl">Week</span>
          <span class="vm-val">{{ selectedTs.week_start_date | date:'MMM dd' }} – {{ selectedTs.week_end_date | date:'MMM dd, yyyy' }}</span>
        </div>
        <div class="vm-item">
          <span class="vm-lbl">Status</span>
          <p-tag [value]="selectedTs.status" [severity]="statusSeverity(selectedTs.status)" />
        </div>
        <div class="vm-item">
          <span class="vm-lbl">Total Hours</span>
          <span class="vm-val bold">{{ selectedTs.total_hours }} / {{ selectedTs.scheduled_hours }}</span>
        </div>
        <div class="vm-item">
          <span class="vm-lbl">Utilization</span>
          <span class="vm-val bold" [class.low]="utilPct(selectedTs) < 60">{{ utilPct(selectedTs) }}%</span>
        </div>
        @if (selectedTs.submitted_at) {
          <div class="vm-item">
            <span class="vm-lbl">Submitted</span>
            <span class="vm-val">{{ selectedTs.submitted_at | date:'dd MMM yyyy, hh:mm a' }}</span>
          </div>
        }
        @if (selectedTs.approved_at) {
          <div class="vm-item">
            <span class="vm-lbl">Approved</span>
            <span class="vm-val green">{{ selectedTs.approved_at | date:'dd MMM yyyy, hh:mm a' }}</span>
          </div>
        }
      </div>

      @if (selectedTs.remarks) {
        <div class="remarks-box">
          <i class="pi pi-comment"></i>
          <span><strong>Remarks:</strong> {{ selectedTs.remarks }}</span>
        </div>
      }

      <!-- Entries table -->
      <div class="entries-section">
        <h4 class="entries-title">Project-wise Breakdown</h4>
        <table class="entries-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Type</th>
              <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of selectedTs.entries; track entry.project_name) {
              <tr>
                <td class="entry-proj">{{ entry.project_name }}</td>
                <td>
                  <span class="type-pill type-{{ entry.project_type?.toLowerCase() }}">
                    {{ entry.project_type }}
                  </span>
                </td>
                @for (day of dayKeys; track day) {
                  <td class="day-cell" [class.has-val]="entry[day + '_hours'] > 0">
                    {{ entry[day + '_hours'] || '—' }}
                  </td>
                }
                <td class="total-cell">{{ entry.total_hours }}</td>
              </tr>
            }
            <!-- Daily totals row -->
            <tr class="totals-footer">
              <td colspan="2"><strong>Daily Total</strong></td>
              @for (day of dayKeys; track day) {
                <td class="day-cell">
                  <strong>{{ getDayTotal(selectedTs, day) || '' }}</strong>
                </td>
              }
              <td class="total-cell"><strong>{{ selectedTs.total_hours }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Approval flow timeline -->
      <div class="approval-timeline">
        <h4 class="entries-title">Approval Flow</h4>
        <p-timeline [value]="buildTimeline(selectedTs)" layout="horizontal" styleClass="ts-timeline">
          <ng-template pTemplate="content" let-event>
            <div class="tl-item" [class.tl-done]="event.done" [class.tl-active]="event.active">
              <div class="tl-icon"><i class="pi" [class]="event.icon"></i></div>
              <div class="tl-label">{{ event.label }}</div>
              <div class="tl-date">{{ event.date }}</div>
            </div>
          </ng-template>
        </p-timeline>
      </div>

    </div>
  }

  <ng-template pTemplate="footer">
    <button pButton label="Close" icon="pi pi-times"
      class="p-button-text" (click)="viewVisible = false"></button>
    @if (selectedTs?.status === 'Draft') {
      <button pButton label="Continue Editing" icon="pi pi-pencil"
        class="p-button-outlined" (click)="goToEdit(selectedTs)"></button>
    }
  </ng-template>
</p-dialog>
  `,
  styles: [`
    .hist-page { padding: 1.5rem 2rem; max-width: 1300px; margin: 0 auto; font-size: 1rem; }

    .hist-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
    }
    .hist-title { font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem; }
    .hist-sub { font-size: 0.95rem; color: #6B7280; }
    .hist-controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

    /* Summary strip */
    .summary-strip {
      display: flex; background: white; border: 1px solid #E5E7EB; border-radius: 14px;
      margin-bottom: 1.25rem; overflow: hidden;
    }
    .sstrip-item {
      flex: 1; text-align: center; padding: 1.25rem;
      border-right: 1px solid #F3F4F6;
    }
    .sstrip-item:last-child { border-right: none; }
    .sstrip-item.highlight { background: #F0F9FF; }
    .ss-val { display: block; font-size: 1.8rem; font-weight: 800; color: #111827; line-height: 1.2; }
    .ss-val.green { color: #16A34A; }
    .ss-val.blue { color: #2563EB; }
    .ss-val.gray { color: #6B7280; }
    .ss-val.red { color: #DC2626; }
    .ss-lbl { font-size: 0.8rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Table */
    .hist-table-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }

    .week-cell { display: flex; flex-direction: column; gap: 2px; }
    .week-label { font-weight: 600; color: #111827; font-size: 1rem; }
    .week-dates { font-size: 0.85rem; color: #6B7280; }

    .hours-badge { font-weight: 700; font-size: 1rem; }
    .hours-badge.low { color: #DC2626; }
    .hours-sched { font-size: 0.75rem; color: #9CA3AF; }

    .util-cell { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
    .util-bar { width: 80px; height: 8px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
    .util-fill { height: 100%; background: #4F46E5; border-radius: 3px; }
    .util-fill.low { background: #EF4444; }
    .util-fill.over { background: #F59E0B; }
    .util-pct { font-size: 0.78rem; font-weight: 600; color: #374151; }
    .util-pct.low { color: #DC2626; }

    .date-cell { font-size: 0.8rem; color: #374151; }
    .date-cell.green { color: #16A34A; font-weight: 600; }
    .dim { color: #D1D5DB; font-size: 0.8rem; }
    .dim.red { color: #FCA5A5; }
    .view-btn { color: #4F46E5 !important; }
    .rejected-row { background: #FFF5F5 !important; }
    .draft-row { background: #FAFAFA !important; }
    .empty-state { text-align: center; padding: 3rem; color: #6B7280; font-size: 0.9rem; }
    .empty-state i { font-size: 2.5rem; color: #D1D5DB; display: block; margin-bottom: 0.75rem; }

    /* View dialog */
    .view-dialog-body { display: flex; flex-direction: column; gap: 1.25rem; }
    .view-meta-row {
      display: flex; gap: 1.5rem; flex-wrap: wrap;
      background: #F8FAFC; border-radius: 8px; padding: 1.25rem 1.5rem;
      border: 1px solid #E5E7EB;
    }
    .vm-item { display: flex; flex-direction: column; gap: 3px; }
    .vm-lbl { font-size: 0.7rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .vm-val { font-size: 1rem; font-weight: 500; color: #111827; }
    .vm-val.bold { font-weight: 700; font-size: 1.1rem; }
    .vm-val.green { color: #16A34A; }
    .vm-val.low { color: #DC2626; }

    .remarks-box {
      display: flex; align-items: flex-start; gap: 0.5rem;
      background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;
      padding: 0.75rem 1rem; font-size: 0.85rem; color: #991B1B;
    }

    .entries-section { }
    .entries-title { font-size: 0.85rem; font-weight: 700; color: #374151; margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }

    .entries-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .entries-table thead th {
      background: #F8FAFC; padding: 0.7rem 0.625rem;
      text-align: center; font-weight: 600; color: #374151;
      border-bottom: 2px solid #E5E7EB; white-space: nowrap;
    }
    .entries-table thead th:first-child { text-align: left; }
    .entries-table tbody td { padding: 0.65rem 0.625rem; border-bottom: 1px solid #F3F4F6; text-align: center; }
    .entries-table tbody td:first-child { text-align: left; }
    .entry-proj { font-weight: 600; color: #1E3A5F; }
    .day-cell { color: #6B7280; }
    .day-cell.has-val { color: #4338CA; font-weight: 700; }
    .total-cell { font-weight: 700; color: #111827; }
    .totals-footer td { background: #F8FAFC; border-top: 2px solid #E5E7EB; }

    .type-pill { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
    .type-billable { background: #DCFCE7; color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave { background: #FEF3C7; color: #92400E; }
    .type-pmo { background: #F3E8FF; color: #7E22CE; }

    /* Timeline */
    .approval-timeline { }
    .tl-item { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .tl-icon {
      width: 32px; height: 32px; border-radius: 50%;
      background: #E5E7EB; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; color: #9CA3AF;
    }
    .tl-item.tl-done .tl-icon { background: #DCFCE7; color: #16A34A; }
    .tl-item.tl-active .tl-icon { background: #DBEAFE; color: #2563EB; }
    .tl-label { font-size: 0.75rem; font-weight: 600; color: #374151; }
    .tl-date { font-size: 0.68rem; color: #9CA3AF; }

    ::ng-deep .hist-table .p-datatable-tbody > tr > td { padding: 0.85rem 1rem; }
    ::ng-deep .hist-table .p-datatable-thead > tr > th { background: #F8FAFC; padding: 1rem; font-size: 0.95rem; }
  `]
})
export class TimesheetHistoryComponent implements OnInit {
  loading = signal(false);
  history = signal<TimesheetSummary[]>([]);
  totalRecords = signal(0);
  pageSize = 10;
  currentPage = 1;
  viewVisible = false;
  selectedTs: TimesheetSummary | null = null;

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = null;
  selectedStatus: string | null = null;

  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  yearOptions = Array.from({ length: 4 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: y.toString(), value: y };
  });

  monthOptions = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    .map((m, i) => ({ label: m, value: i + 1 }));

  statusOptions = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  constructor(private tsService: TimesheetService) {}

  ngOnInit() { this.loadHistory(); }

  reload() { this.currentPage = 1; this.loadHistory(); }

  onPageChange(event: any) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.tsService.getMyHistory(
      this.currentPage, this.pageSize,
      this.selectedYear || undefined,
      this.selectedMonth || undefined
    ).subscribe({
      next: (data) => {
        let items = data.items as TimesheetSummary[];
        if (this.selectedStatus) {
          items = items.filter(ts => ts.status === this.selectedStatus);
        }
        this.history.set(items);
        this.totalRecords.set(data.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  countByStatus(status: string) { return this.history().filter(ts => ts.status === status).length; }
  totalBillableHours() { return this.history().reduce((s, ts) => s + ts.total_hours, 0); }
  utilPct(ts: TimesheetSummary) { return Math.min(Math.round((ts.total_hours / ts.scheduled_hours) * 100), 999); }

  statusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (s === 'Approved') return 'success';
    if (s === 'Submitted') return 'info';
    if (s === 'Rejected') return 'danger';
    if (s === 'Draft') return 'secondary';
    return 'secondary';
  }

  viewTimesheet(ts: TimesheetSummary) {
    this.selectedTs = ts;
    this.viewVisible = true;
  }

  getDayTotal(ts: TimesheetSummary, day: string): number {
    return ts.entries.reduce((s, e) => s + (e[day + '_hours'] || 0), 0);
  }

  buildTimeline(ts: TimesheetSummary) {
    return [
      {
        label: 'Created', icon: 'pi-file',
        date: '', done: true, active: false,
      },
      {
        label: 'Submitted', icon: 'pi-send',
        date: ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
        done: !!ts.submitted_at,
        active: ts.status === 'Submitted',
      },
      {
        label: ts.status === 'Rejected' ? 'Rejected' : 'Approved',
        icon: ts.status === 'Rejected' ? 'pi-times-circle' : 'pi-check-circle',
        date: ts.approved_at ? new Date(ts.approved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
        done: ts.status === 'Approved',
        active: ts.status === 'Rejected',
      },
    ];
  }

  goToEdit(ts: TimesheetSummary | null) {
    if (!ts) return;
    this.viewVisible = false;
    // Navigate to timesheet with week param
    window.location.href = `/timesheet?week_start=${ts.week_start_date}`;
  }
}