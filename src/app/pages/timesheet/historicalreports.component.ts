import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsModule }       from 'primeng/tabs';
import { ButtonModule }     from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule }   from 'primeng/skeleton';
import { ToastModule }      from 'primeng/toast';
import { SelectModule }     from 'primeng/select';
import { InputTextModule }  from 'primeng/inputtext';
import { DialogModule }     from 'primeng/dialog';
import { TooltipModule }    from 'primeng/tooltip';
import { MessageService }   from 'primeng/api';
import { Card }             from 'primeng/card';

import { HistoricalReportsService } from '../service/historicalreports.service';

// Historical Reports -- a deliberately separate screen (Option B) from the
// live Utilization Report. It reads ONLY from /historical/*, which is
// backed by its own tables (HistoricalWeeklyEntry) and never mixed with
// live WeeklyTimesheet data on the backend.
//
// Layout mirrors reports.component.ts (Utilization Report) exactly: icon
// period tabs, neutral controls bar with inline resource/manager search,
// colour-striped summary cards, section sub-tabs and navy Excel-style
// tables. The only visual differences are intentional provenance cues:
// the "Pre-launch / Read-only" banner, and no Util % / Status / Non Filling
// (historical data is approved-only with no filing-compliance tracking).
// Customer wise and IRM Wise are derived client-side from the per-resource
// project hours (+ by_label week/month buckets) the /historical API returns.

interface CustRow   { project: string; cols: number[]; total: number; }
interface CustGroup { manager: string; projects: CustRow[]; colTotals: number[]; total: number; }
interface IrmRow    { irm: string; resources: number; cols: number[]; total: number; }

@Component({
  selector: 'app-historical-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    TabsModule, ButtonModule, DatePickerModule, SkeletonModule, ToastModule,
    SelectModule, InputTextModule, Card, DialogModule, TooltipModule,
  ],
  providers: [MessageService, HistoricalReportsService],
  styles: [`
    /* ─── Shell (same as Utilization Report) ─── */
    .rpt-page { padding: 1.5rem 2rem; max-width: 1800px; margin: 0 auto; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
    .page-title { font-size: var(--fs-page-title); font-weight: 800; color: #0F172A; margin: 0 0 .15rem; letter-spacing: -.02em; }
    .page-sub { font-size: var(--fs-page-sub); color: #64748B; margin:0; }
    .tab-content { padding: 1.5rem 0 0; }
    .tab-icon { margin-right:.3rem; }

    /* Read-only provenance chip + banner (kept subtle so the layout matches the live report) */
    .ro-chip { display:inline-flex; align-items:center; gap:.35rem; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; padding:.3rem .75rem; border-radius:20px; font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
    .prelaunch-banner {
      display:flex; align-items:center; gap:.6rem;
      background:#FFFBEB; color:#92400E; border:1px solid #FDE68A;
      padding:.6rem 1rem; border-radius:10px; font-size:.8rem; font-weight:500;
      margin: 0 0 1.25rem;
    }
    .prelaunch-banner i { font-size:.95rem; }

    /* ─── Sub-tabs ─── */
    .sub-tabs .p-tablist-tab-list { gap: .25rem; border-bottom-color:#E2E8F0; }
    .sub-tabs .p-tab { font-size: .78rem; font-weight: 600; color:#64748B; padding: .55rem 1rem; border-radius: 8px 8px 0 0; }
    .sub-tabs .p-tab-active { color:#1E3A5F; }
    .sub-tabs .p-tabpanels { padding: 1.25rem 0 0; background: transparent; }

    /* ─── Controls bar ─── */
    .controls-row {
      display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap;
      margin-bottom: 1.5rem; background: white;
      border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.125rem 1.25rem;
      box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .ctrl-group { display: flex; flex-direction: column; gap: .25rem; }
    .ctrl-label { font-size: .72rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em; }
    .ctrl-spacer { flex: 1; }
    .export-btn {
      background: white !important; color: #1E3A5F !important;
      border: 1.5px solid #1E3A5F !important; border-radius: 8px !important;
      font-weight: 600 !important; font-size: .83rem !important; transition: all .15s !important;
    }
    .export-btn:hover { background: #EFF6FF !important; }
    .gen-btn {
      background: #1E3A5F !important; border-color: #1E3A5F !important;
      border-radius: 8px !important; font-weight: 600 !important; font-size: .83rem !important;
    }
    .gen-btn:hover { background: #162D4D !important; }

    .search-input-wrap { display:flex; align-items:center; background:white; border:1px solid #E2E8F0; border-radius:8px; padding:0 .75rem; gap:.4rem; transition:border-color .15s; }
    .search-input-wrap:focus-within { border-color:#1E3A5F; }
    .search-input-wrap i { color:#94A3B8; font-size:.85rem; }
    .s-input { border:none; outline:none; font-size:.82rem; padding:.42rem 0; min-width:180px; background:transparent; color:#0F172A; }

    /* ─── Summary cards ─── */
    .summary-strip { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .sum-card {
      flex: 1; min-width: 130px; background: white;
      border: 1px solid #E2E8F0; border-radius: 12px;
      padding: .875rem 1.125rem; display: flex; align-items: center; gap: .75rem;
      position: relative; overflow: hidden; transition: box-shadow .2s;
      box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .sum-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }
    .sum-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:12px 12px 0 0; }
    .sum-blue::before   { background: #1E3A5F; }
    .sum-green::before  { background: #16A34A; }
    .sum-purple::before { background: #7C3AED; }
    .sum-orange::before { background: #D97706; }
    .sum-red::before    { background: #DC2626; }
    .sum-icon { width:36px; height:36px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.95rem; }
    .sum-blue   .sum-icon { background:#EEF2FF; color:#4F46E5; }
    .sum-green  .sum-icon { background:#F0FDF4; color:#16A34A; }
    .sum-purple .sum-icon { background:#FAF5FF; color:#7C3AED; }
    .sum-orange .sum-icon { background:#FFFBEB; color:#D97706; }
    .sum-red    .sum-icon { background:#FEF2F2; color:#DC2626; }
    .sum-val { font-size:1.4rem; font-weight:800; color:#0F172A; line-height:1; margin-bottom:2px; }
    .sum-lbl { font-size:.68rem; color:#64748B; text-transform:uppercase; letter-spacing:.05em; }
    .sum-sub { font-size:.7rem; color:#94A3B8; margin-top:1px; }

    /* ─── Section card ─── */
    .section-card {
      background: white; border: 1px solid #E2E8F0; border-radius: 14px;
      overflow: hidden; margin-bottom: 1.5rem;
      box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .section-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:1rem 1.25rem; border-bottom:1px solid #F1F5F9; flex-wrap:wrap; gap:.5rem;
    }
    .section-title { font-size:.88rem; font-weight:700; color:#1E293B; }
    .section-sub   { font-size:.75rem; color:#94A3B8; }

    /* ─── Customer wise table (Excel layout) ─── */
    .report-table-wrap { overflow-x: auto; }
    .report-table { width:100%; border-collapse:collapse; font-size:var(--fs-table-body); line-height:1.4; }
    .report-table thead tr.tr-header th {
      background: #1E3A5F; color: white; padding:.625rem .75rem; text-align:center;
      font-weight:600; font-size:var(--fs-table-header); white-space:nowrap;
      border-right:1px solid rgba(255,255,255,.15);
    }
    .report-table thead tr.tr-header th.th-left { text-align:left; min-width:280px; }
    .report-table thead tr.tr-header th.th-num { width:130px; }
    .report-table tbody tr.tr-manager td { background: #EAF0FA; font-weight:700; color:#1E3A5F; padding:.6rem .75rem; }
    .report-table tbody tr.tr-proj { border-bottom:1px solid #F1F5F9; }
    .report-table tbody tr.tr-proj:hover { background:#F8FAFC; }
    .report-table tbody tr.tr-proj td { padding:.48rem .75rem; vertical-align:middle; border-right:1px solid #F8FAFC; }
    .report-table tbody tr.tr-group-total td { background:#CFDEF3; color:#0F2440; font-weight:700; padding:.55rem .75rem; }
    .report-table tfoot tr { background:#1E3A5F; }
    .report-table tfoot td { padding:.6rem .75rem; color:white; font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
    .report-table tfoot td.td-label { text-align:left; }

    .td-num { text-align:right; font-variant-numeric:tabular-nums; }
    .td-num.has-val { font-weight:700; color:#1E3A5F; }
    .td-name-left { text-align:left; }
    .td-center { text-align:center; }

    /* ─── IRM Wise table ─── */
    .irm-table { width:100%; border-collapse:collapse; font-size:var(--fs-table-body); line-height:1.4; }
    .irm-table thead th { background:#F8FAFC; padding:.6rem .875rem; text-align:left; font-weight:600; color:#475569; border-bottom:2px solid #E2E8F0; white-space:nowrap; }
    .irm-table thead th.th-r { text-align:right; width:130px; }
    .irm-table tbody tr { border-bottom:1px solid #F1F5F9; }
    .irm-table tbody tr:hover { background:#F8FAFC; }
    .irm-table tbody td { padding:.52rem .875rem; vertical-align:middle; }
    .irm-table tbody td.td-r { text-align:right; font-variant-numeric:tabular-nums; font-weight:700; color:#1E3A5F; }
    .irm-table tfoot tr { background:#1E3A5F; }
    .irm-table tfoot td { padding:.6rem .875rem; color:white; font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
    .irm-table tfoot td.td-label { text-align:left; }

    /* ─── Resource table ─── */
    .res-table { width:100%; table-layout:fixed; border-collapse:collapse; font-size:var(--fs-table-body); line-height:1.4; }
    .res-table thead th { background:#1E3A5F; color:white; padding:.55rem .7rem; font-size:var(--fs-table-header); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-right:1px solid rgba(255,255,255,.15); text-align:center; }
    .res-table thead th:first-child,.res-table thead th:nth-child(2) { text-align:left; }
    .res-table tbody tr { border-bottom:1px solid #F1F5F9; }
    .res-table tbody tr:hover { background:#F8FAFC; }
    .res-table tbody td { padding:.46rem .7rem; border-right:1px solid #F8FAFC; }
    .res-table tfoot tr { background:#1E3A5F; }
    .res-table tfoot td { padding:.65rem .7rem; color:white; font-weight:700; text-align:right; font-variant-numeric:tabular-nums; border-right:1px solid rgba(255,255,255,.12); }
    .res-table tfoot td.td-label { text-align:left; }

    .total-bar-cell { display:flex; align-items:center; gap:.5rem; min-width:90px; }
    .total-bar-track { flex:1; height:5px; background:#E2E8F0; border-radius:3px; overflow:hidden; }
    .total-bar-fill  { height:100%; border-radius:3px; background:#1E3A5F; }
    .total-val  { font-size:.82rem; font-weight:700; min-width:28px; text-align:right; color:#1E3A5F; }

    .emp-id-badge { font-family:monospace; font-size:.74rem; background:#EFF6FF; color:#1E40AF; padding:2px 6px; border-radius:4px; font-weight:600; }
    .emp-name { font-weight:600; color:#0F172A; font-size:.82rem; }
    .emp-sub  { font-size:.7rem; color:#94A3B8; }

    /* Pagination (Resource wise) */
    .pager { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.75rem 1.25rem; border-top:1px solid #F1F5F9; flex-wrap:wrap; font-size:.78rem; color:#64748B; }
    .pager-btns { display:flex; align-items:center; gap:.25rem; }
    .pager-btn { border:1px solid #E2E8F0; background:white; color:#1E3A5F; border-radius:6px; min-width:30px; height:30px; cursor:pointer; font-size:.78rem; }
    .pager-btn:disabled { opacity:.4; cursor:default; }
    .pager-btn.active { background:#1E3A5F; color:white; border-color:#1E3A5F; }

    /* ─── Project bars ─── */
    .proj-breakdown { display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0; }
    .pb-row { display:flex; align-items:center; gap:.75rem; }
    .pb-name { min-width:240px; max-width:240px; font-size:.79rem; color:#374151; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .pb-bar-wrap { flex:1; height:7px; background:#F1F5F9; border-radius:4px; overflow:hidden; }
    .pb-bar { height:100%; background:linear-gradient(90deg,#1E3A5F,#3B82F6); border-radius:4px; transition:width .6s ease; }
    .pb-val { min-width:44px; text-align:right; font-size:.79rem; font-weight:700; color:#374151; }
    .pb-pct { min-width:38px; text-align:right; font-size:.72rem; color:#94A3B8; }

    /* ─── Projects dialog (same look as live Billable Efforts dialog) ─── */
    .projects-btn { font-size:.72rem !important; padding:.25rem .5rem !important; }
    ::ng-deep .hist-projects-dialog .p-dialog-header {
      background: linear-gradient(135deg, #1E3A5F 0%, #16A34A 130%);
      color: #fff; padding: 1rem 1.5rem; border-radius: 12px 12px 0 0;
    }
    ::ng-deep .hist-projects-dialog .p-dialog-title { color: #fff; font-weight: 700; font-size: 1rem; }
    ::ng-deep .hist-projects-dialog .p-dialog-close-button { color: rgba(255,255,255,.85); }
    ::ng-deep .hist-projects-dialog .p-dialog-close-button:hover { background: rgba(255,255,255,.18); color: #fff; }
    ::ng-deep .hist-projects-dialog .p-dialog-header-close-icon { color: inherit; }
    ::ng-deep .hist-projects-dialog.p-dialog { width: 560px; max-width: 92vw; height: auto; max-height: 85vh; display: flex; flex-direction: column; }
    ::ng-deep .hist-projects-dialog .p-dialog-content { flex: 0 1 auto; overflow-y: auto; padding: 1.25rem 1.5rem 1.5rem; }
    .projects-dialog-head { margin-bottom:1rem; padding-bottom:.75rem; border-bottom:1px solid #E2E8F0; }
    .projects-dialog-name { font-weight:700; font-size:.95rem; color:#0F172A; }
    .projects-dialog-sub  { font-size:.78rem; color:#64748B; margin-top:.15rem; }
    .projects-dialog-empty { text-align:center; padding:2rem 0; color:#94A3B8; font-size:.85rem; }
    .projects-dialog-table { width:100%; border-collapse:collapse; font-size:.83rem; }
    .projects-dialog-table thead th { text-align:left; padding:.6rem .75rem; font-weight:600; color:#fff; background:#1E3A5F; }
    .projects-dialog-table thead th.th-r { text-align:right; }
    .projects-dialog-table tbody td { padding:.55rem .75rem; border-bottom:1px solid #F1F5F9; }
    .projects-dialog-table td.td-r { text-align:right; font-variant-numeric:tabular-nums; font-weight:600; color:#1E3A5F; }
    .projects-dialog-table tfoot td { padding:.6rem .75rem; font-weight:700; color:#0F172A; border-top:2px solid #E2E8F0; }
    .projects-dialog-table tfoot td.td-r { text-align:right; font-variant-numeric:tabular-nums; }

    /* ─── Empty / skeleton ─── */
    .empty-state { text-align:center; padding:3rem; color:#94A3B8; }
    .empty-state i { font-size:2.5rem; display:block; margin-bottom:.75rem; }
    .empty-state p { font-size:.87rem; }
    .skeleton-wrap { padding:.5rem; display:flex; flex-direction:column; gap:.5rem; }

    @media (max-width: 1024px) { .rpt-page { padding:1rem; } }
    @media (max-width: 640px)  { .controls-row { flex-direction:column; align-items:stretch; } .pb-name { min-width:120px; max-width:120px; } }
  `],
  template: `
<p-card>
  <p-toast position="top-right" />

  <div class="rpt-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Historical Reports</h1>
        <p class="page-sub">Pre-launch utilization data, imported from the historical Excel report</p>
      </div>
      <span class="ro-chip"><i class="pi pi-lock"></i>Read only</span>
    </div>

    <div class="prelaunch-banner">
      <i class="pi pi-history"></i>
      <span>Pre-launch data &mdash; approved-only, separate from live timesheets. No utilization or filing-compliance tracking applies to this data.</span>
    </div>

    <p-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
      <p-tablist>
        <p-tab value="0"><i class="pi pi-calendar-times tab-icon"></i>Weekly</p-tab>
        <p-tab value="1"><i class="pi pi-calendar tab-icon"></i>Monthly</p-tab>
        <p-tab value="2"><i class="pi pi-chart-bar tab-icon"></i>Yearly</p-tab>
        <p-tab value="3"><i class="pi pi-sliders-h tab-icon"></i>Custom Range</p-tab>
      </p-tablist>

      <p-tabpanels>

        <!-- ══════════════════════ WEEKLY ══════════════════════════ -->
        <p-tabpanel value="0">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">Select Week</span>
                <p-datepicker [(ngModel)]="weekDate" view="date" [showWeek]="true"
                  placeholder="Pick a date in the week" (ngModelChange)="loadWeekly()" />
              </div>
              <ng-container *ngTemplateOutlet="searchBox"></ng-container>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportWeekly()" [loading]="exporting()" [disabled]="!weeklyData()" />
            </div>
            <ng-container *ngTemplateOutlet="body; context: { $implicit: weeklyData(), emptyMsg: 'No historical data for this week.', icon: 'pi-calendar-times' }"></ng-container>
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ MONTHLY ══════════════════════════ -->
        <p-tabpanel value="1">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">Year</span>
                <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" (ngModelChange)="loadMonthly()" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">Month</span>
                <p-select [options]="monthOptions" [(ngModel)]="selectedMonth" optionLabel="label" optionValue="value" (ngModelChange)="loadMonthly()" />
              </div>
              <ng-container *ngTemplateOutlet="searchBox"></ng-container>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportMonthly()" [loading]="exporting()" [disabled]="!monthlyData()" />
            </div>
            <ng-container *ngTemplateOutlet="body; context: { $implicit: monthlyData(), emptyMsg: 'No historical data for this month.', icon: 'pi-calendar' }"></ng-container>
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ YEARLY ══════════════════════════ -->
        <p-tabpanel value="2">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">Year</span>
                <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" (ngModelChange)="loadYearly()" />
              </div>
              <ng-container *ngTemplateOutlet="searchBox"></ng-container>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportYearly()" [loading]="exporting()" [disabled]="!yearlyData()" />
            </div>
            <ng-container *ngTemplateOutlet="body; context: { $implicit: yearlyData(), emptyMsg: 'No historical data for this year.', icon: 'pi-chart-bar' }"></ng-container>
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ CUSTOM RANGE ══════════════════════ -->
        <p-tabpanel value="3">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">From</span>
                <p-datepicker [(ngModel)]="customFrom" placeholder="Start date" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">To</span>
                <p-datepicker [(ngModel)]="customTo" placeholder="End date" />
              </div>
              <p-button icon="pi pi-search" label="Generate" styleClass="gen-btn" (onClick)="loadCustom()" [loading]="loading()" />
              <ng-container *ngTemplateOutlet="searchBox"></ng-container>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportCustom()" [loading]="exporting()" [disabled]="!customData()" />
            </div>
            <ng-container *ngTemplateOutlet="body; context: { $implicit: customData(), emptyMsg: 'No historical data for this range.', icon: 'pi-sliders-h' }"></ng-container>
          </div>
        </p-tabpanel>

      </p-tabpanels>
    </p-tabs>

    <!-- ── Shared: search box ── -->
    <ng-template #searchBox>
      <div class="ctrl-group">
        <span class="ctrl-label">Filter Resource / Manager</span>
        <div class="search-input-wrap">
          <i class="pi pi-search"></i>
          <input class="s-input" type="text" placeholder="Name / Emp ID / Manager…"
            [ngModel]="search()" (ngModelChange)="onSearch($event)" />
        </div>
      </div>
    </ng-template>

    <!-- ── Shared: report body (summary + sub-tabs) ── -->
    <ng-template #body let-d let-emptyMsg="emptyMsg" let-icon="icon">
      @if (loading()) {
        <div class="skeleton-wrap">@for (i of [1,2,3,4,5,6]; track i) { <p-skeleton height="2.5rem" /> }</div>
      } @else if (d && d.has_data) {
        <!-- Summary -->
        <div class="summary-strip">
          <div class="sum-card sum-blue">
            <div class="sum-icon"><i class="pi pi-users"></i></div>
            <div><div class="sum-val">{{ d.resources.length }}</div><div class="sum-lbl">Resources</div></div>
          </div>
          <div class="sum-card sum-green">
            <div class="sum-icon"><i class="pi pi-clock"></i></div>
            <div>
              <div class="sum-val">{{ d.total_hours | number:'1.0-0' }}</div>
              <div class="sum-lbl">Total Hours</div>
              <div class="sum-sub">{{ d.period_label }}</div>
            </div>
          </div>
          <div class="sum-card sum-purple">
            <div class="sum-icon"><i class="pi pi-briefcase"></i></div>
            <div><div class="sum-val">{{ d.project_summary.length }}</div><div class="sum-lbl">Projects</div></div>
          </div>
          <div class="sum-card sum-orange">
            <div class="sum-icon"><i class="pi pi-chart-line"></i></div>
            <div>
              <div class="sum-val">{{ avgHours() }}</div>
              <div class="sum-lbl">Avg Hours</div>
              <div class="sum-sub">per resource</div>
            </div>
          </div>
          <div class="sum-card sum-red">
            <div class="sum-icon"><i class="pi pi-sitemap"></i></div>
            <div><div class="sum-val">{{ irmCount() }}</div><div class="sum-lbl">Managers (IRM)</div></div>
          </div>
        </div>

        <p-tabs [value]="subTab()" (valueChange)="subTab.set($any($event))" styleClass="sub-tabs">
          <p-tablist>
            <p-tab value="0">Customer wise</p-tab>
            <p-tab value="1">IRM Wise</p-tab>
            <p-tab value="2">Resource wise</p-tab>
            <p-tab value="3">Project Breakdown</p-tab>
          </p-tablist>
          <p-tabpanels>

            <!-- ── Customer wise (Manager → Projects) ── -->
            <p-tabpanel value="0">
              <div class="section-card">
                <div class="section-header">
                  <span class="section-title">Customer wise — {{ d.period_label }}</span>
                  <span class="section-sub">Manager → Project breakdown · matches Excel Customer wise sheet</span>
                </div>
                <div class="report-table-wrap">
                  <table class="report-table">
                    <thead>
                      <tr class="tr-header">
                        <th class="th-left">Manager / Project</th>
                        @for (c of columns(); track c) { <th class="th-num">{{ c }}</th> }
                        <th class="th-num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @if (customerGroups().length === 0) {
                        <tr><td [attr.colspan]="columns().length + 2" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                      }
                      @for (grp of customerGroups(); track grp.manager) {
                        <tr class="tr-manager"><td [attr.colspan]="columns().length + 2">{{ grp.manager }}</td></tr>
                        @for (proj of grp.projects; track proj.project) {
                          <tr class="tr-proj">
                            <td class="td-name-left" style="padding-left:1.5rem;">{{ proj.project }}</td>
                            @for (c of proj.cols; track $index) { <td class="td-num" [class.has-val]="c > 0">{{ c || '—' }}</td> }
                            <td class="td-num has-val">{{ proj.total || '—' }}</td>
                          </tr>
                        }
                        <tr class="tr-group-total">
                          <td class="td-name-left">Total</td>
                          @for (c of grp.colTotals; track $index) { <td class="td-num">{{ c }}</td> }
                          <td class="td-num">{{ grp.total }}</td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td class="td-label">Grand Total</td>
                        @for (c of grandColTotals(); track $index) { <td>{{ c }}</td> }
                        <td>{{ filteredTotal() }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </p-tabpanel>

            <!-- ── IRM Wise ── -->
            <p-tabpanel value="1">
              <div class="section-card">
                <div class="section-header">
                  <span class="section-title">IRM Wise — {{ d.period_label }}</span>
                  <span class="section-sub">Manager-level summary · matches Excel IRM Wise sheet</span>
                </div>
                <div class="report-table-wrap">
                  <table class="irm-table">
                    <thead>
                      <tr>
                        <th>IRM</th>
                        <th class="th-r">Resources</th>
                        @for (c of columns(); track c) { <th class="th-r">{{ c }}</th> }
                        <th class="th-r">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @if (irmRows().length === 0) {
                        <tr><td [attr.colspan]="columns().length + 3" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                      }
                      @for (irm of irmRows(); track irm.irm) {
                        <tr>
                          <td>{{ irm.irm }}</td>
                          <td class="td-r" style="color:#475569; font-weight:600;">{{ irm.resources }}</td>
                          @for (c of irm.cols; track $index) { <td class="td-r">{{ c || '—' }}</td> }
                          <td class="td-r">{{ irm.total || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td class="td-label">Total effort</td>
                        <td>{{ filteredResources().length }}</td>
                        @for (c of grandColTotals(); track $index) { <td>{{ c }}</td> }
                        <td>{{ filteredTotal() }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </p-tabpanel>

            <!-- ── Resource wise ── -->
            <p-tabpanel value="2">
              <div class="section-card">
                <div class="section-header">
                  <span class="section-title">Resource wise — {{ d.period_label }}</span>
                  <span class="section-sub">{{ filteredResources().length }} of {{ d.resources.length }} resources</span>
                </div>
                <div class="report-table-wrap">
                  <table class="res-table">
                    <thead>
                      <tr>
                        <th style="width:96px;">Emp ID</th>
                        <th>Name</th>
                        <th style="width:130px;">B Unit</th>
                        <th style="background:#16A34A; width:170px;">Total Hrs</th>
                        <th style="background:#0F2440; width:90px;">Projects</th>
                        <th style="width:150px;">Projects Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      @if (filteredResources().length === 0) {
                        <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                      }
                      @for (res of pagedResources(); track res.user_id) {
                        <tr>
                          <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                          <td>
                            <div class="emp-name">{{ res.user_name }}</div>
                            <div class="emp-sub">{{ res.irm }}</div>
                          </td>
                          <td class="td-center" style="color:#475569;">{{ res.b_unit || '—' }}</td>
                          <td>
                            <div class="total-bar-cell">
                              <div class="total-bar-track">
                                <div class="total-bar-fill" [style.width]="barPct(res.total_hours) + '%'"></div>
                              </div>
                              <span class="total-val">{{ res.total_hours | number:'1.0-1' }}</span>
                            </div>
                          </td>
                          <td class="td-center" style="font-weight:600; color:#475569;">{{ (res.projects || []).length }}</td>
                          <td class="td-center">
                            <p-button label="View" icon="pi pi-eye" size="small" [text]="true"
                              styleClass="projects-btn" (onClick)="openProjects(res)"
                              pTooltip="View Projects Submitted" tooltipPosition="top" />
                          </td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td class="td-label" colspan="3">Grand Total</td>
                        <td>{{ filteredTotal() }}</td>
                        <td style="text-align:center;">{{ d.project_summary.length }}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                @if (pageCount() > 1) {
                  <div class="pager">
                    <span>Showing {{ pageStart() + 1 }}–{{ pageEnd() }} of {{ filteredResources().length }}</span>
                    <div class="pager-btns">
                      <button class="pager-btn" [disabled]="page() === 0" (click)="page.set(0)"><i class="pi pi-angle-double-left"></i></button>
                      <button class="pager-btn" [disabled]="page() === 0" (click)="page.set(page() - 1)"><i class="pi pi-angle-left"></i></button>
                      @for (p of pageNumbers(); track p) {
                        <button class="pager-btn" [class.active]="p === page()" (click)="page.set(p)">{{ p + 1 }}</button>
                      }
                      <button class="pager-btn" [disabled]="page() >= pageCount() - 1" (click)="page.set(page() + 1)"><i class="pi pi-angle-right"></i></button>
                      <button class="pager-btn" [disabled]="page() >= pageCount() - 1" (click)="page.set(pageCount() - 1)"><i class="pi pi-angle-double-right"></i></button>
                    </div>
                  </div>
                }
              </div>
            </p-tabpanel>

            <!-- ── Project Breakdown ── -->
            <p-tabpanel value="3">
              <div class="section-card">
                <div class="section-header">
                  <span class="section-title">Project Breakdown — Top 15</span>
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
            </p-tabpanel>

          </p-tabpanels>
        </p-tabs>
      } @else if (d) {
        <div class="empty-state"><i class="pi pi-inbox"></i><p>{{ emptyMsg }}</p></div>
      } @else {
        <div class="empty-state"><i class="pi" [ngClass]="icon"></i><p>Select a period above to generate the report.</p></div>
      }
    </ng-template>

    <!-- ── Projects Submitted dialog ── -->
    <p-dialog header="Projects Submitted" [visible]="projectsDialogVisible()" (visibleChange)="projectsDialogVisible.set($event)"
      [modal]="true" [dismissableMask]="true" [style]="{width:'560px', maxWidth:'92vw'}" styleClass="hist-projects-dialog">
      @if (projectsDialogResource(); as res) {
        <div class="projects-dialog-head">
          <div class="projects-dialog-name">{{ res.user_name }}</div>
          <div class="projects-dialog-sub">{{ res.yash_id }} &middot; {{ res.irm }}</div>
        </div>
        @if (projectsDialogProjects().length === 0) {
          <div class="projects-dialog-empty">No projects recorded for this period.</div>
        } @else {
          <table class="projects-dialog-table">
            <thead><tr><th>Project</th><th class="th-r">Hours</th></tr></thead>
            <tbody>
              @for (p of projectsDialogProjects(); track p.project_name) {
                <tr><td>{{ p.project_name }}</td><td class="td-r">{{ p.hours }}</td></tr>
              }
            </tbody>
            <tfoot><tr><td>Total</td><td class="td-r">{{ projectsDialogTotal() }}</td></tr></tfoot>
          </table>
        }
      }
    </p-dialog>
  </div>
</p-card>
  `,
})
export class HistoricalReportsComponent implements OnInit {
  loading   = signal(false);
  exporting = signal(false);

  activeTab = signal<string>('0');
  subTab    = signal<string>('0');
  search    = signal<string>('');
  page      = signal(0);
  readonly pageSize = 15;

  weeklyData  = signal<any>(null);
  monthlyData = signal<any>(null);
  yearlyData  = signal<any>(null);
  customData  = signal<any>(null);

  weekDate: Date   = new Date();
  customFrom: Date = this.mondayOf(new Date());
  customTo: Date   = new Date();

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

  private static readonly MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── Derived views for whichever period tab is active ────────────────────
  current = computed(() => {
    switch (this.activeTab()) {
      case '1': return this.monthlyData();
      case '2': return this.yearlyData();
      case '3': return this.customData();
      default:  return this.weeklyData();
    }
  });

  filteredResources = computed((): any[] => {
    const d = this.current();
    if (!d?.resources) return [];
    const q = this.search().trim().toLowerCase();
    if (!q) return d.resources;
    return d.resources.filter((r: any) =>
      (r.user_name || '').toLowerCase().includes(q) ||
      String(r.yash_id || '').toLowerCase().includes(q) ||
      (r.irm || '').toLowerCase().includes(q));
  });

  filteredTotal = computed(() => this.round(this.filteredResources().reduce((s, r) => s + (r.total_hours || 0), 0)));

  avgHours = computed(() => {
    const d = this.current();
    const n = d?.resources?.length || 0;
    return n ? this.round(d.total_hours / n) : 0;
  });

  irmCount = computed(() => new Set((this.current()?.resources || []).map((r: any) => r.irm || '—')).size);

  /** Pivot columns: the single week for Weekly; weeks (Monthly/Custom) or
   *  months (Yearly) in chronological order, matching backend by_label keys. */
  columns = computed((): string[] => {
    const d = this.current();
    if (!d) return [];
    if (this.activeTab() === '0') return [d.period_label];

    const present = new Set<string>();
    for (const r of d.resources || []) for (const p of r.projects || []) for (const k of Object.keys(p.by_label || {})) present.add(k);

    const from = this.parseIso(d.from_date), to = this.parseIso(d.to_date);
    const cols: string[] = [];
    if (this.activeTab() === '2') {
      for (let m = 0; m < 12; m++) cols.push(this.monthLabel(new Date(from.getFullYear(), m, 1)));
    } else {
      for (let w = this.mondayOf(from); w <= to; w = this.addDays(w, 7)) {
        const lbl = this.weekLabel(w);
        if (w >= from || present.has(lbl)) cols.push(lbl);
      }
    }
    for (const k of present) if (!cols.includes(k)) cols.push(k);
    return cols;
  });

  private projCols(p: any, cols: string[]): number[] {
    if (this.activeTab() === '0') return [p.hours || 0];
    return cols.map(c => (p.by_label || {})[c] || 0);
  }

  customerGroups = computed((): CustGroup[] => {
    const cols = this.columns();
    const map = new Map<string, Map<string, number[]>>();
    for (const r of this.filteredResources()) {
      const mgr = r.irm || '—';
      if (!map.has(mgr)) map.set(mgr, new Map());
      const pm = map.get(mgr)!;
      for (const p of r.projects || []) {
        const vals = this.projCols(p, cols);
        const acc = pm.get(p.project_name) || cols.map(() => 0);
        pm.set(p.project_name, acc.map((v, i) => v + vals[i]));
      }
    }
    const groups: CustGroup[] = [];
    for (const [manager, pm] of map) {
      const projects: CustRow[] = [...pm].map(([project, c]) => ({
        project, cols: c.map(v => this.round(v)), total: this.round(c.reduce((a, b) => a + b, 0)),
      })).sort((a, b) => b.total - a.total);
      const colTotals = cols.map((_, i) => this.round(projects.reduce((s, p) => s + p.cols[i], 0)));
      groups.push({ manager, projects, colTotals, total: this.round(colTotals.reduce((a, b) => a + b, 0)) });
    }
    return groups.sort((a, b) => b.total - a.total);
  });

  irmRows = computed((): IrmRow[] => {
    const cols = this.columns();
    const counts = new Map<string, number>();
    for (const r of this.filteredResources()) counts.set(r.irm || '—', (counts.get(r.irm || '—') || 0) + 1);
    return this.customerGroups().map(g => ({ irm: g.manager, resources: counts.get(g.manager) || 0, cols: g.colTotals, total: g.total }))
      .concat([...counts.keys()].filter(k => !this.customerGroups().some(g => g.manager === k))
        .map(k => ({ irm: k, resources: counts.get(k)!, cols: cols.map(() => 0), total: 0 })));
  });

  grandColTotals = computed(() => {
    const groups = this.customerGroups();
    return this.columns().map((_, i) => this.round(groups.reduce((s, g) => s + g.colTotals[i], 0)));
  });

  // Resource-wise bar: vs 45h/week standard for Weekly, vs top resource otherwise
  private maxHours = computed(() => Math.max(1, ...this.filteredResources().map(r => r.total_hours || 0)));
  barPct(h: number): number {
    const base = this.activeTab() === '0' ? 45 : this.maxHours();
    return Math.min(((h || 0) / base) * 100, 100);
  }

  // ── Pagination (Resource wise) ──────────────────────────────────────────
  pageCount   = computed(() => Math.ceil(this.filteredResources().length / this.pageSize));
  pageStart   = computed(() => this.page() * this.pageSize);
  pageEnd     = computed(() => Math.min(this.pageStart() + this.pageSize, this.filteredResources().length));
  pagedResources = computed(() => this.filteredResources().slice(this.pageStart(), this.pageEnd()));
  pageNumbers = computed(() => {
    const n = this.pageCount(), cur = this.page();
    const start = Math.max(0, Math.min(cur - 2, n - 5));
    return Array.from({ length: Math.min(5, n) }, (_, i) => start + i);
  });

  // ── Projects Submitted dialog ───────────────────────────────────────────
  // Historical rows have no project_type classification (approved-only,
  // plain-text project names), so this lists every project logged.
  projectsDialogVisible  = signal(false);
  projectsDialogResource = signal<any>(null);
  projectsDialogProjects = computed((): any[] => {
    const res = this.projectsDialogResource();
    if (!res) return [];
    return [...(res.projects || [])].sort((a: any, b: any) => b.hours - a.hours);
  });
  projectsDialogTotal = computed((): number =>
    this.round(this.projectsDialogProjects().reduce((s: number, p: any) => s + (p.hours || 0), 0)));

  openProjects(res: any) {
    this.projectsDialogResource.set(res);
    this.projectsDialogVisible.set(true);
  }

  constructor(
    private historicalService: HistoricalReportsService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadWeekly();
  }

  onTabChange(v: any) {
    const tab = String(v ?? '0');
    this.activeTab.set(tab);
    this.page.set(0);
    if (tab === '1' && !this.monthlyData()) this.loadMonthly();
    if (tab === '2' && !this.yearlyData())  this.loadYearly();
  }

  onSearch(v: string) {
    this.search.set(v || '');
    this.page.set(0);
  }

  // ── Date helpers ────────────────────────────────────────────────────────
  private mondayOf(d: Date): Date {
    const day = d.getDay();
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    m.setDate(m.getDate() + ((day === 0 ? -6 : 1) - day));
    return m;
  }
  private addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  private parseIso(s: string): Date { const [y, m, d] = (s || '').split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }
  private pad(n: number) { return String(n).padStart(2, '0'); }
  // Must match backend report_views._week_label / _month_label exactly
  private weekLabel(start: Date): string {
    const end = this.addDays(start, 6), M = HistoricalReportsComponent.MON;
    return start.getMonth() === end.getMonth()
      ? `${M[start.getMonth()]} ${this.pad(start.getDate())} to ${this.pad(end.getDate())}`
      : `${M[start.getMonth()]} ${this.pad(start.getDate())} to ${M[end.getMonth()]} ${this.pad(end.getDate())}`;
  }
  private monthLabel(d: Date): string {
    return `${HistoricalReportsComponent.MON[d.getMonth()]}'${String(d.getFullYear()).slice(-2)}`;
  }
  private round(n: number) { return Math.round((n || 0) * 10) / 10; }

  // Local Y/M/D formatting, not toISOString() -- avoids the timezone-shift
  // bug toISOString() has in IST and similar zones (see reports.component.ts).
  private toIso(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }
  private get weekStartIso(): string { return this.toIso(this.mondayOf(this.weekDate || new Date())); }

  // ── Weekly ──────────────────────────────────────────────────────────────
  loadWeekly() {
    if (!this.weekDate) return;
    this.loading.set(true);
    this.page.set(0);
    this.historicalService.getWeekly(this.weekStartIso).subscribe({
      next:  (data) => { this.weeklyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load weekly historical report'); },
    });
  }

  exportWeekly() {
    this.exporting.set(true);
    const ws = this.weekStartIso;
    this.historicalService.exportWeekly(ws).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Historical_Weekly_${ws}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Monthly ─────────────────────────────────────────────────────────────
  loadMonthly() {
    this.loading.set(true);
    this.page.set(0);
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
    this.page.set(0);
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
    if (!this.customFrom || !this.customTo) { this.toast('warn', 'Pick both From and To dates'); return; }
    if (this.customFrom > this.customTo)   { this.toast('warn', 'From date must be before To date'); return; }
    this.loading.set(true);
    this.page.set(0);
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
    const summary = severity === 'error' ? 'Error' : severity === 'warn' ? 'Warning' : 'Notice';
    this.messageService.add({ severity, summary, detail, life: 4000 });
  }
}
