import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsModule }       from 'primeng/tabs';
import { ButtonModule }     from 'primeng/button';
import { TableModule }      from 'primeng/table';
import { TagModule }        from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule }   from 'primeng/skeleton';
import { ToastModule }      from 'primeng/toast';
import { ChartModule }      from 'primeng/chart';
import { SelectModule }     from 'primeng/select';
import { InputTextModule }  from 'primeng/inputtext';
import { TooltipModule }    from 'primeng/tooltip';
import { MessageService }   from 'primeng/api';

import { ReportsService }        from '../service/report.service';
import { AuthenticationService } from '../service/authentication.service';
import { Card } from "primeng/card";

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    TabsModule, ButtonModule, TableModule, TagModule,
    DatePickerModule, SkeletonModule, ToastModule,
    ChartModule, SelectModule, InputTextModule, TooltipModule,
    Card
],
  providers: [MessageService, ReportsService, AuthenticationService],
  styles: [`
    /* ─── Page shell ─── */
    .rpt-page {
      padding: 1.5rem 2rem;
      max-width: 1700px;
      margin: 0 auto;
    }

    /* ─── Page header ─── */
    .page-header { margin-bottom: 1.25rem; }
    .page-title {
      font-size: 1.45rem; font-weight: 800; color: #0F172A;
      margin: 0 0 0.15rem; letter-spacing: -0.02em;
    }
    .page-sub { font-size: 0.81rem; color: #64748B; }

    /* ─── Tab panel content wrapper ─── */
    .tab-content { padding: 1.25rem 0 0; }

    /* ─── Controls row ─── */
    .controls-row {
      display: flex; align-items: flex-end; gap: 1rem;
      flex-wrap: wrap; margin-bottom: 1.25rem;
      background: white; border: 1px solid #E2E8F0;
      border-radius: 12px; padding: 1rem 1.25rem;
    }
    .ctrl-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .ctrl-label {
      font-size: 0.72rem; font-weight: 600; color: #64748B;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ctrl-spacer { flex: 1; }
    .export-btn {
      background: white !important; color: #1E3A5F !important;
      border: 1.5px solid #1E3A5F !important; border-radius: 8px !important;
      font-weight: 600 !important; font-size: 0.83rem !important;
      transition: all 0.15s !important;
    }
    .export-btn:hover { background: #EFF6FF !important; }
    .gen-btn {
      background: #1E3A5F !important; border-color: #1E3A5F !important;
      border-radius: 8px !important; font-weight: 600 !important;
      font-size: 0.83rem !important;
    }
    .gen-btn:hover { background: #162D4D !important; }

    /* ─── Summary cards ─── */
    .summary-strip {
      display: flex; gap: 0.875rem; margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .sum-card {
      flex: 1; min-width: 130px; background: white;
      border: 1px solid #E2E8F0; border-radius: 12px;
      padding: 0.875rem 1.125rem; display: flex; align-items: center; gap: 0.75rem;
      position: relative; overflow: hidden; transition: box-shadow 0.2s;
    }
    .sum-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .sum-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0;
      height: 3px; border-radius: 12px 12px 0 0;
    }
    .sum-blue::before   { background: #1E3A5F; }
    .sum-green::before  { background: #16A34A; }
    .sum-purple::before { background: #7C3AED; }
    .sum-orange::before { background: #D97706; }
    .sum-red::before    { background: #DC2626; }

    .sum-icon {
      width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
    }
    .sum-blue   .sum-icon { background: #EEF2FF; color: #4F46E5; }
    .sum-green  .sum-icon { background: #F0FDF4; color: #16A34A; }
    .sum-purple .sum-icon { background: #FAF5FF; color: #7C3AED; }
    .sum-orange .sum-icon { background: #FFFBEB; color: #D97706; }
    .sum-red    .sum-icon { background: #FEF2F2; color: #DC2626; }

    .sum-val { font-size: 1.4rem; font-weight: 800; color: #0F172A; line-height: 1; margin-bottom: 2px; }
    .sum-lbl { font-size: 0.68rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    .sum-sub  { font-size: 0.7rem; color: #94A3B8; margin-top: 1px; }

    /* ─── Section card ─── */
    .section-card {
      background: white; border: 1px solid #E2E8F0; border-radius: 14px;
      overflow: hidden; margin-bottom: 1.25rem;
    }
    .section-card:last-child { margin-bottom: 0; }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.875rem 1.25rem; border-bottom: 1px solid #F1F5F9;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-title { font-size: 0.88rem; font-weight: 700; color: #1E293B; }
    .section-sub   { font-size: 0.75rem; color: #94A3B8; }

    /* ─── The main weekly report table (matches Excel exactly) ─── */
    .report-table-wrap { overflow-x: auto; }

    .report-table {
      width: 100%; border-collapse: collapse; font-size: 0.8rem;
      min-width: 900px;
    }
    .report-table thead tr:first-child th {
      background: #1E3A5F; color: white;
      padding: 0.625rem 0.75rem; text-align: center;
      font-weight: 600; font-size: 0.75rem; white-space: nowrap;
      border-right: 1px solid rgba(255,255,255,0.15);
    }
    .report-table thead tr:first-child th.th-emp {
      text-align: left; background: #0F2440;
    }
    .report-table thead tr:first-child th.th-name {
      text-align: left; background: #0F2440;
    }

    /* Sub-header row (project names) */
    .report-table thead tr.sub-header th {
      background: #F0F4FF; color: #1E3A5F;
      padding: 0.5rem 0.625rem; font-size: 0.72rem; font-weight: 600;
      border-bottom: 2px solid #DBEAFE; white-space: nowrap;
      border-right: 1px solid #E2E8F0;
    }
    .report-table thead tr.sub-header th.th-num { text-align: right; }

    .report-table tbody tr { border-bottom: 1px solid #F1F5F9; }
    .report-table tbody tr:hover { background: #F8FAFC; }
    .report-table tbody tr.tr-total {
      background: #F0F4FF; font-weight: 700;
      border-top: 2px solid #DBEAFE; border-bottom: 2px solid #DBEAFE;
    }
    .report-table tbody tr.tr-zero td { color: #CBD5E1; }
    .report-table tbody tr.tr-zero td.td-name { color: #94A3B8; }
    .report-table tbody td {
      padding: 0.52rem 0.75rem; vertical-align: middle;
      border-right: 1px solid #F8FAFC;
    }
    .report-table tbody td.td-num {
      text-align: right; font-variant-numeric: tabular-nums;
      font-size: 0.79rem;
    }
    .report-table tbody td.td-num.has-val { font-weight: 700; color: #1E3A5F; }
    .report-table tbody td.td-num.is-leave { color: #D97706; font-weight: 600; }
    .report-table tbody td.td-num.is-pmo { color: #7C3AED; font-weight: 600; }
    .report-table tfoot tr { background: #1E3A5F; }
    .report-table tfoot td {
      padding: 0.6rem 0.75rem; color: white; font-weight: 700;
      font-size: 0.79rem; text-align: right; font-variant-numeric: tabular-nums;
    }
    .report-table tfoot td.td-label { text-align: left; }

    /* ID + Name cells */
    .emp-id-badge {
      font-family: monospace; font-size: 0.74rem; background: #EFF6FF;
      color: #1E40AF; padding: 2px 6px; border-radius: 4px; font-weight: 600;
    }
    .emp-name { font-weight: 600; color: #0F172A; font-size: 0.82rem; }

    /* Total hours bar cell */
    .total-bar-cell { display: flex; align-items: center; gap: 0.5rem; min-width: 90px; }
    .total-bar-track { flex: 1; height: 5px; background: #E2E8F0; border-radius: 3px; overflow: hidden; }
    .total-bar-fill { height: 100%; border-radius: 3px; }
    .fill-good  { background: #16A34A; }
    .fill-mid   { background: #1E3A5F; }
    .fill-low   { background: #EF4444; }
    .total-val  { font-size: 0.82rem; font-weight: 700; min-width: 28px; text-align: right; }
    .total-val.low { color: #DC2626; }
    .total-val.good { color: #16A34A; }

    /* Utilization % */
    .util-pct { font-size: 0.75rem; font-weight: 600; }
    .util-pct.low { color: #DC2626; }
    .util-pct.mid { color: #D97706; }
    .util-pct.good { color: #16A34A; }

    /* Status tag in weekly */
    .status-pill {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    }
    .status-approved  { background: #DCFCE7; color: #166534; }
    .status-submitted { background: #DBEAFE; color: #1E40AF; }
    .status-rejected  { background: #FEE2E2; color: #991B1B; }
    .status-draft     { background: #F1F5F9; color: #475569; }

    /* Project breakdown bars */
    .proj-breakdown { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.25rem 0; }
    .pb-row { display: flex; align-items: center; gap: 0.75rem; }
    .pb-name { min-width: 220px; font-size: 0.79rem; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pb-bar-wrap { flex: 1; height: 7px; background: #F1F5F9; border-radius: 4px; overflow: hidden; }
    .pb-bar { height: 100%; background: linear-gradient(90deg, #1E3A5F, #3B82F6); border-radius: 4px; transition: width 0.6s ease; }
    .pb-val { min-width: 44px; text-align: right; font-size: 0.79rem; font-weight: 700; color: #374151; }
    .pb-pct { min-width: 38px; text-align: right; font-size: 0.72rem; color: #94A3B8; }

    /* Resource utilisation (billing) table */
    .util-table { width: 100%; border-collapse: collapse; font-size: 0.81rem; }
    .util-table thead th {
      background: #F8FAFC; padding: 0.6rem 0.875rem; text-align: left;
      font-weight: 600; color: #475569; border-bottom: 2px solid #E2E8F0; white-space: nowrap;
    }
    .util-table thead th.th-r { text-align: right; }
    .util-table tbody tr { border-bottom: 1px solid #F1F5F9; }
    .util-table tbody tr:hover { background: #F8FAFC; }
    .util-table tbody td { padding: 0.52rem 0.875rem; vertical-align: middle; }
    .util-table tbody td.td-r { text-align: right; }

    /* Yearly chart wrapper */
    .chart-wrap {
      background: white; border: 1px solid #E2E8F0; border-radius: 14px;
      padding: 1.25rem; margin-bottom: 1.25rem;
    }
    .chart-title { font-size: 0.82rem; font-weight: 700; color: #374151; margin: 0 0 0.875rem; }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 3rem; color: #94A3B8;
    }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .empty-state p { font-size: 0.87rem; }

    /* Skeleton */
    .skeleton-wrap { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; }

    /* Range badge */
    .range-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #EFF6FF; color: #1E40AF; padding: 0.35rem 0.875rem;
      border-radius: 20px; font-size: 0.79rem; font-weight: 600; margin-bottom: 1rem;
    }
    .range-badge .week-chip {
      background: #DBEAFE; padding: 1px 7px; border-radius: 10px; font-size: 0.72rem;
    }

    /* Search input */
    .search-input-wrap {
      display: flex; align-items: center; background: white;
      border: 1px solid #E2E8F0; border-radius: 8px; padding: 0 0.75rem; gap: 0.4rem;
      transition: border-color 0.15s;
    }
    .search-input-wrap:focus-within { border-color: #1E3A5F; }
    .search-input-wrap i { color: #94A3B8; font-size: 0.85rem; }
    .s-input {
      border: none; outline: none; font-size: 0.82rem; padding: 0.42rem 0;
      min-width: 180px; background: transparent; color: #0F172A;
    }

    /* Manager/Master table (Master Data sheet equivalent) */
    .manager-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .manager-table thead th {
      background: #1E3A5F; color: white; padding: 0.6rem 0.75rem;
      font-weight: 600; font-size: 0.74rem; white-space: nowrap;
      border-right: 1px solid rgba(255,255,255,0.15); text-align: center;
    }
    .manager-table thead th:first-child { text-align: left; }
    .manager-table thead th:nth-child(2) { text-align: left; }
    .manager-table tbody tr { border-bottom: 1px solid #F1F5F9; }
    .manager-table tbody tr:hover { background: #F8FAFC; }
    .manager-table tbody tr.tr-mgr-header td { background: #F8FAFC; font-weight: 700; color: #1E3A5F; }
    .manager-table tbody tr.tr-project-total td { background: #F0F4FF; font-weight: 700; }
    .manager-table tbody td { padding: 0.5rem 0.75rem; border-right: 1px solid #F8FAFC; }
    .manager-table tbody td.td-num { text-align: right; font-variant-numeric: tabular-nums; }
    .manager-table tbody td.td-num.has-val { font-weight: 600; color: #1E3A5F; }
    .manager-table tfoot td { background: #1E3A5F; color: white; font-weight: 700; padding: 0.6rem 0.75rem; text-align: right; }
    .manager-table tfoot td:first-child { text-align: left; }

    /* Responsive */
    @media (max-width: 1024px) {
      .rpt-page { padding: 1rem; }
      .summary-strip .sum-card { min-width: 120px; }
    }
    @media (max-width: 640px) {
      .controls-row { flex-direction: column; align-items: stretch; }
      .pb-name { min-width: 120px; }
    }

    /* Pagination info strip */
    .table-info-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 1rem; background: #F8FAFC; border-bottom: 1px solid #F1F5F9;
      font-size: 0.79rem; color: #64748B; flex-wrap: wrap; gap: 0.5rem;
    }
    .table-info-row strong { color: #0F172A; }

    /* Grand total footer */
    .grand-total-row {
      display: flex; align-items: center; gap: 1.5rem;
      padding: 0.75rem 1.25rem; background: #1E3A5F;
      border-radius: 0 0 14px 14px; color: white;
    }
    .gt-item { }
    .gt-val { font-size: 1rem; font-weight: 800; }
    .gt-lbl { font-size: 0.68rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
  `],
  template: `
<p-card>
  <p-toast position="top-right" />

<div class="rpt-page">

  <div class="page-header">
    <h1 class="page-title">Utilization Report</h1>
  </div>

  <p-tabs [(value)]="activeTab" (valueChange)="onTabChange($event)">

    <p-tablist>
      <p-tab value="0"><i class="pi pi-calendar-times"></i>&nbsp; Weekly</p-tab>
      <p-tab value="1"><i class="pi pi-calendar"></i>&nbsp; Monthly</p-tab>
      <p-tab value="2"><i class="pi pi-chart-bar"></i>&nbsp; Yearly</p-tab>
      <p-tab value="3"><i class="pi pi-sliders-h"></i>&nbsp; Custom Range</p-tab>
    </p-tablist>

    <p-tabpanels>

      <!-- ════════════════ WEEKLY ════════════════ -->
      <p-tabpanel value="0">
        <div class="tab-content">

          <div class="controls-row">
            <div class="ctrl-group">
              <span class="ctrl-label">Select Week</span>
              <p-datepicker [(ngModel)]="weeklyDate" view="date" [showWeek]="true"
                placeholder="Pick a date in the week" (ngModelChange)="loadWeeklyReport()" />
            </div>
            <!-- Search -->
            <div class="ctrl-group">
              <span class="ctrl-label">Filter Resource</span>
              <div class="search-input-wrap">
                <i class="pi pi-search"></i>
                <input class="s-input" type="text" placeholder="Name / Emp ID…"
                  [(ngModel)]="weeklySearch" (ngModelChange)="filterWeekly()" />
              </div>
            </div>
            <div class="ctrl-spacer"></div>
            <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
              [outlined]="true" (onClick)="exportWeekly()" [loading]="exporting()" />
          </div>

          @if (weeklyData()) {
            <!-- Summary strip -->
            <div class="summary-strip">
              <div class="sum-card sum-blue">
                <div class="sum-icon"><i class="pi pi-users"></i></div>
                <div>
                  <div class="sum-val">{{ weeklyFilteredResources().length }}</div>
                  <div class="sum-lbl">Resources</div>
                </div>
              </div>
              <div class="sum-card sum-green">
                <div class="sum-icon"><i class="pi pi-clock"></i></div>
                <div>
                  <div class="sum-val">{{ weeklyData()!.total_hours | number:'1.0-0' }}</div>
                  <div class="sum-lbl">Total Hours</div>
                  <div class="sum-sub">{{ weeklyData()!.week_label }}</div>
                </div>
              </div>
              <div class="sum-card sum-purple">
                <div class="sum-icon"><i class="pi pi-briefcase"></i></div>
                <div>
                  <div class="sum-val">{{ weeklyData()!.project_summary.length }}</div>
                  <div class="sum-lbl">Projects Active</div>
                </div>
              </div>
              <div class="sum-card sum-orange">
                <div class="sum-icon"><i class="pi pi-percentage"></i></div>
                <div>
                  <div class="sum-val">{{ weeklyUtilPct() }}%</div>
                  <div class="sum-lbl">Avg Utilization</div>
                  <div class="sum-sub">of 45h scheduled</div>
                </div>
              </div>
              <div class="sum-card sum-red">
                <div class="sum-icon"><i class="pi pi-user-minus"></i></div>
                <div>
                  <div class="sum-val">{{ weeklyZeroCount() }}</div>
                  <div class="sum-lbl">No Hours Logged</div>
                </div>
              </div>
            </div>

            <!-- MAIN TABLE: Matches "Weekly Time Sheet Sept" layout -->
            <!-- Emp ID | Name | Leave | PMO | Project1 | Project2 | ... | Total -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">
                  Resource-wise Utilization — {{ weeklyData()!.week_label }}
                </span>
                <span class="section-sub">
                  {{ weeklyFilteredResources().length }} of {{ weeklyData()!.resources.length }} resources
                </span>
              </div>
              <div class="report-table-wrap">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th class="th-emp" rowspan="1">Emp ID</th>
                      <th class="th-name" rowspan="1">Name</th>
                      <th style="background:#7C3AED">Leave</th>
                      <th style="background:#4F46E5">PMO</th>
                      @for (p of weeklyTopProjects(); track p) {
                        <th>{{ p }}</th>
                      }
                      <th style="background:#16A34A">Total Hrs</th>
                      <th style="background:#0F2440">Util %</th>
                      <th style="background:#0F2440">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (weeklyFilteredResources().length === 0) {
                      <tr>
                        <td [attr.colspan]="weeklyTopProjects().length + 7" class="table-empty" style="text-align:center; padding:2rem; color:#94A3B8;">
                          <i class="pi pi-inbox" style="font-size:1.5rem; display:block; margin-bottom:0.5rem;"></i>
                          No resources match your filter.
                        </td>
                      </tr>
                    }
                    @for (res of weeklyFilteredResources(); track res.user_id) {
                      <tr [class.tr-zero]="res.total_hours === 0">
                        <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                        <td class="td-name">
                          <div class="emp-name">{{ res.user_name }}</div>
                          <div style="font-size:0.7rem; color:#94A3B8;">{{ res.b_unit }}</div>
                        </td>
                        <td class="td-num" [class.is-leave]="res.leave_hours > 0">
                          {{ res.leave_hours || '—' }}
                        </td>
                        <td class="td-num" [class.is-pmo]="res.pmo_hours > 0">
                          {{ res.pmo_hours || '—' }}
                        </td>
                        @for (p of weeklyTopProjects(); track p) {
                          <td class="td-num" [class.has-val]="getProjectHours(res, p) > 0">
                            {{ getProjectHours(res, p) || '—' }}
                          </td>
                        }
                        <td>
                          <div class="total-bar-cell">
                            <div class="total-bar-track">
                              <div class="total-bar-fill"
                                [class.fill-good]="res.total_hours >= 40"
                                [class.fill-mid]="res.total_hours >= 20 && res.total_hours < 40"
                                [class.fill-low]="res.total_hours < 20"
                                [style.width]="Math.min((res.total_hours / 45) * 100, 100) + '%'">
                              </div>
                            </div>
                            <span class="total-val"
                              [class.low]="res.total_hours < 20"
                              [class.good]="res.total_hours >= 40">
                              {{ res.total_hours }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span class="util-pct"
                            [class.low]="utilPct(res.total_hours, 45) < 50"
                            [class.mid]="utilPct(res.total_hours, 45) >= 50 && utilPct(res.total_hours, 45) < 80"
                            [class.good]="utilPct(res.total_hours, 45) >= 80">
                            {{ utilPct(res.total_hours, 45) }}%
                          </span>
                        </td>
                        <td>
                          <span class="status-pill" [class]="statusClass(res.status)">
                            {{ res.status || 'Draft' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="td-label" colspan="2">Grand Total</td>
                      <td>{{ weeklyColumnTotal('leave') || '' }}</td>
                      <td>{{ weeklyColumnTotal('pmo') || '' }}</td>
                      @for (p of weeklyTopProjects(); track p) {
                        <td>{{ weeklyProjectTotal(p) || '' }}</td>
                      }
                      <td>{{ weeklyData()!.total_hours }}</td>
                      <td>{{ weeklyUtilPct() }}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Project Breakdown bars (matches Master Data project rows) -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">Project Breakdown — Top 15</span>
                <span class="section-sub">{{ weeklyData()!.project_summary.length }} active projects</span>
              </div>
              <div style="padding: 1rem 1.25rem;">
                <div class="proj-breakdown">
                  @for (p of weeklyData()!.project_summary.slice(0, 15); track p.project) {
                    <div class="pb-row">
                      <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                      <div class="pb-bar-wrap">
                        <div class="pb-bar"
                          [style.width]="(p.total_hours / weeklyData()!.total_hours * 100) + '%'">
                        </div>
                      </div>
                      <span class="pb-val">{{ p.total_hours }}h</span>
                      <span class="pb-pct">{{ +(p.total_hours / weeklyData()!.total_hours * 100).toFixed(1) }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>

          } @else if (loading()) {
            <div class="skeleton-wrap">
              @for (i of [1,2,3,4,5,6]; track i) { <p-skeleton height="2.5rem" /> }
            </div>
          } @else {
            <div class="empty-state">
              <i class="pi pi-calendar-times"></i>
              <p>Select a week above to generate the report.</p>
            </div>
          }
        </div>
      </p-tabpanel>

      <!-- ════════════════ MONTHLY ════════════════ -->
      <p-tabpanel value="1">
        <div class="tab-content">

          <div class="controls-row">
            <div class="ctrl-group">
              <span class="ctrl-label">Year</span>
              <p-select [options]="yearOptions" [(ngModel)]="selectedYear"
                optionLabel="label" optionValue="value" (ngModelChange)="loadMonthlyReport()" />
            </div>
            <div class="ctrl-group">
              <span class="ctrl-label">Month</span>
              <p-select [options]="monthOptions" [(ngModel)]="selectedMonth"
                optionLabel="label" optionValue="value" (ngModelChange)="loadMonthlyReport()" />
            </div>
            <div class="ctrl-spacer"></div>
            <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
              [outlined]="true" (onClick)="exportMonthly()" [loading]="exporting()" />
          </div>

          @if (monthlyData()) {
            <div class="summary-strip">
              <div class="sum-card sum-blue">
                <div class="sum-icon"><i class="pi pi-users"></i></div>
                <div>
                  <div class="sum-val">{{ monthlyData()!.resources.length }}</div>
                  <div class="sum-lbl">Resources</div>
                </div>
              </div>
              <div class="sum-card sum-green">
                <div class="sum-icon"><i class="pi pi-clock"></i></div>
                <div>
                  <div class="sum-val">{{ monthlyData()!.grand_total | number:'1.0-0' }}</div>
                  <div class="sum-lbl">Total Hours</div>
                  <div class="sum-sub">{{ monthlyData()!.month_name }}</div>
                </div>
              </div>
              <div class="sum-card sum-purple">
                <div class="sum-icon"><i class="pi pi-calendar"></i></div>
                <div>
                  <div class="sum-val">{{ monthlyWeekLabels().length }}</div>
                  <div class="sum-lbl">Weeks</div>
                </div>
              </div>
              <div class="sum-card sum-orange">
                <div class="sum-icon"><i class="pi pi-percentage"></i></div>
                <div>
                  <div class="sum-val">{{ monthlyAvgUtil() }}%</div>
                  <div class="sum-lbl">Avg Utilization</div>
                </div>
              </div>
            </div>

            <!-- Monthly table: Resource | Week1 | Week2 | ... | Total -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">{{ monthlyData()!.month_name }} — Week-wise Breakdown</span>
              </div>
              <div class="report-table-wrap">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th class="th-emp">Emp ID</th>
                      <th class="th-name">Name</th>
                      <th style="text-align:left">BU</th>
                      @for (w of monthlyWeekLabels(); track w) {
                        <th>{{ w }}</th>
                      }
                      <th style="background:#16A34A">Total</th>
                      <th style="background:#0F2440">Util %</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (res of monthlyData()!.resources; track res.user_id) {
                      <tr [class.tr-zero]="res.total_hours === 0">
                        <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                        <td class="td-name"><div class="emp-name">{{ res.user_name }}</div></td>
                        <td style="font-size:0.75rem; color:#64748B;">{{ res.b_unit }}</td>
                        @for (w of monthlyWeekLabels(); track w) {
                          <td class="td-num" [class.has-val]="res.weeks[w] > 0">
                            {{ res.weeks[w] || '—' }}
                          </td>
                        }
                        <td>
                          <span class="total-val"
                            [class.low]="res.total_hours < (monthlyWeekLabels().length * 20)"
                            [class.good]="res.total_hours >= (monthlyWeekLabels().length * 40)">
                            {{ res.total_hours }}
                          </span>
                        </td>
                        <td>
                          <span class="util-pct"
                            [class.low]="utilPct(res.total_hours, monthlyWeekLabels().length * 45) < 50"
                            [class.mid]="utilPct(res.total_hours, monthlyWeekLabels().length * 45) >= 50 && utilPct(res.total_hours, monthlyWeekLabels().length * 45) < 80"
                            [class.good]="utilPct(res.total_hours, monthlyWeekLabels().length * 45) >= 80">
                            {{ utilPct(res.total_hours, monthlyWeekLabels().length * 45) }}%
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="td-label" colspan="3">Week Totals</td>
                      @for (w of monthlyWeekLabels(); track w) {
                        <td>{{ monthlyWeekTotal(w) || '' }}</td>
                      }
                      <td>{{ monthlyData()!.grand_total }}</td>
                      <td>{{ monthlyAvgUtil() }}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          } @else if (loading()) {
            <div class="skeleton-wrap">
              @for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }
            </div>
          }
        </div>
      </p-tabpanel>

      <!-- ════════════════ YEARLY ════════════════ -->
      <p-tabpanel value="2">
        <div class="tab-content">

          <div class="controls-row">
            <div class="ctrl-group">
              <span class="ctrl-label">Year</span>
              <p-select [options]="yearOptions" [(ngModel)]="selectedYear"
                optionLabel="label" optionValue="value" (ngModelChange)="loadYearlyReport()" />
            </div>
            <div class="ctrl-spacer"></div>
            <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
              [outlined]="true" (onClick)="exportYearly()" [loading]="exporting()" />
          </div>

          @if (yearlyData()) {
            <!-- Monthly totals bar chart (matches Master Data month columns) -->
            <div class="chart-wrap">
              <div class="chart-title">Monthly Hours — {{ selectedYear }}</div>
              <p-chart type="bar" [data]="yearlyChartData()" [options]="yearlyChartOptions" height="180px" />
            </div>

            <div class="summary-strip">
              <div class="sum-card sum-blue">
                <div class="sum-icon"><i class="pi pi-users"></i></div>
                <div>
                  <div class="sum-val">{{ yearlyData()!.resources.length }}</div>
                  <div class="sum-lbl">Resources</div>
                </div>
              </div>
              <div class="sum-card sum-green">
                <div class="sum-icon"><i class="pi pi-clock"></i></div>
                <div>
                  <div class="sum-val">{{ yearlyData()!.grand_total | number:'1.0-0' }}</div>
                  <div class="sum-lbl">Total Hours {{ selectedYear }}</div>
                </div>
              </div>
              <div class="sum-card sum-purple">
                <div class="sum-icon"><i class="pi pi-dollar"></i></div>
                <div>
                  <div class="sum-val">{{ yearlyBillableTotal() | number:'1.0-0' }}</div>
                  <div class="sum-lbl">Billable Hours</div>
                </div>
              </div>
              <div class="sum-card sum-orange">
                <div class="sum-icon"><i class="pi pi-percentage"></i></div>
                <div>
                  <div class="sum-val">{{ yearlyBillablePct() }}%</div>
                  <div class="sum-lbl">Billable %</div>
                </div>
              </div>
            </div>

            <!-- Yearly table: Resource | Jan | Feb | ... | Dec | Total | Billable -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">Yearly Utilization {{ selectedYear }}</span>
                <span class="section-sub">Month-wise breakdown — matches Master Data report</span>
              </div>
              <div class="report-table-wrap">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th class="th-emp">Emp ID</th>
                      <th class="th-name">Name</th>
                      <th style="text-align:left">BU</th>
                      @for (m of months; track m) {
                        <th>{{ m }}</th>
                      }
                      <th style="background:#16A34A">Total</th>
                      <th style="background:#0284C7">Billable</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (res of yearlyData()!.resources; track res.user_id) {
                      <tr [class.tr-zero]="res.total_hours === 0">
                        <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                        <td class="td-name"><div class="emp-name">{{ res.user_name }}</div></td>
                        <td style="font-size:0.75rem; color:#64748B;">{{ res.b_unit }}</td>
                        @for (m of months; track m) {
                          <td class="td-num" [class.has-val]="res.monthly[m] > 0">
                            {{ res.monthly[m] || '—' }}
                          </td>
                        }
                        <td>
                          <span class="total-val" [class.good]="res.total_hours > 0">
                            {{ res.total_hours }}
                          </span>
                        </td>
                        <td>
                          <span style="color:#16A34A; font-weight:700; font-size:0.82rem;">
                            {{ res.billable_hours }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="td-label" colspan="3">Monthly Totals</td>
                      @for (m of months; track m) {
                        <td>{{ yearlyData()!.monthly_totals[m] || '' }}</td>
                      }
                      <td>{{ yearlyData()!.grand_total }}</td>
                      <td>{{ yearlyBillableTotal() }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          } @else if (loading()) {
            <div class="skeleton-wrap">
              @for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }
            </div>
          }
        </div>
      </p-tabpanel>

      <!-- ════════════════ CUSTOM RANGE ════════════════ -->
      <p-tabpanel value="3">
        <div class="tab-content">

          <div class="controls-row">
            <div class="ctrl-group">
              <span class="ctrl-label">From Date</span>
              <p-datepicker [(ngModel)]="customFrom" view="date"
                placeholder="Start date" dateFormat="dd/mm/yy" />
            </div>
            <div class="ctrl-group">
              <span class="ctrl-label">To Date</span>
              <p-datepicker [(ngModel)]="customTo" view="date"
                placeholder="End date" dateFormat="dd/mm/yy" />
            </div>
            <p-button icon="pi pi-search" label="Generate" styleClass="gen-btn"
              (onClick)="loadCustomReport()" [loading]="loading()" />
            <div class="ctrl-spacer"></div>
            <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
              [outlined]="true" (onClick)="exportCustom()" [loading]="exporting()"
              [disabled]="!customData()" />
          </div>

          @if (customData(); as cd) {
            <div class="range-badge">
              <i class="pi pi-calendar-range"></i>
              {{ cd.date_range }}
              <span class="week-chip">{{ cd.week_labels.length }} week(s)</span>
            </div>

            <div class="summary-strip">
              <div class="sum-card sum-blue">
                <div class="sum-icon"><i class="pi pi-users"></i></div>
                <div>
                  <div class="sum-val">{{ cd.resources.length }}</div>
                  <div class="sum-lbl">Resources</div>
                </div>
              </div>
              <div class="sum-card sum-green">
                <div class="sum-icon"><i class="pi pi-clock"></i></div>
                <div>
                  <div class="sum-val">{{ cd.total_hours | number:'1.0-0' }}</div>
                  <div class="sum-lbl">Total Hours</div>
                </div>
              </div>
              <div class="sum-card sum-purple">
                <div class="sum-icon"><i class="pi pi-briefcase"></i></div>
                <div>
                  <div class="sum-val">{{ cd.project_summary.length }}</div>
                  <div class="sum-lbl">Projects</div>
                </div>
              </div>
              <div class="sum-card sum-orange">
                <div class="sum-icon"><i class="pi pi-percentage"></i></div>
                <div>
                  <div class="sum-val">{{ customUtilPct() }}%</div>
                  <div class="sum-lbl">Avg Utilization</div>
                </div>
              </div>
            </div>

            <!-- Resource table for custom range -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">Resource-wise — {{ cd.date_range }}</span>
              </div>
              <div class="report-table-wrap">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th class="th-emp">Emp ID</th>
                      <th class="th-name">Name</th>
                      <th style="text-align:left">BU</th>
                      <th style="background:#16A34A">Total Hours</th>
                      <th style="background:#0F2440">Util %</th>
                      <th style="text-align:left; background:#0F2440">Top Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (res of cd.resources; track res.user_id) {
                      <tr [class.tr-zero]="res.total_hours === 0">
                        <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                        <td class="td-name"><div class="emp-name">{{ res.user_name }}</div></td>
                        <td style="font-size:0.75rem; color:#64748B;">{{ res.b_unit }}</td>
                        <td>
                          <div class="total-bar-cell">
                            <div class="total-bar-track">
                              <div class="total-bar-fill"
                                [class.fill-good]="res.total_hours >= cd.week_labels.length * 40"
                                [class.fill-mid]="res.total_hours >= cd.week_labels.length * 20 && res.total_hours < cd.week_labels.length * 40"
                                [class.fill-low]="res.total_hours < cd.week_labels.length * 20"
                                [style.width]="Math.min((res.total_hours / (cd.week_labels.length * 45)) * 100, 100) + '%'">
                              </div>
                            </div>
                            <span class="total-val"
                              [class.low]="res.total_hours < cd.week_labels.length * 20"
                              [class.good]="res.total_hours >= cd.week_labels.length * 40">
                              {{ res.total_hours }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span class="util-pct"
                            [class.low]="utilPct(res.total_hours, cd.week_labels.length * 45) < 50"
                            [class.mid]="utilPct(res.total_hours, cd.week_labels.length * 45) >= 50 && utilPct(res.total_hours, cd.week_labels.length * 45) < 80"
                            [class.good]="utilPct(res.total_hours, cd.week_labels.length * 45) >= 80">
                            {{ utilPct(res.total_hours, cd.week_labels.length * 45) }}%
                          </span>
                        </td>
                        <td>
                          <div style="display:flex; flex-wrap:wrap; gap:3px;">
                            @for (p of res.projects.slice(0,4); track p.project_name) {
                              <span style="font-size:0.68rem; background:#EEF2FF; color:#4338CA; padding:2px 6px; border-radius:10px; white-space:nowrap;">
                                {{ p.project_name }}: {{ p.hours }}h
                              </span>
                            }
                            @if (res.projects.length > 4) {
                              <span style="font-size:0.68rem; background:#F1F5F9; color:#64748B; padding:2px 6px; border-radius:10px;">
                                +{{ res.projects.length - 4 }}
                              </span>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="td-label" colspan="3">Grand Total</td>
                      <td>{{ cd.total_hours }}</td>
                      <td>{{ customUtilPct() }}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Project breakdown -->
            <div class="section-card">
              <div class="section-header">
                <span class="section-title">Project Breakdown — Top 15</span>
              </div>
              <div style="padding:1rem 1.25rem;">
                <div class="proj-breakdown">
                  @for (p of cd.project_summary.slice(0, 15); track p.project) {
                    <div class="pb-row">
                      <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                      <div class="pb-bar-wrap">
                        <div class="pb-bar" [style.width]="(p.total_hours / cd.total_hours * 100) + '%'"></div>
                      </div>
                      <span class="pb-val">{{ p.total_hours }}h</span>
                      <span class="pb-pct">{{ +(p.total_hours / cd.total_hours * 100).toFixed(1) }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>

          } @else if (loading()) {
            <div class="skeleton-wrap">
              @for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }
            </div>
          } @else {
            <div class="empty-state">
              <i class="pi pi-sliders-h"></i>
              <p>Select a date range and click <strong>Generate</strong>.</p>
            </div>
          }
        </div>
      </p-tabpanel>

    </p-tabpanels>
  </p-tabs>
</div>
</p-card>

  `
})
export class ReportsComponent implements OnInit {
  Math = Math;
  loading   = signal(false);
  exporting = signal(false);
  activeTab = '0';

  // Weekly
  weeklyDate    = new Date();
  weeklyData    = signal<any>(null);
  weeklySearch  = '';
  weeklyFiltered = signal<any[]>([]);

  // Monthly / Yearly
  selectedYear  = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  monthlyData   = signal<any>(null);
  yearlyData    = signal<any>(null);

  // Custom
  customFrom: Date | null = null;
  customTo:   Date | null = null;
  customData  = signal<any>(null);

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: y.toString(), value: y };
  });
  monthOptions = this.months.map((m, i) => ({ label: m, value: i + 1 }));

  constructor(
    private reportsService: ReportsService,
    private authService: AuthenticationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() { this.loadWeeklyReport(); }

  onTabChange(v: string | number) {
    const s = String(v);
    if (s === '1' && !this.monthlyData()) this.loadMonthlyReport();
    if (s === '2' && !this.yearlyData())  this.loadYearlyReport();
  }

  // ── Weekly ──────────────────────────────────────────────────────────────────
  weekStartIso(): string {
    const d = new Date(this.weeklyDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d.toISOString().split('T')[0];
  }

  loadWeeklyReport() {
    this.loading.set(true);
    this.weeklyData.set(null);
    this.weeklyFiltered.set([]);
    this.reportsService.getWeeklyReport(this.weekStartIso()).subscribe({
      next: (data) => {
        this.weeklyData.set(data);
        this.weeklyFiltered.set(data.resources ?? []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast('error', 'Failed to load weekly report'); },
    });
  }

  filterWeekly() {
    const term = this.weeklySearch.toLowerCase();
    const all  = this.weeklyData()?.resources ?? [];
    this.weeklyFiltered.set(term
      ? all.filter((r: any) =>
          r.user_name?.toLowerCase().includes(term) ||
          r.yash_id?.toLowerCase().includes(term)   ||
          r.b_unit?.toLowerCase().includes(term))
      : all
    );
  }

  weeklyFilteredResources = computed(() => this.weeklyFiltered());

  // Top 8 projects by hours for the column display (matches Excel project columns)
  weeklyTopProjects = computed((): string[] => {
    const d = this.weeklyData();
    if (!d?.project_summary) return [];
    return d.project_summary
      .filter((p: any) => p.project !== 'Leave' && p.project !== 'PMO')
      .slice(0, 8)
      .map((p: any) => p.project);
  });

  getProjectHours(res: any, projectName: string): number {
    const p = res.projects?.find((x: any) => x.project_name === projectName);
    return p?.hours ?? 0;
  }

  weeklyProjectTotal(projectName: string): number {
    return this.weeklyFiltered().reduce((s: number, r: any) => s + this.getProjectHours(r, projectName), 0);
  }

  weeklyColumnTotal(type: 'leave' | 'pmo'): number {
    return this.weeklyFiltered().reduce((s: number, r: any) => {
      const key = type === 'leave' ? 'leave_hours' : 'pmo_hours';
      return s + (r[key] || 0);
    }, 0);
  }

  weeklyUtilPct(): number {
    const d   = this.weeklyData();
    const res = this.weeklyFiltered();
    if (!d || !res.length) return 0;
    const active = res.filter((r: any) => r.total_hours > 0);
    if (!active.length) return 0;
    return Math.round(active.reduce((s: number, r: any) => s + (r.total_hours / 45) * 100, 0) / active.length);
  }

  weeklyZeroCount(): number {
    return (this.weeklyData()?.resources ?? []).filter((r: any) => !r.total_hours).length;
  }

  exportWeekly() {
    this.exporting.set(true);
    this.reportsService.exportWeekly(this.weekStartIso()).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Weekly_Utilization_${this.weekStartIso()}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Monthly ─────────────────────────────────────────────────────────────────
  loadMonthlyReport() {
    this.loading.set(true);
    this.monthlyData.set(null);
    this.reportsService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next:  (data) => { this.monthlyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load monthly report'); },
    });
  }

  monthlyWeekLabels(): string[] {
    const d = this.monthlyData();
    if (!d) return [];
    if (d.week_labels) return d.week_labels;
    const all = new Set<string>();
    (d.resources ?? []).forEach((r: any) => Object.keys(r.weeks || {}).forEach((w: string) => all.add(w)));
    return Array.from(all).sort();
  }

  monthlyWeekTotal(week: string): number {
    return (this.monthlyData()?.resources ?? [])
      .reduce((s: number, r: any) => s + (r.weeks?.[week] || 0), 0);
  }

  monthlyAvgUtil(): number {
    const d = this.monthlyData();
    if (!d) return 0;
    const wks  = this.monthlyWeekLabels().length || 1;
    const res  = (d.resources ?? []).filter((r: any) => r.total_hours > 0);
    if (!res.length) return 0;
    return Math.round(res.reduce((s: number, r: any) => s + (r.total_hours / (wks * 45)) * 100, 0) / res.length);
  }

  exportMonthly() {
    this.exporting.set(true);
    this.reportsService.exportMonthly(this.selectedYear, this.selectedMonth).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Monthly_Utilization_${this.selectedYear}_${this.selectedMonth}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Yearly ──────────────────────────────────────────────────────────────────
  loadYearlyReport() {
    this.loading.set(true);
    this.yearlyData.set(null);
    this.reportsService.getYearlyReport(this.selectedYear).subscribe({
      next:  (data) => { this.yearlyData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load yearly report'); },
    });
  }

  yearlyBillableTotal(): number {
    return (this.yearlyData()?.resources ?? []).reduce((s: number, r: any) => s + (r.billable_hours || 0), 0);
  }
  yearlyBillablePct(): number {
    const d = this.yearlyData();
    if (!d || !d.grand_total) return 0;
    return Math.round((this.yearlyBillableTotal() / d.grand_total) * 100);
  }

  yearlyChartData() {
    const d = this.yearlyData();
    if (!d) return {};
    return {
      labels: this.months,
      datasets: [
        {
          label: 'Billable',
          data: this.months.map(m => d.monthly_totals?.[m] || 0),
          backgroundColor: '#16A34A', borderRadius: 4, stack: 'A',
        },
      ],
    };
  }

  yearlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} hrs` } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  exportYearly() {
    this.exporting.set(true);
    this.reportsService.exportYearly(this.selectedYear).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Yearly_Utilization_${this.selectedYear}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Custom Range ─────────────────────────────────────────────────────────────
  loadCustomReport() {
    if (!this.customFrom || !this.customTo) { this.toast('warn', 'Select both dates.'); return; }
    if (this.customFrom > this.customTo) { this.toast('warn', '"From" must be before "To".'); return; }
    this.loading.set(true);
    this.customData.set(null);
    this.reportsService.getCustomReport(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (data) => { this.customData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load custom report'); },
    });
  }

  customUtilPct(): number {
    const d = this.customData();
    if (!d?.resources?.length || !d.week_labels?.length) return 0;
    const maxHrs = 45 * d.week_labels.length;
    const active = d.resources.filter((r: any) => r.total_hours > 0);
    if (!active.length) return 0;
    return Math.round(active.reduce((s: number, r: any) => s + (r.total_hours / maxHrs) * 100, 0) / active.length);
  }

  exportCustom() {
    if (!this.customFrom || !this.customTo) return;
    this.exporting.set(true);
    this.reportsService.exportCustom(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Custom_Utilization_${this.toIso(this.customFrom!)}_to_${this.toIso(this.customTo!)}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Shared helpers ───────────────────────────────────────────────────────────
  utilPct(hours: number, scheduled: number): number {
    if (!scheduled) return 0;
    return Math.round((hours / scheduled) * 100);
  }

  statusClass(status: string): string {
    if (status === 'Approved')  return 'status-pill status-approved';
    if (status === 'Submitted') return 'status-pill status-submitted';
    if (status === 'Rejected')  return 'status-pill status-rejected';
    return 'status-pill status-draft';
  }

  toIso(d: Date): string { return d.toISOString().split('T')[0]; }

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