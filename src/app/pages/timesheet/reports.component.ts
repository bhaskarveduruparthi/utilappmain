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
import { Card }             from 'primeng/card';

import { ReportsService }        from '../service/report.service';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    TabsModule, ButtonModule, TableModule, TagModule,
    DatePickerModule, SkeletonModule, ToastModule,
    ChartModule, SelectModule, InputTextModule, TooltipModule,
    Card,
  ],
  providers: [MessageService, ReportsService, AuthenticationService],
  styles: [`
    /* ─── Shell ─── */
    .rpt-page { padding: 1.5rem 2rem; max-width: 1800px; margin: 0 auto; }
    .page-title { font-size: 1.45rem; font-weight: 800; color: #0F172A; margin: 0 0 .15rem; letter-spacing: -.02em; }
    .page-sub { font-size: .81rem; color: #64748B; }
    .tab-content { padding: 1.5rem 0 0; }

    /* ─── Sub-tabs (section navigation within a period) ─── */
    .sub-tabs .p-tablist-tab-list { gap: .25rem; border-bottom-color:#E2E8F0; }
    .sub-tabs .p-tab {
      font-size: .78rem; font-weight: 600; color:#64748B;
      padding: .55rem 1rem; border-radius: 8px 8px 0 0;
    }
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

    /* ─── Report table (matches Excel layout exactly) ─── */
    .report-table-wrap { overflow-x: auto; }
    .report-table { width:100%; border-collapse:collapse; font-size:.8rem; min-width:900px; line-height:1.4; }

    /* Top header */
    .report-table thead tr.tr-header th {
      background: #1E3A5F; color: white;
      padding:.625rem .75rem; text-align:center;
      font-weight:600; font-size:.75rem; white-space:nowrap;
      border-right:1px solid rgba(255,255,255,.15);
    }
    .report-table thead tr.tr-header th.th-left { text-align:left; }

    /* Manager group row */
    .report-table tbody tr.tr-manager td {
      background: #EAF0FA; font-weight:700; color:#1E3A5F;
      padding:.6rem .75rem; font-size:.83rem;
    }

    /* Project sub-rows */
    .report-table tbody tr.tr-proj { border-bottom:1px solid #F1F5F9; }
    .report-table tbody tr.tr-proj:hover { background:#F8FAFC; }
    .report-table tbody tr.tr-proj td { padding:.48rem .75rem; vertical-align:middle; border-right:1px solid #F8FAFC; }

    /* Plain body rows (Monthly / Yearly week & month columns) — same padding
       contract as tr-proj so numeric cells never run together */
    .report-table tbody tr.tr-plain { border-bottom:1px solid #F1F5F9; }
    .report-table tbody tr.tr-plain:hover { background:#F8FAFC; }
    .report-table tbody tr.tr-plain td { padding:.55rem .75rem; vertical-align:middle; border-right:1px solid #F8FAFC; }
    .report-table tbody tr.tr-plain td:first-child { font-weight:600; }

    /* Totals row per group */
    .report-table tbody tr.tr-group-total td {
      background:#CFDEF3; color:#0F2440; font-weight:700; padding:.55rem .75rem;
    }

    /* Grand total footer */
    .report-table tfoot tr { background:#1E3A5F; }
    .report-table tfoot td { padding:.6rem .75rem; color:white; font-weight:700; font-size:.79rem; text-align:right; font-variant-numeric:tabular-nums; }
    .report-table tfoot td.td-label { text-align:left; }

    /* Numeric cells */
    .td-num { text-align:right; font-variant-numeric:tabular-nums; font-size:.79rem; }
    .td-num.has-val { font-weight:700; color:#1E3A5F; }
    .td-name-left { text-align:left; }
    .td-center { text-align:center; }

    /* IRM Wise table */
    .irm-table { width:100%; border-collapse:collapse; font-size:.81rem; line-height:1.4; }
    .irm-table thead th { background:#F8FAFC; padding:.6rem .875rem; text-align:left; font-weight:600; color:#475569; border-bottom:2px solid #E2E8F0; }
    .irm-table thead th.th-r { text-align:right; }
    .irm-table tbody tr { border-bottom:1px solid #F1F5F9; }
    .irm-table tbody tr:hover { background:#F8FAFC; }
    .irm-table tbody td { padding:.52rem .875rem; vertical-align:middle; }
    .irm-table tbody td.td-r { text-align:right; font-variant-numeric:tabular-nums; font-weight:700; color:#1E3A5F; }
    .irm-table tfoot tr { background:#1E3A5F; }
    .irm-table tfoot td { padding:.6rem .875rem; color:white; font-weight:700; text-align:right; }
    .irm-table tfoot td.td-label { text-align:left; }

    /* Resource table */
    .res-table { width:100%; border-collapse:collapse; font-size:.78rem; min-width:800px; line-height:1.4; }
    .res-table thead th { background:#1E3A5F; color:white; padding:.55rem .7rem; font-size:.74rem; font-weight:600; white-space:nowrap; border-right:1px solid rgba(255,255,255,.15); text-align:center; }
    .res-table thead th:first-child,.res-table thead th:nth-child(2) { text-align:left; }
    .res-table tbody tr { border-bottom:1px solid #F1F5F9; }
    .res-table tbody tr:hover { background:#F8FAFC; }
    .res-table tbody td { padding:.46rem .7rem; border-right:1px solid #F8FAFC; }
    .res-table tbody td.td-num { text-align:right; font-variant-numeric:tabular-nums; }
    .res-table tbody td.td-num.has-val { font-weight:700; color:#1E3A5F; }

    /* Grand Total footer — was unstyled (no tfoot rule existed for .res-table
       at all), so it rendered with browser-default padding/alignment/background
       instead of matching the header, which is what made it look broken. */
    .res-table tfoot tr { background:#1E3A5F; }
    .res-table tfoot td {
      padding:.65rem .7rem; color:white; font-weight:700; font-size:.79rem;
      text-align:right; font-variant-numeric:tabular-nums;
      border-right:1px solid rgba(255,255,255,.12);
    }
    .res-table tfoot td.td-label { text-align:left; }
    .res-table tfoot td.td-center { text-align:center; }

    /* Total bar */
    .total-bar-cell { display:flex; align-items:center; gap:.5rem; min-width:90px; }
    .total-bar-track { flex:1; height:5px; background:#E2E8F0; border-radius:3px; overflow:hidden; }
    .total-bar-fill  { height:100%; border-radius:3px; }
    .fill-good  { background:#16A34A; }
    .fill-mid   { background:#1E3A5F; }
    .fill-low   { background:#EF4444; }
    .total-val  { font-size:.82rem; font-weight:700; min-width:28px; text-align:right; }
    .total-val.low  { color:#DC2626; }
    .total-val.good { color:#16A34A; }

    /* Util % pill */
    .util-pct { font-size:.75rem; font-weight:600; }
    .util-pct.low  { color:#DC2626; }
    .util-pct.mid  { color:#D97706; }
    .util-pct.good { color:#16A34A; }

    /* Status pill */
    .status-pill { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:.68rem; font-weight:700; text-transform:uppercase; }
    .status-approved  { background:#DCFCE7; color:#166534; }
    .status-submitted { background:#DBEAFE; color:#1E40AF; }
    .status-rejected  { background:#FEE2E2; color:#991B1B; }
    .status-draft     { background:#F1F5F9; color:#475569; }

    /* Emp ID badge */
    .emp-id-badge { font-family:monospace; font-size:.74rem; background:#EFF6FF; color:#1E40AF; padding:2px 6px; border-radius:4px; font-weight:600; }
    .emp-name { font-weight:600; color:#0F172A; font-size:.82rem; }

    /* Project bars */
    .proj-breakdown { display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0; }
    .pb-row { display:flex; align-items:center; gap:.75rem; }
    .pb-name { min-width:240px; font-size:.79rem; color:#374151; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .pb-bar-wrap { flex:1; height:7px; background:#F1F5F9; border-radius:4px; overflow:hidden; }
    .pb-bar { height:100%; background:linear-gradient(90deg,#1E3A5F,#3B82F6); border-radius:4px; transition:width .6s ease; }
    .pb-val { min-width:44px; text-align:right; font-size:.79rem; font-weight:700; color:#374151; }
    .pb-pct { min-width:38px; text-align:right; font-size:.72rem; color:#94A3B8; }

    /* Yearly chart */
    .chart-wrap { background:white; border:1px solid #E2E8F0; border-radius:14px; padding:1.25rem; margin-bottom:1.5rem; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
    .chart-title { font-size:.82rem; font-weight:700; color:#374151; margin:0 0 .875rem; }

    /* Empty / skeleton */
    .empty-state { text-align:center; padding:3rem; color:#94A3B8; }
    .empty-state i { font-size:2.5rem; display:block; margin-bottom:.75rem; }
    .empty-state p { font-size:.87rem; }
    .skeleton-wrap { padding:.5rem; display:flex; flex-direction:column; gap:.5rem; }

    /* Range badge */
    .range-badge { display:inline-flex; align-items:center; gap:.5rem; background:#EFF6FF; color:#1E40AF; padding:.35rem .875rem; border-radius:20px; font-size:.79rem; font-weight:600; margin-bottom:1rem; }
    .range-badge .week-chip { background:#DBEAFE; padding:1px 7px; border-radius:10px; font-size:.72rem; }

    /* Search input */
    .search-input-wrap { display:flex; align-items:center; background:white; border:1px solid #E2E8F0; border-radius:8px; padding:0 .75rem; gap:.4rem; transition:border-color .15s; }
    .search-input-wrap:focus-within { border-color:#1E3A5F; }
    .search-input-wrap i { color:#94A3B8; font-size:.85rem; }
    .s-input { border:none; outline:none; font-size:.82rem; padding:.42rem 0; min-width:180px; background:transparent; color:#0F172A; }

    /* Tab icons */
    .tab-icon { margin-right:.3rem; }

    @media (max-width: 1024px) { .rpt-page { padding:1rem; } }
    @media (max-width: 640px)  { .controls-row { flex-direction:column; align-items:stretch; } .pb-name { min-width:120px; } }
  `],
  template: `
<p-card>
  <p-toast position="top-right" />

  <div class="rpt-page">
    <div class="page-header" style="margin-bottom:1.25rem;">
      <h1 class="page-title">Utilization Report</h1>
      <p class="page-sub">Resource utilization data across different time periods</p>
    </div>

    <p-tabs [(value)]="activeTab" (valueChange)="onTabChange($event)">
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
                <p-datepicker [(ngModel)]="weeklyDate" view="date" [showWeek]="true"
                  placeholder="Pick a date in the week" (ngModelChange)="loadWeeklyReport()" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">Filter Resource / Manager</span>
                <div class="search-input-wrap">
                  <i class="pi pi-search"></i>
                  <input class="s-input" type="text" placeholder="Name / Emp ID / Manager…"
                    [(ngModel)]="weeklySearch" (ngModelChange)="filterWeekly()" />
                </div>
              </div>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportWeekly()" [loading]="exporting()" [disabled]="!weeklyData()" />
            </div>

            @if (weeklyData()) {
              <!-- Summary -->
              <div class="summary-strip">
                <div class="sum-card sum-blue">
                  <div class="sum-icon"><i class="pi pi-users"></i></div>
                  <div><div class="sum-val">{{ weeklyData()!.resources.length }}</div><div class="sum-lbl">Resources</div></div>
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
                  <div><div class="sum-val">{{ weeklyData()!.project_summary.length }}</div><div class="sum-lbl">Projects</div></div>
                </div>
                <div class="sum-card sum-orange">
                  <div class="sum-icon"><i class="pi pi-percentage"></i></div>
                  <div>
                    <div class="sum-val">{{ weeklyUtilPct() }}%</div>
                    <div class="sum-lbl">Avg Utilization</div>
                    <div class="sum-sub">of 45h / week</div>
                  </div>
                </div>
                <div class="sum-card sum-red">
                  <div class="sum-icon"><i class="pi pi-user-minus"></i></div>
                  <div><div class="sum-val">{{ weeklyZeroCount() }}</div><div class="sum-lbl">No Hours Logged</div></div>
                </div>
              </div>

              <p-tabs [(value)]="weeklySubTab" styleClass="sub-tabs">
                <p-tablist>
                  <p-tab value="0">Customer wise</p-tab>
                  <p-tab value="1">IRM Wise</p-tab>
                  <p-tab value="2">Resource wise</p-tab>
                  <p-tab value="3">Project Breakdown</p-tab>
                  @if (!isPlainUser) {
                  <p-tab value="4">Utilisation Statistics</p-tab>
                  <p-tab value="5">Non Filling</p-tab>
                  }
                </p-tablist>
                <p-tabpanels>

                  <!-- ── Sheet 1 equivalent: Customer wise (Manager → Projects) ── -->
                  <p-tabpanel value="0">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Customer wise — {{ weeklyData()!.week_label }}</span>
                        <span class="section-sub">Manager → Project breakdown · matches Excel Sheet 1</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="report-table">
                          <thead>
                            <tr class="tr-header">
                              <th class="th-left" style="min-width:220px;">Manager / Project</th>
                              <th style="min-width:110px;">{{ weeklyData()!.week_label }}</th>
                              <th style="min-width:110px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (grp of weeklyIRMGroups(); track grp.manager) {
                              <!-- Manager row -->
                              <tr class="tr-manager">
                                <td colspan="3">{{ grp.manager }}</td>
                              </tr>
                              <!-- Project rows -->
                              @for (proj of grp.projects; track proj.project) {
                                <tr class="tr-proj">
                                  <td class="td-name-left" style="padding-left:1.5rem;">{{ proj.project }}</td>
                                  <td class="td-num" [class.has-val]="proj.total_hours > 0">{{ proj.total_hours || '—' }}</td>
                                  <td class="td-num has-val">{{ proj.total_hours || '—' }}</td>
                                </tr>
                              }
                              <!-- Group total -->
                              <tr class="tr-group-total">
                                <td class="td-name-left">Total</td>
                                <td class="td-num">{{ grp.total }}</td>
                                <td class="td-num">{{ grp.total }}</td>
                              </tr>
                              <tr><td colspan="3" style="height:10px; background:#FFFFFF; border:none;"></td></tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Grand Weekly/Month Total</td>
                              <td>{{ weeklyData()!.total_hours }}</td>
                              <td>{{ weeklyData()!.total_hours }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <!-- ── Sheet 2 equivalent: IRM Wise ── -->
                  <p-tabpanel value="1">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">IRM Wise — {{ weeklyData()!.week_label }}</span>
                        <span class="section-sub">Manager-level summary · matches Excel IRM Wise sheet</span>
                      </div>
                      <div style="padding:0 0 .5rem;">
                        <table class="irm-table">
                          <thead>
                            <tr>
                              <th>Manager Name</th>
                              <th class="th-r">Week of {{ weeklyData()!.week_label }}</th>
                              <th class="th-r">Billable</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (irm of weeklyData()!.irm_summary; track irm.manager) {
                              <tr>
                                <td>{{ irm.manager }}</td>
                                <td class="td-r">{{ irm.total_hours || '—' }}</td>
                                <td class="td-r" style="color:#16A34A;">{{ irm.billable || '—' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Billable effort</td>
                              <td>{{ irmBillableTotal() }}</td>
                              <td>{{ irmBillableTotal() }}</td>
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
                        <span class="section-title">Resource wise — {{ weeklyData()!.week_label }}</span>
                        <span class="section-sub">
                          {{ weeklyFilteredResources().length }} of {{ weeklyData()!.resources.length }} resources
                        </span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU / IRM</th>
                              @for (p of weeklyTopProjects(); track p) { <th>{{ p }}</th> }
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                              <th style="background:#0F2440;">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if (weeklyFilteredResources().length === 0) {
                              <tr><td [attr.colspan]="weeklyTopProjects().length + 6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                            }
                            @for (res of weeklyFilteredResources(); track res.user_id) {
                              <tr [class.tr-zero]="res.total_hours === 0" style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                @for (p of weeklyTopProjects(); track p) {
                                  <td class="td-num" [class.has-val]="getProjectHours(res, p) > 0">{{ getProjectHours(res, p) || '—' }}</td>
                                }
                                <td>
                                  <div class="total-bar-cell">
                                    <div class="total-bar-track">
                                      <div class="total-bar-fill"
                                        [class.fill-good]="res.total_hours >= 40"
                                        [class.fill-mid]="res.total_hours >= 20 && res.total_hours < 40"
                                        [class.fill-low]="res.total_hours < 20"
                                        [style.width]="Math.min((res.total_hours/45)*100,100)+'%'">
                                      </div>
                                    </div>
                                    <span class="total-val" [class.low]="res.total_hours < 20" [class.good]="res.total_hours >= 40">{{ res.total_hours }}</span>
                                  </div>
                                </td>
                                <td class="td-center">
                                  <span class="util-pct"
                                    [class.low]="utilPct(res.total_hours,45) < 50"
                                    [class.mid]="utilPct(res.total_hours,45) >= 50 && utilPct(res.total_hours,45) < 80"
                                    [class.good]="utilPct(res.total_hours,45) >= 80">
                                    {{ utilPct(res.total_hours,45) }}%
                                  </span>
                                </td>
                                <td class="td-center"><span class="status-pill" [class]="statusClass(res.status)">{{ res.status || 'Draft' }}</span></td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label" colspan="3">Grand Total</td>
                              @for (p of weeklyTopProjects(); track p) { <td>{{ weeklyProjectTotal(p) || '' }}</td> }
                              <td>{{ weeklyFilteredTotal() }}</td>
                              <td>{{ weeklyUtilPct() }}%</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <!-- Project Breakdown bars -->
                  <p-tabpanel value="3">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Project Breakdown — Top 15</span>
                        <span class="section-sub">{{ weeklyData()!.project_summary.length }} active projects</span>
                      </div>
                      <div style="padding:1rem 1.25rem;">
                        <div class="proj-breakdown">
                          @for (p of weeklyData()!.project_summary.slice(0,15); track p.project) {
                            <div class="pb-row">
                              <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                              <div class="pb-bar-wrap">
                                <div class="pb-bar" [style.width]="(p.total_hours/weeklyData()!.total_hours*100)+'%'"></div>
                              </div>
                              <span class="pb-val">{{ p.total_hours }}h</span>
                              <span class="pb-pct">{{ +(p.total_hours/weeklyData()!.total_hours*100).toFixed(1) }}%</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  @if (!isPlainUser) {
                  <p-tabpanel value="4">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Utilisation Statistics — {{ weeklyData()!.week_label }}</span>
                        <span class="section-sub">Resources below {{ weeklyData()!.utilization_threshold_pct || 60 }}% utilisation · {{ (weeklyData()!.utilization_stats || []).length }} flagged</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th>Scheduled Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((weeklyData()!.utilization_stats || []).length === 0) {
                              <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources below threshold — everyone is well utilised.</td></tr>
                            }
                            @for (res of weeklyData()!.utilization_stats; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td class="td-num has-val">{{ res.total_hours }}</td>
                                <td class="td-num">{{ res.scheduled_hours }}</td>
                                <td class="td-center"><span class="util-pct low">{{ res.utilization_pct }}%</span></td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                  @if (!isPlainUser) {
                  <p-tabpanel value="5">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Non Filling — {{ weeklyData()!.week_label }}</span>
                        <span class="section-sub">Resources who have not submitted a timesheet for this period · {{ (weeklyData()!.non_filling || []).length }} resources</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th>IRM</th>
                              <th>IRM Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((weeklyData()!.non_filling || []).length === 0) {
                              <tr><td colspan="5" style="text-align:center; padding:2rem; color:#94A3B8;">Everyone has submitted their timesheet for this period.</td></tr>
                            }
                            @for (res of weeklyData()!.non_filling; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td><div class="emp-name">{{ res.user_name }}</div></td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm_email }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                </p-tabpanels>
              </p-tabs>

            } @else if (loading()) {
              <div class="skeleton-wrap">@for (i of [1,2,3,4,5,6]; track i) { <p-skeleton height="2.5rem" /> }</div>
            } @else {
              <div class="empty-state"><i class="pi pi-calendar-times"></i><p>Select a week above to generate the report.</p></div>
            }
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ MONTHLY ══════════════════════════ -->
        <p-tabpanel value="1">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">Year</span>
                <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" (ngModelChange)="loadMonthlyReport()" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">Month</span>
                <p-select [options]="monthOptions" [(ngModel)]="selectedMonth" optionLabel="label" optionValue="value" (ngModelChange)="loadMonthlyReport()" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">Filter Resource / Manager</span>
                <div class="search-input-wrap">
                  <i class="pi pi-search"></i>
                  <input class="s-input" type="text" placeholder="Name / Emp ID / Manager…"
                    [(ngModel)]="monthlySearch" (ngModelChange)="filterMonthly()" />
                </div>
              </div>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn" [outlined]="true"
                (onClick)="exportMonthly()" [loading]="exporting()" [disabled]="!monthlyData()" />
            </div>

            @if (monthlyData()) {
              <div class="summary-strip">
                <div class="sum-card sum-blue"><div class="sum-icon"><i class="pi pi-users"></i></div><div><div class="sum-val">{{ monthlyData()!.resources.length }}</div><div class="sum-lbl">Resources</div></div></div>
                <div class="sum-card sum-green"><div class="sum-icon"><i class="pi pi-clock"></i></div><div><div class="sum-val">{{ monthlyData()!.grand_total | number:'1.0-0' }}</div><div class="sum-lbl">Total Hours</div><div class="sum-sub">{{ monthlyData()!.month_name }}</div></div></div>
                <div class="sum-card sum-purple"><div class="sum-icon"><i class="pi pi-briefcase"></i></div><div><div class="sum-val">{{ (monthlyData()!.project_summary || []).length }}</div><div class="sum-lbl">Projects</div></div></div>
                <div class="sum-card sum-orange"><div class="sum-icon"><i class="pi pi-percentage"></i></div><div><div class="sum-val">{{ monthlyAvgUtil() }}%</div><div class="sum-lbl">Avg Utilization</div></div></div>
              </div>

              <p-tabs [(value)]="monthlySubTab" styleClass="sub-tabs">
                <p-tablist>
                  <p-tab value="0">Customer wise</p-tab>
                  <p-tab value="1">IRM Wise</p-tab>
                  <p-tab value="2">Resource wise</p-tab>
                  <p-tab value="3">Project Breakdown</p-tab>
                  @if (!isPlainUser) {
                  <p-tab value="4">Utilisation Statistics</p-tab>
                  <p-tab value="5">Non Filling</p-tab>
                  }
                </p-tablist>
                <p-tabpanels>

                  <p-tabpanel value="0">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Customer wise — {{ monthlyData()!.month_name }}</span>
                        <span class="section-sub">Manager → Project breakdown · matches Excel Customer wise sheet</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="report-table">
                          <thead>
                            <tr class="tr-header">
                              <th class="th-left" style="min-width:220px;">Manager / Project</th>
                              @for (w of monthlyWeekLabels(); track w) { <th style="min-width:100px;">{{ w }}</th> }
                              <th style="min-width:110px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (grp of monthlyIRMGroups(); track grp.manager) {
                              <tr class="tr-manager">
                                <td [attr.colspan]="monthlyWeekLabels().length + 2">{{ grp.manager }}</td>
                              </tr>
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
                              <tr><td [attr.colspan]="monthlyWeekLabels().length + 2" style="height:10px; background:#FFFFFF; border:none;"></td></tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Grand Total</td>
                              @for (w of monthlyWeekLabels(); track w) { <td>{{ monthlyWeekTotal(w) || '' }}</td> }
                              <td>{{ monthlyData()!.grand_total }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="1">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">IRM Wise — {{ monthlyData()!.month_name }}</span>
                        <span class="section-sub">Manager-level summary · matches Excel IRM Wise sheet</span>
                      </div>
                      <div style="padding:0 0 .5rem;">
                        <table class="irm-table">
                          <thead>
                            <tr>
                              <th>Manager Name</th>
                              <th class="th-r">{{ monthlyData()!.month_name }}</th>
                              <th class="th-r">Billable</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (irm of monthlyData()!.irm_summary; track irm.manager) {
                              <tr>
                                <td>{{ irm.manager }}</td>
                                <td class="td-r">{{ irm.total_hours || '—' }}</td>
                                <td class="td-r" style="color:#16A34A;">{{ irm.billable || '—' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Billable effort</td>
                              <td>{{ monthlyIrmBillableTotal() }}</td>
                              <td>{{ monthlyIrmBillableTotal() }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="2">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Resource wise — {{ monthlyData()!.month_name }}</span>
                        <span class="section-sub">
                          {{ monthlyFiltered().length }} of {{ monthlyData()!.resources.length }} resources
                        </span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU / IRM</th>
                              @for (p of monthlyTopProjects(); track p) { <th>{{ p }}</th> }
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if (monthlyFiltered().length === 0) {
                              <tr><td [attr.colspan]="monthlyTopProjects().length + 5" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                            }
                            @for (res of monthlyFiltered(); track res.user_id) {
                              <tr [class.tr-zero]="res.total_hours === 0" style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                @for (p of monthlyTopProjects(); track p) {
                                  <td class="td-num" [class.has-val]="getProjectHours(res, p) > 0">{{ getProjectHours(res, p) || '—' }}</td>
                                }
                                <td>
                                  <div class="total-bar-cell">
                                    <div class="total-bar-track">
                                      <div class="total-bar-fill"
                                        [class.fill-good]="res.total_hours >= monthlyWeekLabels().length*40"
                                        [class.fill-mid]="res.total_hours >= monthlyWeekLabels().length*20 && res.total_hours < monthlyWeekLabels().length*40"
                                        [class.fill-low]="res.total_hours < monthlyWeekLabels().length*20"
                                        [style.width]="Math.min((res.total_hours/(monthlyWeekLabels().length*45||1))*100,100)+'%'">
                                      </div>
                                    </div>
                                    <span class="total-val" [class.good]="res.total_hours >= monthlyWeekLabels().length*40">{{ res.total_hours }}</span>
                                  </div>
                                </td>
                                <td class="td-center">
                                  <span class="util-pct"
                                    [class.low]="utilPct(res.total_hours, monthlyWeekLabels().length*45) < 50"
                                    [class.mid]="utilPct(res.total_hours, monthlyWeekLabels().length*45) >= 50 && utilPct(res.total_hours, monthlyWeekLabels().length*45) < 80"
                                    [class.good]="utilPct(res.total_hours, monthlyWeekLabels().length*45) >= 80">
                                    {{ utilPct(res.total_hours, monthlyWeekLabels().length*45) }}%
                                  </span>
                                </td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label" colspan="3">Grand Total</td>
                              @for (p of monthlyTopProjects(); track p) { <td>{{ monthlyProjectTotal(p) || '' }}</td> }
                              <td>{{ monthlyFilteredTotal() }}</td>
                              <td>{{ monthlyAvgUtil() }}%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="3">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Project Breakdown — Top 15</span>
                        <span class="section-sub">{{ (monthlyData()!.project_summary || []).length }} active projects</span>
                      </div>
                      <div style="padding:1rem 1.25rem;">
                        <div class="proj-breakdown">
                          @for (p of (monthlyData()!.project_summary || []).slice(0,15); track p.project) {
                            <div class="pb-row">
                              <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                              <div class="pb-bar-wrap">
                                <div class="pb-bar" [style.width]="(p.total_hours/monthlyData()!.grand_total*100)+'%'"></div>
                              </div>
                              <span class="pb-val">{{ p.total_hours }}h</span>
                              <span class="pb-pct">{{ +(p.total_hours/monthlyData()!.grand_total*100).toFixed(1) }}%</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  @if (!isPlainUser) {
                  <p-tabpanel value="4">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Utilisation Statistics — {{ monthlyData()!.month_name }}</span>
                        <span class="section-sub">Resources below {{ monthlyData()!.utilization_threshold_pct || 60 }}% utilisation · {{ (monthlyData()!.utilization_stats || []).length }} flagged</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th>Scheduled Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((monthlyData()!.utilization_stats || []).length === 0) {
                              <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources below threshold — everyone is well utilised.</td></tr>
                            }
                            @for (res of monthlyData()!.utilization_stats; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td class="td-num has-val">{{ res.total_hours }}</td>
                                <td class="td-num">{{ res.scheduled_hours }}</td>
                                <td class="td-center"><span class="util-pct low">{{ res.utilization_pct }}%</span></td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                  @if (!isPlainUser) {
                  <p-tabpanel value="5">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Non Filling — {{ monthlyData()!.month_name }}</span>
                        <span class="section-sub">Resources who have not submitted a timesheet for this period · {{ (monthlyData()!.non_filling || []).length }} resources</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th>IRM</th>
                              <th>IRM Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((monthlyData()!.non_filling || []).length === 0) {
                              <tr><td colspan="5" style="text-align:center; padding:2rem; color:#94A3B8;">Everyone has submitted their timesheet for this period.</td></tr>
                            }
                            @for (res of monthlyData()!.non_filling; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td><div class="emp-name">{{ res.user_name }}</div></td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm_email }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                </p-tabpanels>
              </p-tabs>

            } @else if (loading()) {
              <div class="skeleton-wrap">@for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }</div>
            }
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ YEARLY ══════════════════════════ -->
        <p-tabpanel value="2">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">Year</span>
                <p-select [options]="yearOptions" [(ngModel)]="selectedYear" optionLabel="label" optionValue="value" (ngModelChange)="loadYearlyReport()" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">Filter Resource / Manager</span>
                <div class="search-input-wrap">
                  <i class="pi pi-search"></i>
                  <input class="s-input" type="text" placeholder="Name / Emp ID / Manager…"
                    [(ngModel)]="yearlySearch" (ngModelChange)="filterYearly()" />
                </div>
              </div>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn" [outlined]="true"
                (onClick)="exportYearly()" [loading]="exporting()" [disabled]="!yearlyData()" />
            </div>

            @if (yearlyData()) {
              <div class="chart-wrap">
                <div class="chart-title">Monthly Hours — {{ selectedYear }} (matches "Sep'25 … Mar'26" columns in Excel)</div>
                <p-chart type="bar" [data]="yearlyChartData()" [options]="yearlyChartOptions" height="200px" />
              </div>

              <div class="summary-strip">
                <div class="sum-card sum-blue"><div class="sum-icon"><i class="pi pi-users"></i></div><div><div class="sum-val">{{ yearlyData()!.resources.length }}</div><div class="sum-lbl">Resources</div></div></div>
                <div class="sum-card sum-green"><div class="sum-icon"><i class="pi pi-clock"></i></div><div><div class="sum-val">{{ yearlyData()!.grand_total | number:'1.0-0' }}</div><div class="sum-lbl">Total Hours {{ selectedYear }}</div></div></div>
                <div class="sum-card sum-purple"><div class="sum-icon"><i class="pi pi-dollar"></i></div><div><div class="sum-val">{{ yearlyBillableTotal() | number:'1.0-0' }}</div><div class="sum-lbl">Billable Hours</div></div></div>
                <div class="sum-card sum-orange"><div class="sum-icon"><i class="pi pi-percentage"></i></div><div><div class="sum-val">{{ yearlyBillablePct() }}%</div><div class="sum-lbl">Billable %</div></div></div>
              </div>

              <p-tabs [(value)]="yearlySubTab" styleClass="sub-tabs">
                <p-tablist>
                  <p-tab value="0">Customer wise</p-tab>
                  <p-tab value="1">IRM Wise</p-tab>
                  <p-tab value="2">Resource wise</p-tab>
                  <p-tab value="3">Project Breakdown</p-tab>
                  @if (!isPlainUser) {
                  <p-tab value="4">Utilisation Statistics</p-tab>
                  <p-tab value="5">Non Filling</p-tab>
                  }
                </p-tablist>
                <p-tabpanels>

                  <p-tabpanel value="0">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Customer wise — {{ selectedYear }}</span>
                        <span class="section-sub">Manager → Project breakdown · matches Excel Customer wise sheet</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="report-table">
                          <thead>
                            <tr class="tr-header">
                              <th class="th-left" style="min-width:220px;">Manager / Project</th>
                              @for (m of yearlyMonthLabels(); track m) { <th style="min-width:90px;">{{ m }}</th> }
                              <th style="min-width:110px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (grp of yearlyIRMGroups(); track grp.manager) {
                              <tr class="tr-manager">
                                <td [attr.colspan]="yearlyMonthLabels().length + 2">{{ grp.manager }}</td>
                              </tr>
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
                              <tr><td [attr.colspan]="yearlyMonthLabels().length + 2" style="height:10px; background:#FFFFFF; border:none;"></td></tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Grand Total</td>
                              @for (m of yearlyMonthLabels(); track m) { <td>{{ yearlyMonthTotal(m) || '' }}</td> }
                              <td>{{ yearlyData()!.grand_total }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="1">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">IRM Wise — {{ selectedYear }}</span>
                        <span class="section-sub">Manager-level summary · matches Excel IRM Wise sheet</span>
                      </div>
                      <div style="padding:0 0 .5rem;">
                        <table class="irm-table">
                          <thead>
                            <tr>
                              <th>Manager Name</th>
                              <th class="th-r">{{ selectedYear }}</th>
                              <th class="th-r">Billable</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (irm of yearlyData()!.irm_summary; track irm.manager) {
                              <tr>
                                <td>{{ irm.manager }}</td>
                                <td class="td-r">{{ irm.total_hours || '—' }}</td>
                                <td class="td-r" style="color:#16A34A;">{{ irm.billable || '—' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Billable effort</td>
                              <td>{{ yearlyIrmBillableTotal() }}</td>
                              <td>{{ yearlyIrmBillableTotal() }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="2">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Resource wise — {{ selectedYear }}</span>
                        <span class="section-sub">
                          {{ yearlyFiltered().length }} of {{ yearlyData()!.resources.length }} resources
                        </span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU / IRM</th>
                              @for (p of yearlyTopProjects(); track p) { <th>{{ p }}</th> }
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th style="background:#0284C7;">Billable</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if (yearlyFiltered().length === 0) {
                              <tr><td [attr.colspan]="yearlyTopProjects().length + 5" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                            }
                            @for (res of yearlyFiltered(); track res.user_id) {
                              <tr [class.tr-zero]="res.total_hours === 0" style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                @for (p of yearlyTopProjects(); track p) {
                                  <td class="td-num" [class.has-val]="getProjectHours(res, p) > 0">{{ getProjectHours(res, p) || '—' }}</td>
                                }
                                <td class="td-num"><span class="total-val good">{{ res.total_hours }}</span></td>
                                <td class="td-num"><span style="color:#16A34A; font-weight:700; font-size:.82rem;">{{ res.billable_hours }}</span></td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label" colspan="3">Grand Total</td>
                              @for (p of yearlyTopProjects(); track p) { <td>{{ yearlyProjectTotal(p) || '' }}</td> }
                              <td>{{ yearlyFilteredTotal() }}</td>
                              <td>{{ yearlyBillableTotal() }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="3">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Project Breakdown — Top 15</span>
                        <span class="section-sub">{{ (yearlyData()!.project_summary || []).length }} active projects</span>
                      </div>
                      <div style="padding:1rem 1.25rem;">
                        <div class="proj-breakdown">
                          @for (p of (yearlyData()!.project_summary || []).slice(0,15); track p.project) {
                            <div class="pb-row">
                              <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                              <div class="pb-bar-wrap">
                                <div class="pb-bar" [style.width]="(p.total_hours/yearlyData()!.grand_total*100)+'%'"></div>
                              </div>
                              <span class="pb-val">{{ p.total_hours }}h</span>
                              <span class="pb-pct">{{ +(p.total_hours/yearlyData()!.grand_total*100).toFixed(1) }}%</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  @if (!isPlainUser) {
                  <p-tabpanel value="4">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Utilisation Statistics — {{ selectedYear }}</span>
                        <span class="section-sub">Resources below {{ yearlyData()!.utilization_threshold_pct || 60 }}% utilisation · {{ (yearlyData()!.utilization_stats || []).length }} flagged</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th>Scheduled Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((yearlyData()!.utilization_stats || []).length === 0) {
                              <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources below threshold — everyone is well utilised.</td></tr>
                            }
                            @for (res of yearlyData()!.utilization_stats; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td class="td-num has-val">{{ res.total_hours }}</td>
                                <td class="td-num">{{ res.scheduled_hours }}</td>
                                <td class="td-center"><span class="util-pct low">{{ res.utilization_pct }}%</span></td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                  @if (!isPlainUser) {
                  <p-tabpanel value="5">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Non Filling — {{ selectedYear }}</span>
                        <span class="section-sub">Resources who have not submitted a timesheet for this period · {{ (yearlyData()!.non_filling || []).length }} resources</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th>IRM</th>
                              <th>IRM Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((yearlyData()!.non_filling || []).length === 0) {
                              <tr><td colspan="5" style="text-align:center; padding:2rem; color:#94A3B8;">Everyone has submitted their timesheet for this period.</td></tr>
                            }
                            @for (res of yearlyData()!.non_filling; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td><div class="emp-name">{{ res.user_name }}</div></td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm_email }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                </p-tabpanels>
              </p-tabs>

            } @else if (loading()) {
              <div class="skeleton-wrap">@for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }</div>
            }
          </div>
        </p-tabpanel>

        <!-- ══════════════════════ CUSTOM RANGE ══════════════════════════ -->
        <p-tabpanel value="3">
          <div class="tab-content">
            <div class="controls-row">
              <div class="ctrl-group">
                <span class="ctrl-label">From Date</span>
                <p-datepicker [(ngModel)]="customFrom" view="date" placeholder="Start date" dateFormat="dd/mm/yy" />
              </div>
              <div class="ctrl-group">
                <span class="ctrl-label">To Date</span>
                <p-datepicker [(ngModel)]="customTo" view="date" placeholder="End date" dateFormat="dd/mm/yy" />
              </div>
              <p-button icon="pi pi-search" label="Generate" styleClass="gen-btn"
                (onClick)="loadCustomReport()" [loading]="loading()" />
              <div class="ctrl-group">
                <span class="ctrl-label">Filter Resource / Manager</span>
                <div class="search-input-wrap">
                  <i class="pi pi-search"></i>
                  <input class="s-input" type="text" placeholder="Name / Emp ID / Manager…"
                    [(ngModel)]="customSearch" (ngModelChange)="filterCustom()" />
                </div>
              </div>
              <div class="ctrl-spacer"></div>
              <p-button icon="pi pi-download" label="Export Excel" styleClass="export-btn"
                [outlined]="true" (onClick)="exportCustom()" [loading]="exporting()" [disabled]="!customData()" />
            </div>

            @if (customData(); as cd) {
              <div class="range-badge">
                <i class="pi pi-calendar-range"></i>
                {{ cd.date_range }}
                <span class="week-chip">{{ cd.week_labels.length }} week(s)</span>
              </div>

              <div class="summary-strip">
                <div class="sum-card sum-blue"><div class="sum-icon"><i class="pi pi-users"></i></div><div><div class="sum-val">{{ cd.resources.length }}</div><div class="sum-lbl">Resources</div></div></div>
                <div class="sum-card sum-green"><div class="sum-icon"><i class="pi pi-clock"></i></div><div><div class="sum-val">{{ cd.total_hours | number:'1.0-0' }}</div><div class="sum-lbl">Total Hours</div></div></div>
                <div class="sum-card sum-purple"><div class="sum-icon"><i class="pi pi-briefcase"></i></div><div><div class="sum-val">{{ cd.project_summary.length }}</div><div class="sum-lbl">Projects</div></div></div>
                <div class="sum-card sum-orange"><div class="sum-icon"><i class="pi pi-percentage"></i></div><div><div class="sum-val">{{ customUtilPct() }}%</div><div class="sum-lbl">Avg Utilization</div></div></div>
              </div>

              <p-tabs [(value)]="customSubTab" styleClass="sub-tabs">
                <p-tablist>
                  <p-tab value="0">Customer wise</p-tab>
                  <p-tab value="1">IRM Wise</p-tab>
                  <p-tab value="2">Resource wise</p-tab>
                  <p-tab value="3">Project Breakdown</p-tab>
                  @if (!isPlainUser) {
                  <p-tab value="4">Utilisation Statistics</p-tab>
                  <p-tab value="5">Non Filling</p-tab>
                  }
                </p-tablist>
                <p-tabpanels>

                  <p-tabpanel value="0">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Customer wise — {{ cd.date_range }}</span>
                        <span class="section-sub">Manager → Project breakdown · matches Excel Customer wise sheet</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="report-table">
                          <thead>
                            <tr class="tr-header">
                              <th class="th-left" style="min-width:220px;">Manager / Project</th>
                              @for (w of cd.week_labels; track w) { <th style="min-width:100px;">{{ w }}</th> }
                              <th style="min-width:110px;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (grp of customIRMGroups(); track grp.manager) {
                              <tr class="tr-manager">
                                <td [attr.colspan]="cd.week_labels.length + 2">{{ grp.manager }}</td>
                              </tr>
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
                              <tr><td [attr.colspan]="cd.week_labels.length + 2" style="height:10px; background:#FFFFFF; border:none;"></td></tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Grand Total</td>
                              @for (w of cd.week_labels; track w) { <td>{{ customWeekTotal(w) || '' }}</td> }
                              <td>{{ cd.total_hours }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="1">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">IRM Wise — {{ cd.date_range }}</span>
                        <span class="section-sub">Manager-level summary · matches Excel IRM Wise sheet</span>
                      </div>
                      <div style="padding:0 0 .5rem;">
                        <table class="irm-table">
                          <thead>
                            <tr>
                              <th>Manager Name</th>
                              <th class="th-r">Period Total</th>
                              <th class="th-r">Billable</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (irm of cd.irm_summary; track irm.manager) {
                              <tr>
                                <td>{{ irm.manager }}</td>
                                <td class="td-r">{{ irm.total_hours || '—' }}</td>
                                <td class="td-r" style="color:#16A34A;">{{ irm.billable || '—' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label">Billable effort</td>
                              <td>{{ customIrmBillableTotal() }}</td>
                              <td>{{ customIrmBillableTotal() }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="2">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Resource wise — {{ cd.date_range }}</span>
                        <span class="section-sub">
                          {{ customFiltered().length }} of {{ cd.resources.length }} resources
                        </span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU / IRM</th>
                              @for (p of customTopProjects(); track p) { <th>{{ p }}</th> }
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if (customFiltered().length === 0) {
                              <tr><td [attr.colspan]="customTopProjects().length + 5" style="text-align:center; padding:2rem; color:#94A3B8;">No resources match your filter.</td></tr>
                            }
                            @for (res of customFiltered(); track res.user_id) {
                              <tr [class.tr-zero]="res.total_hours === 0" style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                @for (p of customTopProjects(); track p) {
                                  <td class="td-num" [class.has-val]="getProjectHours(res, p) > 0">{{ getProjectHours(res, p) || '—' }}</td>
                                }
                                <td>
                                  <div class="total-bar-cell">
                                    <div class="total-bar-track">
                                      <div class="total-bar-fill"
                                        [class.fill-good]="res.total_hours >= cd.week_labels.length*40"
                                        [class.fill-mid]="res.total_hours >= cd.week_labels.length*20 && res.total_hours < cd.week_labels.length*40"
                                        [class.fill-low]="res.total_hours < cd.week_labels.length*20"
                                        [style.width]="Math.min((res.total_hours/(cd.week_labels.length*45||1))*100,100)+'%'">
                                      </div>
                                    </div>
                                    <span class="total-val" [class.good]="res.total_hours >= cd.week_labels.length*40">{{ res.total_hours }}</span>
                                  </div>
                                </td>
                                <td class="td-center">
                                  <span class="util-pct"
                                    [class.low]="utilPct(res.total_hours, cd.week_labels.length*45) < 50"
                                    [class.mid]="utilPct(res.total_hours, cd.week_labels.length*45) >= 50 && utilPct(res.total_hours, cd.week_labels.length*45) < 80"
                                    [class.good]="utilPct(res.total_hours, cd.week_labels.length*45) >= 80">
                                    {{ utilPct(res.total_hours, cd.week_labels.length*45) }}%
                                  </span>
                                </td>
                              </tr>
                            }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td class="td-label" colspan="3">Grand Total</td>
                              @for (p of customTopProjects(); track p) { <td>{{ customProjectTotal(p) || '' }}</td> }
                              <td>{{ customFilteredTotal() }}</td>
                              <td>{{ customUtilPct() }}%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>

                  <p-tabpanel value="3">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Project Breakdown — Top 15</span>
                      </div>
                      <div style="padding:1rem 1.25rem;">
                        <div class="proj-breakdown">
                          @for (p of cd.project_summary.slice(0,15); track p.project) {
                            <div class="pb-row">
                              <span class="pb-name" [title]="p.project">{{ p.project }}</span>
                              <div class="pb-bar-wrap"><div class="pb-bar" [style.width]="(p.total_hours/cd.total_hours*100)+'%'"></div></div>
                              <span class="pb-val">{{ p.total_hours }}h</span>
                              <span class="pb-pct">{{ +(p.total_hours/cd.total_hours*100).toFixed(1) }}%</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  @if (!isPlainUser) {
                  <p-tabpanel value="4">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Utilisation Statistics — {{ cd.date_range }}</span>
                        <span class="section-sub">Resources below {{ cd.utilization_threshold_pct || 60 }}% utilisation · {{ (cd.utilization_stats || []).length }} flagged</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th style="background:#16A34A;">Total Hrs</th>
                              <th>Scheduled Hrs</th>
                              <th style="background:#0F2440;">Util %</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((cd.utilization_stats || []).length === 0) {
                              <tr><td colspan="6" style="text-align:center; padding:2rem; color:#94A3B8;">No resources below threshold — everyone is well utilised.</td></tr>
                            }
                            @for (res of cd.utilization_stats; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td>
                                  <div class="emp-name">{{ res.user_name }}</div>
                                  <div style="font-size:.7rem; color:#94A3B8;">{{ res.irm }}</div>
                                </td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td class="td-num has-val">{{ res.total_hours }}</td>
                                <td class="td-num">{{ res.scheduled_hours }}</td>
                                <td class="td-center"><span class="util-pct low">{{ res.utilization_pct }}%</span></td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                  @if (!isPlainUser) {
                  <p-tabpanel value="5">
                    <div class="section-card">
                      <div class="section-header">
                        <span class="section-title">Non Filling — {{ cd.date_range }}</span>
                        <span class="section-sub">Resources who have not submitted a timesheet for this period · {{ (cd.non_filling || []).length }} resources</span>
                      </div>
                      <div class="report-table-wrap">
                        <table class="res-table">
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>BU</th>
                              <th>IRM</th>
                              <th>IRM Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if ((cd.non_filling || []).length === 0) {
                              <tr><td colspan="5" style="text-align:center; padding:2rem; color:#94A3B8;">Everyone has submitted their timesheet for this period.</td></tr>
                            }
                            @for (res of cd.non_filling; track res.user_id) {
                              <tr style="border-bottom:1px solid #F1F5F9;">
                                <td><span class="emp-id-badge">{{ res.yash_id }}</span></td>
                                <td><div class="emp-name">{{ res.user_name }}</div></td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.b_unit }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm }}</td>
                                <td style="font-size:.75rem; color:#64748B;">{{ res.irm_email }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </p-tabpanel>
                  }

                </p-tabpanels>
              </p-tabs>

            } @else if (loading()) {
              <div class="skeleton-wrap">@for (i of [1,2,3,4,5]; track i) { <p-skeleton height="2.5rem" /> }</div>
            } @else {
              <div class="empty-state"><i class="pi pi-sliders-h"></i><p>Select a date range and click <strong>Generate</strong>.</p></div>
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
  weeklySubTab  = '0';

  // Monthly / Yearly
  selectedYear  = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  monthlyData   = signal<any>(null);
  monthlySearch  = '';
  monthlyFiltered = signal<any[]>([]);
  monthlySubTab = '0';
  yearlyData    = signal<any>(null);
  yearlySearch  = '';
  yearlyFiltered = signal<any[]>([]);
  yearlySubTab  = '0';

  // Custom
  customFrom: Date | null = null;
  customTo:   Date | null = null;
  customData  = signal<any>(null);
  customSearch  = '';
  customFiltered = signal<any[]>([]);
  customSubTab  = '0';

  yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: y.toString(), value: y };
  });
  monthOptions = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    .map((m, i) => ({ label: m, value: i + 1 }));

  // Plain 'user'-typed accounts get a self-only report (see backend
  // _team_ids/team_user_ids), so the Utilisation Statistics (<60% flag)
  // and Non Filling sub-tabs -- which are team-oversight views -- are
  // hidden for that role. Manager/Superadmin/BUH still see them.
  isPlainUser = false;

  constructor(
    private reportsService: ReportsService,
    private authService: AuthenticationService,
    private messageService: MessageService,
  ) {
    this.isPlainUser = this.authService.userValue?.type === 'user';
  }

  ngOnInit() { this.loadWeeklyReport(); }

  onTabChange(v: string | number) {
    const s = String(v);
    if (s === '1' && !this.monthlyData()) this.loadMonthlyReport();
    if (s === '2' && !this.yearlyData())  this.loadYearlyReport();
  }

  // ── Weekly ────────────────────────────────────────────────────────────────
  weekStartIso(): string {
    const d = new Date(this.weeklyDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return this.toIso(d);
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
          r.b_unit?.toLowerCase().includes(term)     ||
          r.irm?.toLowerCase().includes(term))
      : all);
  }

  weeklyFilteredResources = computed(() => this.weeklyFiltered());

  // Compute IRM groups for the Customer wise section
  weeklyIRMGroups = computed((): { manager: string; projects: any[]; total: number }[] => {
    const d = this.weeklyData();
    if (!d?.resources) return [];
    const groups: Record<string, Record<string, number>> = {};
    for (const res of d.resources) {
      const mgr = res.irm || 'Unassigned';
      if (!groups[mgr]) groups[mgr] = {};
      for (const proj of res.projects ?? []) {
        groups[mgr][proj.project_name] = (groups[mgr][proj.project_name] || 0) + proj.hours;
      }
    }
    return Object.entries(groups).map(([manager, projs]) => ({
      manager,
      projects: Object.entries(projs)
        .map(([project, total_hours]) => ({ project, total_hours }))
        .sort((a, b) => (b.total_hours as number) - (a.total_hours as number)),
      total: Object.values(projs).reduce((s, h) => s + (h as number), 0),
    }));
  });

  weeklyFilteredTotal(): number {
    return this.weeklyFiltered().reduce((s: number, r: any) => s + (r.total_hours || 0), 0);
  }

  irmBillableTotal = computed(() =>
    (this.weeklyData()?.irm_summary ?? []).reduce((s: number, r: any) => s + (r.billable || 0), 0));

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

  weeklyUtilPct(): number {
    const res = this.weeklyFiltered().filter((r: any) => r.total_hours > 0);
    if (!res.length) return 0;
    return Math.round(res.reduce((s: number, r: any) => s + (r.total_hours / 45) * 100, 0) / res.length);
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

  // ── Monthly ──────────────────────────────────────────────────────────────
  loadMonthlyReport() {
    this.loading.set(true);
    this.monthlyData.set(null);
    this.monthlySearch = '';
    this.monthlyFiltered.set([]);
    this.reportsService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next:  (data) => { this.monthlyData.set(data); this.monthlyFiltered.set(data.resources ?? []); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load monthly report'); },
    });
  }

  filterMonthly() {
    const term = this.monthlySearch.toLowerCase();
    const all  = this.monthlyData()?.resources ?? [];
    this.monthlyFiltered.set(term
      ? all.filter((r: any) =>
          r.user_name?.toLowerCase().includes(term) ||
          r.yash_id?.toLowerCase().includes(term)   ||
          r.b_unit?.toLowerCase().includes(term)     ||
          r.irm?.toLowerCase().includes(term))
      : all);
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
    return this.monthlyFiltered().reduce((s: number, r: any) => s + (r.weeks?.[week] || 0), 0);
  }

  monthlyFilteredTotal(): number {
    return this.monthlyFiltered().reduce((s: number, r: any) => s + (r.total_hours || 0), 0);
  }

  monthlyAvgUtil(): number {
    const d = this.monthlyData();
    if (!d) return 0;
    const wks = this.monthlyWeekLabels().length || 1;
    const res = this.monthlyFiltered().filter((r: any) => r.total_hours > 0);
    if (!res.length) return 0;
    return Math.round(res.reduce((s: number, r: any) => s + (r.total_hours / (wks * 45)) * 100, 0) / res.length);
  }

  monthlyIRMGroups = computed(() => this.buildIrmGroups(this.monthlyData()?.resources ?? [], this.monthlyWeekLabels()));

  monthlyIrmBillableTotal = computed(() =>
    (this.monthlyData()?.irm_summary ?? []).reduce((s: number, r: any) => s + (r.billable || 0), 0));

  monthlyTopProjects = computed((): string[] => {
    const d = this.monthlyData();
    if (!d?.project_summary) return [];
    return d.project_summary
      .filter((p: any) => p.project !== 'Leave' && p.project !== 'PMO')
      .slice(0, 8)
      .map((p: any) => p.project);
  });

  monthlyProjectTotal(projectName: string): number {
    return this.monthlyFiltered().reduce((s: number, r: any) => s + this.getProjectHours(r, projectName), 0);
  }

  exportMonthly() {
    this.exporting.set(true);
    this.reportsService.exportMonthly(this.selectedYear, this.selectedMonth).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Monthly_Utilization_${this.selectedYear}_${this.selectedMonth}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Yearly ───────────────────────────────────────────────────────────────
  loadYearlyReport() {
    this.loading.set(true);
    this.yearlyData.set(null);
    this.yearlySearch = '';
    this.yearlyFiltered.set([]);
    this.reportsService.getYearlyReport(this.selectedYear).subscribe({
      next:  (data) => { this.yearlyData.set(data); this.yearlyFiltered.set(data.resources ?? []); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load yearly report'); },
    });
  }

  filterYearly() {
    const term = this.yearlySearch.toLowerCase();
    const all  = this.yearlyData()?.resources ?? [];
    this.yearlyFiltered.set(term
      ? all.filter((r: any) =>
          r.user_name?.toLowerCase().includes(term) ||
          r.yash_id?.toLowerCase().includes(term)   ||
          r.b_unit?.toLowerCase().includes(term)     ||
          r.irm?.toLowerCase().includes(term))
      : all);
  }

  yearlyMonthLabels(): string[] {
    return this.yearlyData()?.month_labels ?? [];
  }

  yearlyBillableTotal(): number {
    return this.yearlyFiltered().reduce((s: number, r: any) => s + (r.billable_hours || 0), 0);
  }

  yearlyFilteredTotal(): number {
    return this.yearlyFiltered().reduce((s: number, r: any) => s + (r.total_hours || 0), 0);
  }

  yearlyMonthTotal(month: string): number {
    return this.yearlyFiltered().reduce((s: number, r: any) => s + (r.monthly?.[month] || 0), 0);
  }

  yearlyBillablePct(): number {
    const total = this.yearlyFilteredTotal();
    if (!total) return 0;
    return Math.round((this.yearlyBillableTotal() / total) * 100);
  }

  yearlyIRMGroups = computed(() => this.buildIrmGroups(this.yearlyData()?.resources ?? [], this.yearlyMonthLabels()));

  yearlyIrmBillableTotal = computed(() =>
    (this.yearlyData()?.irm_summary ?? []).reduce((s: number, r: any) => s + (r.billable || 0), 0));

  yearlyTopProjects = computed((): string[] => {
    const d = this.yearlyData();
    if (!d?.project_summary) return [];
    return d.project_summary
      .filter((p: any) => p.project !== 'Leave' && p.project !== 'PMO')
      .slice(0, 8)
      .map((p: any) => p.project);
  });

  yearlyProjectTotal(projectName: string): number {
    return this.yearlyFiltered().reduce((s: number, r: any) => s + this.getProjectHours(r, projectName), 0);
  }

  yearlyChartData() {
    const d = this.yearlyData();
    if (!d) return {};
    const labels = this.yearlyMonthLabels();
    return {
      labels,
      datasets: [
        {
          label: 'Total Hours',
          data: labels.map((m: string) => d.monthly_totals?.[m] || 0),
          backgroundColor: '#1E3A5F', borderRadius: 4,
        },
        {
          label: 'Billable',
          data: labels.map((m: string) => {
            const res = d.resources ?? [];
            return res.reduce((s: number, r: any) =>
              s + (r.billable_hours ? Math.round(r.billable_hours * ((r.monthly?.[m] || 0) / (r.total_hours || 1))) : 0), 0);
          }),
          backgroundColor: '#16A34A', borderRadius: 4,
        },
      ],
    };
  }

  yearlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
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

  // ── Custom Range ─────────────────────────────────────────────────────────
  loadCustomReport() {
    if (!this.customFrom || !this.customTo) { this.toast('warn', 'Select both dates.'); return; }
    if (this.customFrom > this.customTo)    { this.toast('warn', '"From" must be before "To".'); return; }
    this.loading.set(true);
    this.customData.set(null);
    this.customSearch = '';
    this.customFiltered.set([]);
    this.reportsService.getCustomReport(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (data) => { this.customData.set(data); this.customFiltered.set(data.resources ?? []); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.toast('error', 'Failed to load custom report'); },
    });
  }

  filterCustom() {
    const term = this.customSearch.toLowerCase();
    const all  = this.customData()?.resources ?? [];
    this.customFiltered.set(term
      ? all.filter((r: any) =>
          r.user_name?.toLowerCase().includes(term) ||
          r.yash_id?.toLowerCase().includes(term)   ||
          r.b_unit?.toLowerCase().includes(term)     ||
          r.irm?.toLowerCase().includes(term))
      : all);
  }

  customFilteredTotal(): number {
    return this.customFiltered().reduce((s: number, r: any) => s + (r.total_hours || 0), 0);
  }

  customUtilPct(): number {
    const d = this.customData();
    if (!d?.week_labels?.length) return 0;
    const maxHrs = 45 * d.week_labels.length;
    const active = this.customFiltered().filter((r: any) => r.total_hours > 0);
    if (!active.length) return 0;
    return Math.round(active.reduce((s: number, r: any) => s + (r.total_hours / maxHrs) * 100, 0) / active.length);
  }

  customIRMGroups = computed(() => this.buildIrmGroups(this.customData()?.resources ?? [], this.customData()?.week_labels ?? []));

  customIrmBillableTotal = computed(() =>
    (this.customData()?.irm_summary ?? []).reduce((s: number, r: any) => s + (r.billable || 0), 0));

  customTopProjects = computed((): string[] => {
    const d = this.customData();
    if (!d?.project_summary) return [];
    return d.project_summary
      .filter((p: any) => p.project !== 'Leave' && p.project !== 'PMO')
      .slice(0, 8)
      .map((p: any) => p.project);
  });

  customProjectTotal(projectName: string): number {
    return this.customFiltered().reduce((s: number, r: any) => s + this.getProjectHours(r, projectName), 0);
  }

  customWeekTotal(week: string): number {
    return this.customFiltered().reduce((s: number, r: any) =>
      s + (r.projects ?? []).reduce((ps: number, p: any) => ps + (p.week_hours?.[week] || 0), 0), 0);
  }

  exportCustom() {
    if (!this.customFrom || !this.customTo) return;
    this.exporting.set(true);
    this.reportsService.exportCustom(this.toIso(this.customFrom), this.toIso(this.customTo)).subscribe({
      next:  (blob) => { this.downloadFile(blob, `Custom_Utilization_${this.toIso(this.customFrom!)}_to_${this.toIso(this.customTo!)}.xlsx`); this.exporting.set(false); },
      error: ()     => { this.exporting.set(false); this.toast('error', 'Export failed'); },
    });
  }

  // ── Shared helpers ────────────────────────────────────────────────────────
  // Generic Customer-wise grouping: groups resources by IRM/manager, then by
  // project, with one hour-value per column (columns = week labels, month
  // labels, or whatever the period uses) plus a period total. Mirrors the
  // backend's _build_customer_wise() so on-screen and Excel-export structure
  // match for every report type (Weekly/Monthly/Yearly/Custom).
  buildIrmGroups(resources: any[], columns: string[]): { manager: string; projects: { project: string; cols: number[]; total: number }[]; colTotals: number[]; total: number }[] {
    const groups: Record<string, Record<string, { cols: Record<string, number>; total: number }>> = {};
    for (const res of resources ?? []) {
      const mgr = res.irm || 'Unassigned';
      if (!groups[mgr]) groups[mgr] = {};
      for (const proj of res.projects ?? []) {
        if (!groups[mgr][proj.project_name]) {
          groups[mgr][proj.project_name] = { cols: {}, total: 0 };
        }
        const g = groups[mgr][proj.project_name];
        for (const col of columns) {
          g.cols[col] = (g.cols[col] || 0) + (proj.week_hours?.[col] || 0);
        }
        g.total += proj.hours || 0;
      }
    }
    return Object.entries(groups).map(([manager, projs]) => {
      const projectRows = Object.entries(projs)
        .map(([project, v]) => ({
          project,
          cols: columns.map((c) => Math.round(((v as any).cols[c] || 0) * 10) / 10),
          total: Math.round((v as any).total * 10) / 10,
        }))
        .sort((a, b) => b.total - a.total);
      const colTotals = columns.map((_, i) =>
        Math.round(projectRows.reduce((s, p) => s + p.cols[i], 0) * 10) / 10);
      const total = Math.round(projectRows.reduce((s, p) => s + p.total, 0) * 10) / 10;
      return { manager, projects: projectRows, colTotals, total };
    });
  }

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

  // Local Y/M/D formatting, not toISOString() — see dashboard.component.ts's toIso()
  // for why toISOString() silently shifts dates back a day in IST and similar zones.
  toIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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