import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsModule }       from 'primeng/tabs';
import { ButtonModule }     from 'primeng/button';
import { TableModule }      from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule }   from 'primeng/skeleton';
import { ToastModule }      from 'primeng/toast';
import { SelectModule }     from 'primeng/select';
import { InputTextModule }  from 'primeng/inputtext';
import { MessageService }   from 'primeng/api';
import { Card }             from 'primeng/card';

import { HistoricalReportsService } from '../service/historicalreports.service';

// Historical Reports -- a deliberately separate screen (Option B) from the
// live Utilization Report. It reads ONLY from /historical/*, which is
// backed by its own tables (HistoricalWeeklyEntry) and never mixed with
// live WeeklyTimesheet data on the backend. Keeping the UI separate too
// means there's never a page where historical and live rows sit in the
// same table looking indistinguishable -- the amber "Pre-Launch / Read
// Only" banner and distinct color scheme below are there for the same
// reason: this is provably, visibly a different dataset.
@Component({
  selector: 'app-historical-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    TabsModule, ButtonModule, TableModule,
    DatePickerModule, SkeletonModule, ToastModule,
    SelectModule, InputTextModule, Card,
  ],
  providers: [MessageService, HistoricalReportsService],
  styles: [`
    .hrpt-page { padding: 1.5rem 2rem; max-width: 1800px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0 0 .15rem; letter-spacing: -.02em; }
    .page-sub { font-size: .875rem; color: #64748B; }

    .prelaunch-banner {
      display: flex; align-items: center; gap: .6rem;
      background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;
      padding: .7rem 1rem; border-radius: 10px; font-size: .82rem; font-weight: 600;
      margin: 1rem 0 1.5rem;
    }
    .prelaunch-banner i { font-size: 1rem; }

    .tab-content { padding: 1.5rem 0 0; }

    .controls-row {
      display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap;
      margin-bottom: 1.5rem; background: white;
      border: 1px solid #FDE68A; border-radius: 12px; padding: 1.125rem 1.25rem;
      box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .ctrl-group { display: flex; flex-direction: column; gap: .25rem; }
    .ctrl-label { font-size: .72rem; font-weight: 600; color: #92400E; text-transform: uppercase; letter-spacing: .05em; }
    .ctrl-spacer { flex: 1; }
    .export-btn {
      background: white !important; color: #92400E !important;
      border: 1.5px solid #D97706 !important; border-radius: 8px !important;
      font-weight: 600 !important; font-size: .83rem !important;
    }
    .export-btn:hover { background: #FFFBEB !important; }
    .gen-btn {
      background: #D97706 !important; border-color: #D97706 !important;
      border-radius: 8px !important; font-weight: 600 !important; font-size: .83rem !important;
    }
    .gen-btn:hover { background: #B45309 !important; }

    .summary-strip { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .sum-card {
      flex: 1; min-width: 150px; background: white;
      border: 1px solid #FDE68A; border-radius: 12px;
      padding: .875rem 1.125rem; display: flex; align-items: center; gap: .75rem;
      box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .sum-icon { width:36px; height:36px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.95rem; background:#FEF3C7; color:#92400E; }
    .sum-val { font-size: 1.35rem; font-weight: 800; color: #0F172A; line-height: 1.1; }
    .sum-lbl { font-size: .72rem; color: #64748B; font-weight: 600; }

    .section-card { background: white; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem; }
    .section-header { padding: 1rem 1.25rem; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
    .section-title { font-weight: 700; font-size: .9rem; color: #0F172A; }
    .section-sub { font-size: .78rem; color: #64748B; }

    .proj-breakdown { display: flex; flex-direction: column; gap: .6rem; }
    .pb-row { display: flex; align-items: center; gap: .75rem; }
    .pb-name { width: 220px; font-size: .8rem; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pb-bar-wrap { flex: 1; background: #F1F5F9; border-radius: 6px; height: 10px; overflow: hidden; }
    .pb-bar { height: 100%; background: linear-gradient(90deg, #D97706, #F59E0B); border-radius: 6px; }
    .pb-val { width: 64px; text-align: right; font-size: .78rem; font-weight: 600; color: #0F172A; }
    .pb-pct { width: 52px; text-align: right; font-size: .75rem; color: #64748B; }

    .empty-state { padding: 3rem 1rem; text-align: center; color: #94A3B8; }
    .empty-state i { font-size: 2rem; margin-bottom: .5rem; display: block; }
  `],
  template: `
  <p-card>
    <div class="hrpt-page">
      <div class="page-title">Historical Reports</div>
      <div class="page-sub">Pre-launch utilization data, imported from the historical Excel report</div>

      <div class="prelaunch-banner">
        <i class="pi pi-history"></i>
        <span>Read-only pre-launch data &mdash; approved-only, separate from live timesheets. No utilization or filing-compliance tracking applies to this data.</span>
      </div>

      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0">Weekly</p-tab>
          <p-tab value="1">Monthly</p-tab>
          <p-tab value="2">Yearly</p-tab>
          <p-tab value="3">Custom Range</p-tab>
        </p-tablist>
        <p-tabpanels>

          <!-- ── Weekly ── -->
          <p-tabpanel value="0">
            <div class="tab-content">
              <div class="controls-row">
                <div class="ctrl-group">
                  <label class="ctrl-label">Week Starting (Monday)</label>
                  <p-datepicker [(ngModel)]="weekStart" dateFormat="dd M yy" [showIcon]="true" />
                </div>
                <div class="ctrl-spacer"></div>
                <p-button label="Generate" icon="pi pi-search" styleClass="gen-btn" (onClick)="loadWeekly()" [loading]="loading()" />
                <p-button label="Export" icon="pi pi-download" [outlined]="true" styleClass="export-btn" (onClick)="exportWeekly()" [loading]="exporting()" [disabled]="!weeklyData()" />
              </div>
              @if (loading()) { <p-skeleton height="200px" /> }
              @if (!loading() && weeklyData()) {
                @if (weeklyData()!.has_data) {
                  <ng-container *ngTemplateOutlet="reportBody; context: { $implicit: weeklyData() }"></ng-container>
                } @else {
                  <div class="empty-state"><i class="pi pi-inbox"></i>No historical data for this week.</div>
                }
              }
            </div>
          </p-tabpanel>

          <!-- ── Monthly ── -->
          <p-tabpanel value="1">
            <div class="tab-content">
              <div class="controls-row">
                <div class="ctrl-group">
                  <label class="ctrl-label">Year</label>
                  <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" />
                </div>
                <div class="ctrl-group">
                  <label class="ctrl-label">Month</label>
                  <p-select [options]="monthOptions" [(ngModel)]="selectedMonth" optionLabel="label" optionValue="value" />
                </div>
                <div class="ctrl-spacer"></div>
                <p-button label="Generate" icon="pi pi-search" styleClass="gen-btn" (onClick)="loadMonthly()" [loading]="loading()" />
                <p-button label="Export" icon="pi pi-download" [outlined]="true" styleClass="export-btn" (onClick)="exportMonthly()" [loading]="exporting()" [disabled]="!monthlyData()" />
              </div>
              @if (loading()) { <p-skeleton height="200px" /> }
              @if (!loading() && monthlyData()) {
                @if (monthlyData()!.has_data) {
                  <ng-container *ngTemplateOutlet="reportBody; context: { $implicit: monthlyData() }"></ng-container>
                } @else {
                  <div class="empty-state"><i class="pi pi-inbox"></i>No historical data for this month.</div>
                }
              }
            </div>
          </p-tabpanel>

          <!-- ── Yearly ── -->
          <p-tabpanel value="2">
            <div class="tab-content">
              <div class="controls-row">
                <div class="ctrl-group">
                  <label class="ctrl-label">Year</label>
                  <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" />
                </div>
                <div class="ctrl-spacer"></div>
                <p-button label="Generate" icon="pi pi-search" styleClass="gen-btn" (onClick)="loadYearly()" [loading]="loading()" />
                <p-button label="Export" icon="pi pi-download" [outlined]="true" styleClass="export-btn" (onClick)="exportYearly()" [loading]="exporting()" [disabled]="!yearlyData()" />
              </div>
              @if (loading()) { <p-skeleton height="200px" /> }
              @if (!loading() && yearlyData()) {
                @if (yearlyData()!.has_data) {
                  <ng-container *ngTemplateOutlet="reportBody; context: { $implicit: yearlyData() }"></ng-container>
                } @else {
                  <div class="empty-state"><i class="pi pi-inbox"></i>No historical data for this year.</div>
                }
              }
            </div>
          </p-tabpanel>

          <!-- ── Custom Range ── -->
          <p-tabpanel value="3">
            <div class="tab-content">
              <div class="controls-row">
                <div class="ctrl-group">
                  <label class="ctrl-label">From</label>
                  <p-datepicker [(ngModel)]="customFrom" dateFormat="dd M yy" [showIcon]="true" />
                </div>
                <div class="ctrl-group">
                  <label class="ctrl-label">To</label>
                  <p-datepicker [(ngModel)]="customTo" dateFormat="dd M yy" [showIcon]="true" />
                </div>
                <div class="ctrl-spacer"></div>
                <p-button label="Generate" icon="pi pi-search" styleClass="gen-btn" (onClick)="loadCustom()" [loading]="loading()" />
                <p-button label="Export" icon="pi pi-download" [outlined]="true" styleClass="export-btn" (onClick)="exportCustom()" [loading]="exporting()" [disabled]="!customData()" />
              </div>
              @if (loading()) { <p-skeleton height="200px" /> }
              @if (!loading() && customData()) {
                @if (customData()!.has_data) {
                  <ng-container *ngTemplateOutlet="reportBody; context: { $implicit: customData() }"></ng-container>
                } @else {
                  <div class="empty-state"><i class="pi pi-inbox"></i>No historical data for this range.</div>
                }
              }
            </div>
          </p-tabpanel>

        </p-tabpanels>
      </p-tabs>

      <!-- ── Shared report body template ── -->
      <ng-template #reportBody let-d>
        <div class="summary-strip">
          <div class="sum-card">
            <div class="sum-icon"><i class="pi pi-clock"></i></div>
            <div><div class="sum-val">{{ d.total_hours | number:'1.0-1' }}</div><div class="sum-lbl">Total Hours</div></div>
          </div>
          <div class="sum-card">
            <div class="sum-icon"><i class="pi pi-users"></i></div>
            <div><div class="sum-val">{{ d.resources.length }}</div><div class="sum-lbl">Resources</div></div>
          </div>
          <div class="sum-card">
            <div class="sum-icon"><i class="pi pi-briefcase"></i></div>
            <div><div class="sum-val">{{ d.project_summary.length }}</div><div class="sum-lbl">Projects</div></div>
          </div>
          <div class="sum-card">
            <div class="sum-icon"><i class="pi pi-calendar"></i></div>
            <div><div class="sum-val" style="font-size:1rem;">{{ d.period_label }}</div><div class="sum-lbl">Period</div></div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <span class="section-title">Resource wise</span>
            <span class="section-sub">{{ d.resources.length }} resources</span>
          </div>
          <p-table [value]="d.resources" [paginator]="true" [rows]="15" [rowsPerPageOptions]="[15,25,50]"
                   [globalFilterFields]="['user_name','yash_id','b_unit','irm']" #dt>
            <ng-template pTemplate="caption">
              <div style="display:flex; justify-content:flex-end;">
                <input pInputText type="text" placeholder="Search resources..." (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
              </div>
            </ng-template>
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="yash_id">Yash Id <p-sortIcon field="yash_id" /></th>
                <th pSortableColumn="user_name">Name <p-sortIcon field="user_name" /></th>
                <th pSortableColumn="b_unit">B Unit <p-sortIcon field="b_unit" /></th>
                <th pSortableColumn="irm">IRM <p-sortIcon field="irm" /></th>
                <th pSortableColumn="total_hours" style="text-align:right;">Total Hours <p-sortIcon field="total_hours" /></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-r>
              <tr>
                <td>{{ r.yash_id }}</td>
                <td>{{ r.user_name }}</td>
                <td>{{ r.b_unit }}</td>
                <td>{{ r.irm }}</td>
                <td style="text-align:right; font-weight:600;">{{ r.total_hours | number:'1.0-1' }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div class="section-card">
          <div class="section-header">
            <span class="section-title">Project Breakdown &mdash; Top 15</span>
            <span class="section-sub">{{ d.project_summary.length }} active projects</span>
          </div>
          <div style="padding:1rem 1.25rem;">
            <div class="proj-breakdown">
              @for (p of d.project_summary.slice(0,15); track p.project) {
                <div class="pb-row">
                  <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                  <div class="pb-bar-wrap">
                    <div class="pb-bar" [style.width]="(d.total_hours ? (p.total_hours/d.total_hours*100) : 0)+'%'"></div>
                  </div>
                  <span class="pb-val">{{ p.total_hours }}h</span>
                  <span class="pb-pct">{{ d.total_hours ? (+(p.total_hours/d.total_hours*100).toFixed(1)) : 0 }}%</span>
                </div>
              }
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  </p-card>
    
  `,
})
export class HistoricalReportsComponent implements OnInit {
  loading   = signal(false);
  exporting = signal(false);

  weekStart: Date = this.mondayOf(new Date());
  customFrom: Date = this.mondayOf(new Date());
  customTo: Date = new Date();

  selectedYear  = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: y };
  });
  monthOptions = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
    { label: 'April', value: 4 },   { label: 'May', value: 5 },      { label: 'June', value: 6 },
    { label: 'July', value: 7 },    { label: 'August', value: 8 },   { label: 'September', value: 9 },
    { label: 'October', value: 10 },{ label: 'November', value: 11 },{ label: 'December', value: 12 },
  ];

  weeklyData  = signal<any>(null);
  monthlyData = signal<any>(null);
  yearlyData  = signal<any>(null);
  customData  = signal<any>(null);

  constructor(
    private historicalService: HistoricalReportsService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadWeekly();
  }

  private mondayOf(d: Date): Date {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    return m;
  }

  // Local Y/M/D formatting, not toISOString() -- avoids the timezone-shift
  // bug toISOString() has in IST and similar zones (see reports.component.ts).
  private toIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ── Weekly ──────────────────────────────────────────────────────────────
  loadWeekly() {
    this.loading.set(true);
    this.historicalService.getWeekly(this.toIso(this.weekStart)).subscribe({
      next:  (data) => { this.weeklyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load weekly historical report'); },
    });
  }

  exportWeekly() {
    this.exporting.set(true);
    this.historicalService.exportWeekly(this.toIso(this.weekStart)).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Historical_Weekly_${this.toIso(this.weekStart)}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Monthly ─────────────────────────────────────────────────────────────
  loadMonthly() {
    this.loading.set(true);
    this.historicalService.getMonthly(this.selectedYear, this.selectedMonth).subscribe({
      next:  (data) => { this.monthlyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load monthly historical report'); },
    });
  }

  exportMonthly() {
    this.exporting.set(true);
    this.historicalService.exportMonthly(this.selectedYear, this.selectedMonth).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Historical_Monthly_${this.selectedYear}_${this.selectedMonth}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Yearly ──────────────────────────────────────────────────────────────
  loadYearly() {
    this.loading.set(true);
    this.historicalService.getYearly(this.selectedYear).subscribe({
      next:  (data) => { this.yearlyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load yearly historical report'); },
    });
  }

  exportYearly() {
    this.exporting.set(true);
    this.historicalService.exportYearly(this.selectedYear).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Historical_Yearly_${this.selectedYear}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Custom Range ────────────────────────────────────────────────────────
  loadCustom() {
    this.loading.set(true);
    this.historicalService.getCustom(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (data) => { this.customData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load custom historical report'); },
    });
  }

  exportCustom() {
    this.exporting.set(true);
    this.historicalService.exportCustom(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Historical_Custom_${this.toIso(this.customFrom)}_to_${this.toIso(this.customTo)}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  toast(severity: string, detail: string) {
    this.messageService.add({ severity, summary: severity === 'error' ? 'Error' : 'Notice', detail, life: 4000 });
  }
}
