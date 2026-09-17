import {
  Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';

import { DashboardService } from '../service/dashboard.service';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, RouterModule,
    SelectModule, ButtonModule, TableModule, TagModule,
    TooltipModule, SkeletonModule, ToastModule, TabsModule,
    DatePickerModule, ChartModule, ProgressBarModule, CardModule,
    PaginatorModule,
  ],
  providers: [MessageService],
  template: `
<p-toast position="top-right" />

<div class="dash-page">

  <!-- ══════════ HEADER ══════════ -->
  <div class="dash-header">
    <div class="dash-header-left">
      <div class="dash-title-row">
        <div class="dash-icon-wrap"><i class="pi pi-chart-bar"></i></div>
        <div>
          <h1 class="dash-title">Analytics Dashboard</h1>
          <span class="dash-sub">Utilization insights across resources, projects &amp; teams</span>
        </div>
      </div>
    </div>
    <div class="dash-header-right">
      <div class="period-tabs">
        @for (p of periodPresets; track p.key) {
          <button class="ptab" [class.active]="activePeriod() === p.key" (click)="applyPreset(p)">
            {{ p.label }}
          </button>
        }
      </div>
      @if (activePeriod() === 'custom') {
        <div class="custom-range">
          <p-datepicker [(ngModel)]="fromDate" dateFormat="yy-mm-dd" placeholder="From"
            (ngModelChange)="onCustomRange()" />
          <span class="range-sep">→</span>
          <p-datepicker [(ngModel)]="toDate" dateFormat="yy-mm-dd" placeholder="To"
            (ngModelChange)="onCustomRange()" />
        </div>
      }
      @if (activePeriod() === 'ytd') {
        <p-select [options]="yearOptions" [(ngModel)]="selectedYear"
          (ngModelChange)="onYearChange()" styleClass="year-sel" />
      }
      <button class="refresh-btn" (click)="loadAll()" [class.spinning]="anyLoading()"
        pTooltip="Refresh data" tooltipPosition="bottom">
        <i class="pi pi-refresh"></i>
      </button>
    </div>
  </div>

  <!-- ══════════ KPI STRIP ══════════ -->
  <div class="kpi-strip">
    @if (summaryLoading()) {
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="kpi-card kpi-skel">
          <p-skeleton height="16px" width="90px" styleClass="mb-3" />
          <p-skeleton height="36px" width="80px" styleClass="mb-2" />
          <p-skeleton height="12px" width="60px" />
        </div>
      }
    } @else {
      @if (summary(); as s) {

        <div class="kpi-card kpi-total">
          <div class="kpi-header">
            <span class="kpi-lbl">Total Hours</span>
            <div class="kpi-icon kpi-icon-blue"><i class="pi pi-clock"></i></div>
          </div>
          <div class="kpi-val">{{ s.total_hours | number:'1.0-0' }}</div>
          <div class="kpi-footer">
            <span class="kpi-period-tag">{{ periodLabel() }}</span>
          </div>
        </div>

        <div class="kpi-card kpi-billable">
          <div class="kpi-header">
            <span class="kpi-lbl">Billable Hours</span>
            <div class="kpi-icon kpi-icon-green"><i class="pi pi-dollar"></i></div>
          </div>
          <div class="kpi-val">{{ s.billable_hours | number:'1.0-0' }}</div>
          <div class="kpi-footer">
            <span class="kpi-badge kpi-badge-green">{{ s.billable_pct }}% of total</span>
          </div>
        </div>

        <div class="kpi-card kpi-util">
          <div class="kpi-header">
            <span class="kpi-lbl">Avg Utilization</span>
            <div class="kpi-icon kpi-icon-purple"><i class="pi pi-chart-pie"></i></div>
          </div>
          <div class="kpi-val" [class.kpi-val-danger]="s.avg_utilization_pct < 60">
            {{ s.avg_utilization_pct }}%
          </div>
          <div class="kpi-progress-wrap">
            <div class="kpi-progress-track">
              <div class="kpi-progress-fill"
                [style.width]="s.avg_utilization_pct + '%'"
                [class.kpi-progress-danger]="s.avg_utilization_pct < 60"
                [class.kpi-progress-warn]="s.avg_utilization_pct >= 60 && s.avg_utilization_pct < 80">
              </div>
            </div>
            <span class="kpi-prog-label" [class.kpi-val-danger]="s.avg_utilization_pct < 60">
              {{ s.avg_utilization_pct < 60 ? 'Below target' : s.avg_utilization_pct >= 80 ? 'On track' : 'Near target' }}
            </span>
          </div>
        </div>

        <div class="kpi-card kpi-resources">
          <div class="kpi-header">
            <span class="kpi-lbl">Active Resources</span>
            <div class="kpi-icon kpi-icon-sky"><i class="pi pi-users"></i></div>
          </div>
          <div class="kpi-val">{{ s.active_resources }}</div>
          <div class="kpi-footer">
            <span class="kpi-period-tag">In scope</span>
          </div>
        </div>

        <div class="kpi-card kpi-compliance">
          <div class="kpi-header">
            <span class="kpi-lbl">Submission Rate</span>
            <div class="kpi-icon kpi-icon-amber"><i class="pi pi-check-circle"></i></div>
          </div>
          <div class="kpi-val" [class.kpi-val-danger]="s.timesheets.compliance_pct < 80">
            {{ s.timesheets.compliance_pct }}%
          </div>
          <div class="kpi-footer">
            <span class="kpi-muted">{{ s.timesheets.submitted }} / {{ s.timesheets.total }} submitted</span>
          </div>
        </div>

        

      }
    }
  </div>

  <!-- ══════════ ROW 1: TREND + DONUT ══════════ -->
  <div class="dash-row dash-row-trend">

    <!-- Trend Chart -->
    <div class="dash-card card-trend">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-title">Utilization Trend</span>
          <span class="card-sub">Billable hours trend</span>
        </div>
        <div class="trend-tabs">
          <button class="ttab" [class.active]="trendView() === 'week'"  (click)="setTrendView('week')">Weekly</button>
          <button class="ttab" [class.active]="trendView() === 'month'" (click)="setTrendView('month')">Monthly</button>
          <button class="ttab" [class.active]="trendView() === 'year'"  (click)="setTrendView('year')">Yearly</button>
        </div>
      </div>
      <div class="chart-area">
        @if (trendLoading()) {
          <div class="chart-skel-wrap">
            <p-skeleton height="260px" />
          </div>
        } @else {
          @if (trendChartData(); as chartData) {
            <p-chart type="bar" [data]="chartData" [options]="trendChartOptions" [plugins]="barValueLabelsPlugin" height="260px" />
          } @else {
            <div class="empty-chart"><i class="pi pi-chart-bar"></i><p>No trend data</p></div>
          }
        }
      </div>
    </div>

    <!-- Hours by Type Donut -->
    <div class="dash-card card-donut">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-title">Hours by Type</span>
          <span class="card-sub">{{ periodLabel() }}</span>
        </div>
      </div>
      @if (summaryLoading()) {
        <div class="donut-skel">
          <p-skeleton shape="circle" size="160px" />
          <div class="donut-skel-legend">
            @for (i of [1,2,3,4]; track i) {
              <p-skeleton height="16px" width="100%" styleClass="mb-2" />
            }
          </div>
        </div>
      } @else {
        @if (summary(); as s) {
          <div class="donut-layout">
            <div class="donut-chart-wrap">
              <p-chart type="doughnut" [data]="hoursTypeChartData()" [options]="donutOptions" height="170px" />
              <div class="donut-center">
                <span class="donut-total">{{ s.total_hours | number:'1.0-0' }}</span>
                <span class="donut-total-lbl">Total hrs</span>
              </div>
            </div>
            <div class="donut-legend">
              @for (item of hoursTypeLegend(); track item.label) {
                <div class="legend-row">
                  <span class="legend-dot" [style.background]="item.color"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <div class="legend-right">
                    <span class="legend-val">{{ item.hours | number:'1.0-0' }}h</span>
                    <span class="legend-pct">{{ item.pct }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>

  </div>

  <!-- ══════════ ROW 2: COMPLIANCE + MANAGER + BU ══════════ -->
  <div class="dash-row dash-row-3">

    <!-- Submission Compliance -->
    <div class="dash-card card-compliance">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-title">Submission Compliance</span>
          <span class="card-sub">Last 8 weeks</span>
        </div>
      </div>
      @if (complianceLoading()) {
        <div class="compliance-skel">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <p-skeleton height="22px" styleClass="mb-2" />
          }
        </div>
      } @else {
        @if (complianceData(); as cd) {
          <div class="compliance-bars">
            @for (w of cd.weeks; track w.week) {
              <div class="cb-row">
                <span class="cb-label">{{ w.week }}</span>
                <div class="cb-track">
                  <div class="cb-fill"
                    [style.width]="w.compliance_pct + '%'"
                    [class.cb-low]="w.compliance_pct < 60"
                    [class.cb-mid]="w.compliance_pct >= 60 && w.compliance_pct < 90"
                    [class.cb-high]="w.compliance_pct >= 90">
                  </div>
                </div>
                <div class="cb-right">
                  <span class="cb-pct" [class.low]="w.compliance_pct < 60">{{ w.compliance_pct }}%</span>
                  <span class="cb-detail">{{ w.submitted }}/{{ w.total_users }}</span>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Manager Team (admin/manager only) -->
    @if (isManagerOrAdmin()) {
      <div class="dash-card card-manager">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-title">By Manager / Team</span>
            <span class="card-sub">{{ periodLabel() }}</span>
          </div>
        </div>
        @if (managerLoading()) {
          <p-skeleton height="200px" />
        } @else if (managerData().length > 0) {
          <div class="manager-list">
            @for (m of managerData(); track m.manager) {
              <div class="mgr-row">
                <div class="mgr-avatar">{{ managerInitials(m.manager) }}</div>
                <div class="mgr-info">
                  <div class="mgr-name">{{ m.manager }}</div>
                  <div class="mgr-team">{{ m.team_size }} members</div>
                </div>
                <div class="mgr-right">
                  <div class="mgr-stats">
                    <span class="mh-val">{{ m.total_hours | number:'1.0-0' }}h</span>
                    <span class="mh-bill">{{ m.billable_pct }}% billable</span>
                  </div>
                  <div class="mgr-util-wrap">
                    <div class="mgr-bar-track">
                      <div class="mgr-bar-fill"
                        [style.width]="Math.min(m.utilization_pct, 100) + '%'"
                        [class.mgr-low]="m.utilization_pct < 60">
                      </div>
                    </div>
                    <span class="mgr-pct-label">{{ m.utilization_pct }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-section"><i class="pi pi-users"></i><p>No manager data</p></div>
        }
      </div>
    }

    <!-- Business Unit -->
    <div class="dash-card card-bu">
      <div class="card-header">
        <div class="card-title-group">
          <span class="card-title">By Business Unit</span>
          <span class="card-sub">Hours distribution</span>
        </div>
      </div>
      @if (buLoading()) {
        <p-skeleton height="200px" />
      } @else if (buData().length > 0) {
        <div class="bu-list">
          @for (bu of buData(); track bu.bu) {
            <div class="bu-row">
              <div class="bu-meta">
                <span class="bu-name">{{ bu.bu }}</span>
                <span class="bu-res">{{ bu.resources }} resources</span>
              </div>
              <div class="bu-bar-wrap">
                <div class="bu-bar-track">
                  <div class="bu-bar-fill" [style.width]="buBarWidth(bu) + '%'"></div>
                </div>
                <span class="bu-val">{{ bu.hours | number:'1.0-0' }}h</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-section"><i class="pi pi-chart-bar"></i><p>No BU data</p></div>
      }
    </div>

  </div>

  <!-- ══════════ ROW 3: CUSTOM DATE RANGE ══════════ -->
  <div class="dash-card card-drilldown">
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-title">Custom Date Range Analysis</span>
        <span class="card-sub">Pick any from/to range for a detailed breakdown</span>
      </div>
    </div>
    <div class="drill-controls">
      <p-datepicker [(ngModel)]="drillFrom" dateFormat="yy-mm-dd" placeholder="From date" />
      <span class="range-sep">to</span>
      <p-datepicker [(ngModel)]="drillTo" dateFormat="yy-mm-dd" placeholder="To date" />
      <button class="drill-btn" (click)="loadDateRange()"
        [disabled]="!drillFrom || !drillTo || drillLoading()">
        <i class="pi" [class.pi-search]="!drillLoading()"
          [class.pi-spin]="drillLoading()" [class.pi-spinner]="drillLoading()"></i>
        Analyse
      </button>
    </div>
    @if (drillData(); as dd) {
      <div class="drill-body">
        <div class="drill-kpis">
          <div class="dk-item">
            <span class="dk-icon"><i class="pi pi-clock"></i></span>
            <span class="dk-val">{{ dd.total_hours | number:'1.0-0' }}</span>
            <span class="dk-lbl">Total Hours</span>
          </div>
          <div class="dk-divider"></div>
          <div class="dk-item green">
            <span class="dk-icon"><i class="pi pi-dollar"></i></span>
            <span class="dk-val">{{ dd.billable_hours | number:'1.0-0' }}</span>
            <span class="dk-lbl">Billable</span>
          </div>
          <div class="dk-divider"></div>
          <div class="dk-item">
            <span class="dk-icon"><i class="pi pi-briefcase"></i></span>
            <span class="dk-val">{{ dd.projects?.length }}</span>
            <span class="dk-lbl">Projects</span>
          </div>
          <div class="dk-divider"></div>
          <div class="dk-item">
            <span class="dk-icon"><i class="pi pi-calendar"></i></span>
            <span class="dk-val">{{ dd.weeks?.length }}</span>
            <span class="dk-lbl">Weeks</span>
          </div>
        </div>
        @if (drillChartData(); as dc) {
          <div class="drill-chart-wrap">
            <p-chart type="line" [data]="dc" [options]="drillChartOptions" height="160px" />
          </div>
        }
      </div>
    }
  </div>

  <!-- ══════════ TABS: RESOURCES / PROJECTS / BENCH ══════════ -->
  <div class="dash-card card-tabs">

    <p-tabs [(value)]="activeTab" (valueChange)="onTabChange($event)">

      <!-- ── Tab: By Resource ── -->
      <p-tabpanel value="0">
        <ng-template #header>
          <span class="tab-lbl"><i class="pi pi-users"></i> By Resource</span>
        </ng-template>

        <div class="tab-toolbar">
          <div class="search-wrap">
            <i class="pi pi-search search-icon"></i>
            <input class="search-box" placeholder="Search name, ID, BU, manager…"
              [(ngModel)]="resourceSearch" (ngModelChange)="filterResources()" />
          </div>
          <p-select [options]="resourceSortOptions" [(ngModel)]="resourceSort"
            optionLabel="label" optionValue="value"
            (ngModelChange)="sortResources()" styleClass="sort-sel" />
          <span class="res-count">
            <i class="pi pi-users"></i>
            {{ filteredResources().length }} resources
          </span>
        </div>

        @if (resourceLoading()) {
          @for (i of [1,2,3,4,5]; track i) {
            <p-skeleton height="42px" styleClass="mb-2" />
          }
        } @else if (filteredResources().length === 0) {
          <div class="empty-section"><i class="pi pi-search"></i><p>No resources match your search</p></div>
        } @else {
          <div class="res-table-wrap">
            <table class="res-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>BU</th>
                  <th>Manager (IRM)</th>
                  <th class="num-h">Total Hrs</th>
                  <th class="num-h">Billable</th>
                  <th class="num-h">Scheduled</th>
                  <th>Utilization</th>
                  <th class="num-h">Billable %</th>
                </tr>
              </thead>
              <tbody>
                @for (r of pagedResources(); track r.user_id) {
                  <tr>
                    <td><code class="emp-id">{{ r.yash_id }}</code></td>
                    <td>
                      <div class="res-name-cell">
                        <div class="res-av">{{ initials(r.name) }}</div>
                        <span class="res-name">{{ r.name }}</span>
                      </div>
                    </td>
                    <td><span class="bu-chip">{{ r.b_unit }}</span></td>
                    <td><span class="irm-text">{{ r.irm || '—' }}</span></td>
                    <td class="num-td"><strong>{{ r.total_hours }}</strong></td>
                    <td class="num-td green-val">{{ r.billable_hours }}</td>
                    <td class="num-td muted-val">{{ r.scheduled_hours }}</td>
                    <td>
                      <div class="util-cell">
                        <div class="util-track">
                          <div class="util-fill"
                            [style.width]="Math.min(r.utilization_pct, 100) + '%'"
                            [class.uf-low]="r.utilization_pct < 60"
                            [class.uf-high]="r.utilization_pct >= 90">
                          </div>
                        </div>
                        <span class="util-pct" [class.low]="r.utilization_pct < 60">
                          {{ r.utilization_pct }}%
                        </span>
                      </div>
                    </td>
                    <td class="num-td">
                      <span class="bill-pill" [class.bill-high]="r.billable_pct >= 80">
                        {{ r.billable_pct }}%
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="paginator-wrap">
            <p-paginator
              [totalRecords]="filteredResources().length"
              [rows]="resourceRows()"
              [first]="resourceFirst()"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} resources"
              [showCurrentPageReport]="true"
              (onPageChange)="onResourcePageChange($event)" />
          </div>
        }
      </p-tabpanel>

      <!-- ── Tab: By Project ── -->
      <p-tabpanel value="1">
        <ng-template #header>
          <span class="tab-lbl"><i class="pi pi-briefcase"></i> By Project</span>
        </ng-template>

        @if (projectLoading()) {
          <p-skeleton height="320px" />
        } @else {
          @if (projectData(); as pd) {
            <div class="proj-layout">

              <div class="proj-chart-wrap">
                <h4 class="section-sub-title">Top 15 Projects by Hours</h4>
                @if (projectBarData(); as pbd) {
                  <p-chart type="bar" [data]="pbd" [options]="projectBarOptions" [plugins]="barValueLabelsPlugin" height="380px" />
                }
              </div>

              <div class="proj-table-wrap">
                <h4 class="section-sub-title">All Projects</h4>
                <table class="proj-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Type</th>
                      <th class="num-h">Resources</th>
                      <th class="num-h">Hours</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of pd.projects; track p.project) {
                      <tr>
                        <td class="proj-name-td" [title]="p.project">{{ p.project }}</td>
                        <td>
                          <span class="type-pill" [class]="'type-' + (p.type?.toLowerCase() || 'internal')">
                            {{ p.type }}
                          </span>
                        </td>
                        <td class="num-td">{{ p.resources }}</td>
                        <td class="num-td"><strong>{{ p.hours }}</strong></td>
                        <td>
                          <div class="share-wrap">
                            <div class="share-bar" [style.width]="(p.pct * 1.2) + 'px'"></div>
                            <span class="share-pct">{{ p.pct }}%</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          } @else {
            <div class="empty-section"><i class="pi pi-briefcase"></i><p>No project data</p></div>
          }
        }
      </p-tabpanel>

      <!-- ── Tab: Bench Resources ── -->
      <p-tabpanel value="2">
        <ng-template #header>
          <span class="tab-lbl">
            <i class="pi pi-exclamation-triangle"></i>
            Bench Resources
            @if ((benchData()?.resources?.length ?? 0) > 0) {
              <span class="bench-badge">{{ benchData()!.resources.length }}</span>
            }
          </span>
        </ng-template>

        <div class="bench-toolbar">
          <span class="bench-label">Utilization threshold:</span>
          <p-select [options]="thresholdOptions" [(ngModel)]="benchThreshold"
            optionLabel="label" optionValue="value"
            (ngModelChange)="loadBench()" styleClass="thresh-sel" />
          <span class="bench-hint">
            Resources below <strong>{{ benchThreshold }}%</strong> utilization over last 4 weeks
          </span>
        </div>

        @if (benchLoading()) {
          <p-skeleton height="220px" />
        } @else {
          @if (benchData(); as bd) {
            @if (bd.resources?.length === 0) {
              <div class="bench-empty">
                <i class="pi pi-check-circle"></i>
                <p>All resources are above {{ benchThreshold }}% utilization — excellent!</p>
              </div>
            } @else {
              <div class="bench-table-wrap">
                <table class="bench-table">
                  <thead >
                    <tr >
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>BU</th>
                      <th>Manager</th>
                      <th class="num-h">Logged Hrs</th>
                      <th class="num-h">Scheduled</th>
                      <th class="num-h">Gap</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of bd.resources; track r.user_id) {
                      <tr class="bench-row">
                        <td><code class="emp-id">{{ r.yash_id }}</code></td>
                        <td><strong>{{ r.name }}</strong></td>
                        <td><span class="bu-chip">{{ r.b_unit }}</span></td>
                        <td><span class="irm-text">{{ r.irm || '—' }}</span></td>
                        <td class="num-td">{{ r.logged_hours }}</td>
                        <td class="num-td muted-val">{{ r.scheduled_hours }}</td>
                        <td class="num-td">
                          <span class="gap-badge">–{{ r.gap_hours }}h</span>
                        </td>
                        <td>
                          <div class="util-cell">
                            <div class="util-track">
                              <div class="util-fill uf-low" [style.width]="r.utilization_pct + '%'"></div>
                            </div>
                            <span class="util-pct low">{{ r.utilization_pct }}%</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        }
      </p-tabpanel>

    </p-tabs>
  </div>

</div>
  `,
  styles: [`
    /* ─────────────────────────────────────────────────
       CSS Custom Properties
    ───────────────────────────────────────────────── */
    :host {
      --navy:      #1E3A5F;
      --navy-light:#2B5086;
      --green:     #16A34A;
      --green-bg:  #F0FDF4;
      --green-muted:#DCFCE7;
      --blue:      #3B82F6;
      --blue-bg:   #EFF6FF;
      --purple:    #7C3AED;
      --purple-bg: #FAF5FF;
      --amber:     #D97706;
      --amber-bg:  #FFFBEB;
      --red:       #DC2626;
      --red-bg:    #FEF2F2;
      --sky:       #0284C7;
      --sky-bg:    #F0F9FF;
      --slate-50:  #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-400: #94A3B8;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1E293B;
      --slate-900: #0F172A;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
      --shadow-lg: 0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06);
    }

    /* ─── Page Shell ─── */
    .dash-page {
      padding: 1.75rem 2rem;
      max-width: 1680px;
      margin: 0 auto;
      background: #fff;
      
      border-radius: 14px;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    /* ─── Header ─── */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .dash-title-row {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .dash-icon-wrap {
      width: 44px;
      height: 44px;
      background: var(--navy);
      color: white;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(30,58,95,0.25);
    }
    .dash-title {
      font-size: var(--fs-page-title);
      font-weight: 800;
      color: var(--slate-900);
      margin: 0 0 0.1rem;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }
    .dash-sub { font-size: var(--fs-page-sub); color: var(--slate-400); }
    .dash-header-right {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex-wrap: wrap;
    }

    .period-tabs {
      display: flex;
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 3px;
      gap: 2px;
      box-shadow: var(--shadow-sm);
    }
    .ptab {
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      padding: 5px 12px;
      font-size: 0.77rem;
      font-weight: 500;
      color: var(--slate-500);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .ptab:hover { color: var(--navy); background: var(--slate-100); }
    .ptab.active {
      background: var(--navy);
      color: white;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(30,58,95,0.3);
    }

    .custom-range { display: flex; align-items: center; gap: 0.5rem; }
    .range-sep { font-size: 0.78rem; color: var(--slate-400); font-weight: 600; }

    ::ng-deep .year-sel .p-select { min-width: 92px !important; }
    .refresh-btn {
      width: 36px;
      height: 36px;
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--slate-500);
      transition: all 0.15s;
      box-shadow: var(--shadow-sm);
      flex-shrink: 0;
    }
    .refresh-btn:hover { background: var(--slate-100); color: var(--navy); border-color: var(--slate-300); }
    .refresh-btn.spinning i { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─────────────────────────────────────────────────
       KPI STRIP
    ───────────────────────────────────────────────── */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .kpi-card {
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.15s;
      box-shadow: var(--shadow-sm);
    }
    .kpi-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    }
    .kpi-total::before    { background: var(--navy); }
    .kpi-billable::before { background: var(--green); }
    .kpi-util::before     { background: var(--purple); }
    .kpi-resources::before{ background: var(--sky); }
    .kpi-compliance::before{ background: var(--amber); }
    .kpi-skel::before     { display: none; }

    .kpi-skel {
      background: white;
      border-style: dashed;
      padding: 1.1rem 1.25rem;
      gap: 0.5rem;
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.2rem;
    }
    .kpi-lbl {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      flex-shrink: 0;
    }
    .kpi-icon-blue   { background: #EEF2FF; color: #4F46E5; }
    .kpi-icon-green  { background: var(--green-bg); color: var(--green); }
    .kpi-icon-purple { background: var(--purple-bg); color: var(--purple); }
    .kpi-icon-sky    { background: var(--sky-bg); color: var(--sky); }
    .kpi-icon-amber  { background: var(--amber-bg); color: var(--amber); }
    .kpi-icon-red    { background: var(--red-bg); color: var(--red); }

    .kpi-val {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--slate-900);
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .kpi-val-danger { color: var(--red); }

    .kpi-footer {
      margin-top: 0.2rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .kpi-period-tag {
      font-size: 0.68rem;
      color: var(--slate-400);
      background: var(--slate-100);
      padding: 2px 7px;
      border-radius: 20px;
      font-weight: 500;
    }
    .kpi-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
    }
    .kpi-badge-green  { background: var(--green-muted); color: #166534; }
    .kpi-badge-orange { background: #FEF3C7; color: #92400E; }
    .kpi-muted        { font-size: 0.69rem; color: var(--slate-400); }

    .kpi-progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.3rem;
    }
    .kpi-progress-track {
      flex: 1;
      height: 5px;
      background: var(--slate-200);
      border-radius: 3px;
      overflow: hidden;
    }
    .kpi-progress-fill {
      height: 100%;
      background: var(--purple);
      border-radius: 3px;
      transition: width 0.6s ease;
    }
    .kpi-progress-danger { background: var(--red); }
    .kpi-progress-warn   { background: var(--amber); }
    .kpi-prog-label {
      font-size: 0.64rem;
      color: var(--slate-400);
      white-space: nowrap;
      font-weight: 500;
    }

    /* ─────────────────────────────────────────────────
       Layout Rows
    ───────────────────────────────────────────────── */
    .dash-row {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .dash-row-trend {
      grid-template-columns: 1fr 320px;
    }
    .dash-row-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    /* ─────────────────────────────────────────────────
       Cards
    ───────────────────────────────────────────────── */
    .dash-card {
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      min-width: 0;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.1rem;
      gap: 0.5rem;
    }
    .card-title-group {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .card-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--slate-800);
      line-height: 1.2;
    }
    .card-sub { font-size: 0.72rem; color: var(--slate-400); }

    /* ─── Trend Chart ─── */
    .trend-tabs {
      display: flex;
      gap: 2px;
      background: var(--slate-100);
      border-radius: var(--radius-sm);
      padding: 2px;
      flex-shrink: 0;
    }
    .ttab {
      background: none;
      border: none;
      border-radius: 4px;
      padding: 3px 10px;
      font-size: 0.73rem;
      font-weight: 500;
      color: var(--slate-500);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .ttab.active {
      background: white;
      color: var(--navy);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }
    .chart-area { width: 100%; max-width: 100%; overflow: hidden; }
    ::ng-deep .chart-area canvas, ::ng-deep .donut-chart-wrap canvas { max-width: 100% !important; }
    .chart-skel-wrap { }
    .empty-chart {
      height: 260px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--slate-300);
      gap: 0.5rem;
    }
    .empty-chart i { font-size: 2rem; }
    .empty-chart p { font-size: 0.83rem; margin: 0; }

    /* ─── Donut ─── */
    .donut-skel { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 0; }
    .donut-skel-legend { flex: 1; }
    .donut-layout {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      height: 100%;
    }
    .donut-chart-wrap {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }
    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
      line-height: 1.1;
    }
    .donut-total {
      display: block;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
    }
    .donut-total-lbl {
      display: block;
      font-size: 0.62rem;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .legend-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.79rem;
      padding: 0.3rem 0.5rem;
      border-radius: var(--radius-sm);
      transition: background 0.12s;
    }
    .legend-row:hover { background: var(--slate-50); }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-label { flex: 1; color: var(--slate-600); font-weight: 500; }
    .legend-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .legend-val {
      font-weight: 700;
      color: var(--slate-800);
      font-size: 0.8rem;
      min-width: 44px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .legend-pct {
      font-size: 0.7rem;
      color: var(--slate-400);
      min-width: 34px;
      text-align: right;
      background: var(--slate-100);
      padding: 1px 6px;
      border-radius: 20px;
    }

    /* ─── Compliance ─── */
    .compliance-skel { display: flex; flex-direction: column; gap: 0.4rem; }
    .compliance-bars { display: flex; flex-direction: column; gap: 0.5rem; }
    .cb-row { display: flex; align-items: center; gap: 0.625rem; }
    .cb-label {
      font-size: 0.71rem;
      color: var(--slate-500);
      min-width: 48px;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .cb-track {
      flex: 1;
      height: 8px;
      background: var(--slate-100);
      border-radius: 4px;
      overflow: hidden;
    }
    .cb-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .cb-high { background: var(--green); }
    .cb-mid  { background: var(--amber); }
    .cb-low  { background: var(--red); }
    .cb-right {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .cb-pct {
      font-size: 0.71rem;
      font-weight: 700;
      min-width: 32px;
      text-align: right;
      color: var(--slate-700);
      font-variant-numeric: tabular-nums;
    }
    .cb-pct.low { color: var(--red); }
    .cb-detail {
      font-size: 0.67rem;
      color: var(--slate-400);
      min-width: 28px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* ─── Manager ─── */
    .manager-list { display: flex; flex-direction: column; }
    .mgr-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--slate-100);
    }
    .mgr-row:last-child { border-bottom: none; }
    .mgr-avatar {
      width: 32px;
      height: 32px;
      background: var(--navy);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.63rem;
      font-weight: 800;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }
    .mgr-info { flex: 1; min-width: 0; }
    .mgr-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--slate-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mgr-team { font-size: 0.67rem; color: var(--slate-400); }
    .mgr-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      min-width: 96px;
    }
    .mgr-stats {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }
    .mh-val { font-size: 0.84rem; font-weight: 700; color: var(--slate-900); }
    .mh-bill { font-size: 0.66rem; color: var(--green); font-weight: 600; }
    .mgr-util-wrap {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      width: 100%;
    }
    .mgr-bar-track {
      flex: 1;
      height: 4px;
      background: var(--slate-200);
      border-radius: 2px;
      overflow: hidden;
    }
    .mgr-bar-fill { height: 100%; background: var(--navy); border-radius: 2px; }
    .mgr-bar-fill.mgr-low { background: var(--red); }
    .mgr-pct-label { font-size: 0.65rem; color: var(--slate-500); min-width: 28px; text-align: right; }

    /* ─── BU ─── */
    .bu-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .bu-row { display: flex; align-items: center; gap: 0.75rem; }
    .bu-meta { min-width: 90px; flex-shrink: 0; }
    .bu-name {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--slate-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bu-res { font-size: 0.65rem; color: var(--slate-400); }
    .bu-bar-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
    .bu-bar-track {
      flex: 1;
      height: 7px;
      background: var(--slate-100);
      border-radius: 4px;
      overflow: hidden;
    }
    .bu-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--navy), #3B82F6);
      border-radius: 4px;
      transition: width 0.6s ease;
    }
    .bu-val {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--slate-700);
      min-width: 48px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* ─── Drill-down ─── */
    .card-drilldown { margin-bottom: 1rem; }
    .drill-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .drill-btn {
      background: var(--navy);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      padding: 0.5rem 1.25rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.15s, box-shadow 0.15s;
      box-shadow: 0 2px 8px rgba(30,58,95,0.25);
    }
    .drill-btn:hover:not(:disabled) { background: var(--navy-light); box-shadow: 0 4px 12px rgba(30,58,95,0.35); }
    .drill-btn:disabled { opacity: 0.45; cursor: default; box-shadow: none; }

    .drill-body { }
    .drill-kpis {
      display: flex;
      align-items: stretch;
      gap: 0;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 1.25rem;
    }
    .dk-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      padding: 1rem 0.5rem;
    }
    .dk-item.green .dk-val { color: var(--green); }
    .dk-icon { font-size: 0.9rem; color: var(--slate-400); margin-bottom: 0.1rem; }
    .dk-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .dk-lbl {
      font-size: 0.66rem;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .dk-divider {
      width: 1px;
      background: var(--slate-200);
      align-self: stretch;
    }
    .drill-chart-wrap { }

    /* ─── Tabs ─── */
    .card-tabs { padding: 0; overflow: hidden; margin-bottom: 0; }
    ::ng-deep .card-tabs .p-tabs-nav {
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
      padding: 0 1.25rem;
    }
    ::ng-deep .card-tabs .p-tabpanels { padding: 1.25rem; }
    .tab-lbl { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; }
    .bench-badge {
      background: #EF4444;
      color: white;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 20px;
      margin-left: 2px;
      line-height: 1.4;
    }

    /* ─── Tab Toolbar ─── */
    .tab-toolbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 10px;
      font-size: 0.78rem;
      color: var(--slate-400);
      pointer-events: none;
    }
    .search-box {
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 7px 12px 7px 30px;
      font-size: 0.82rem;
      outline: none;
      width: 260px;
      transition: border-color 0.15s, box-shadow 0.15s;
      background: white;
      color: var(--slate-800);
    }
    .search-box:focus {
      border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
    }
    ::ng-deep .sort-sel .p-select { min-width: 195px !important; }
    .res-count {
      font-size: 0.76rem;
      color: var(--slate-400);
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: var(--slate-100);
      padding: 4px 10px;
      border-radius: 20px;
    }

    /* ─── Resource Table ─── */
    .res-table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-200);
    }
    .paginator-wrap {
      display: flex;
      justify-content: flex-end;
      padding: 0.65rem 0.25rem 0 0.25rem;
    }
    .res-table { width: 100%; border-collapse: collapse; font-size: 0.81rem; }
    .res-table thead th {
      background: var(--slate-50);
      padding: 0.65rem 0.875rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.72rem;
      color: var(--slate-500);
      border-bottom: 2px solid var(--slate-200);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      position: sticky;
      top: 0;
    }
    .num-h { text-align: right !important; }
    .res-table tbody tr { border-bottom: 1px solid var(--slate-100); }
    .res-table tbody tr:hover { background: #FAFAFA; }
    .res-table tbody tr:last-child { border-bottom: none; }
    .res-table tbody td {
      padding: 0.55rem 0.875rem;
      vertical-align: middle;
    }

    .emp-id {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.72rem;
      background: var(--slate-100);
      color: var(--slate-600);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .res-name-cell { display: flex; align-items: center; gap: 0.5rem; }
    .res-av {
      width: 26px;
      height: 26px;
      background: var(--navy);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.58rem;
      font-weight: 800;
      flex-shrink: 0;
      letter-spacing: 0.03em;
    }
    .res-name { font-weight: 500; color: var(--slate-800); white-space: nowrap; }
    .bu-chip {
      font-size: 0.69rem;
      background: #EEF2FF;
      color: #4338CA;
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: 600;
      white-space: nowrap;
    }
    .irm-text { font-size: 0.76rem; color: var(--slate-500); }
    .num-td {
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: var(--slate-700);
    }
    .green-val  { color: var(--green); font-weight: 600; }
    .orange-val { color: #EA580C; }
    .muted-val  { color: var(--slate-400); }

    .util-cell { display: flex; align-items: center; gap: 0.45rem; min-width: 110px; }
    .util-track {
      flex: 1;
      height: 6px;
      background: var(--slate-200);
      border-radius: 3px;
      overflow: hidden;
    }
    .util-fill {
      height: 100%;
      background: var(--navy);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .uf-low  { background: var(--red) !important; }
    .uf-high { background: var(--green) !important; }
    .util-pct {
      font-size: 0.73rem;
      font-weight: 600;
      color: var(--slate-700);
      min-width: 34px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .util-pct.low { color: var(--red); }
    .bill-pill {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
      background: var(--slate-100);
      color: var(--slate-600);
    }
    .bill-high { background: var(--green-muted) !important; color: #166534 !important; }

    /* ─── Project Tab ─── */
    .proj-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .section-sub-title {
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.875rem;
    }
    .proj-chart-wrap { }
    .proj-table-wrap { overflow-y: auto; max-height: 420px; }
    .proj-table { width: 100%; border-collapse: collapse; font-size: 0.79rem; }
    .proj-table thead th {
      background: var(--slate-50);
      padding: 0.5rem 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.7rem;
      color: var(--slate-500);
      border-bottom: 2px solid var(--slate-200);
      position: sticky;
      top: 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .proj-table tbody tr { border-bottom: 1px solid var(--slate-100); }
    .proj-table tbody tr:hover { background: #FAFAFA; }
    .proj-table tbody td { padding: 0.45rem 0.75rem; }
    .proj-name-td {
      font-weight: 500;
      color: var(--slate-800);
      max-width: 160px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .type-pill {
      font-size: 0.63rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .type-billable { background: var(--green-muted); color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave    { background: #FEF3C7; color: #92400E; }
    .type-pmo      { background: #F3E8FF; color: #7C3AED; }
    .share-wrap { display: flex; align-items: center; gap: 0.4rem; }
    .share-bar { height: 6px; background: var(--navy); border-radius: 3px; min-width: 2px; opacity: 0.7; }
    .share-pct { font-size: 0.69rem; color: var(--slate-500); min-width: 34px; font-variant-numeric: tabular-nums; }

    /* ─── Bench ─── */
    .bench-toolbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      padding: 0.75rem 1rem;
      background: var(--slate-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-200);
    }
    .bench-label { font-size: 0.78rem; font-weight: 600; color: var(--slate-600); }
    ::ng-deep .thresh-sel .p-select { min-width: 120px !important; }
    .bench-hint { font-size: 0.75rem; color: var(--slate-400); }
    .bench-empty { text-align: center; padding: 3rem; color: var(--green); }
    .bench-empty i { font-size: 2.25rem; display: block; margin-bottom: 0.75rem; }
    .bench-empty p { font-size: 0.86rem; font-weight: 600; margin: 0; }

    .bench-table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid #FECACA;
    }
    .bench-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .bench-table thead th {
      background: #FEF2F2;
      padding: 0.65rem 0.875rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.7rem;
      color: #991B1B;
      border-bottom: 2px solid #FECACA;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .bench-row { border-bottom: 1px solid #FFF1F2; }
    .bench-row:last-child { border-bottom: none; }
    .bench-row:hover { background: #FFF5F5; }
    .bench-row td { padding: 0.55rem 0.875rem; vertical-align: middle; }
    .gap-badge {
      font-size: 0.71rem;
      font-weight: 700;
      color: var(--red);
      background: #FEE2E2;
      padding: 2px 7px;
      border-radius: 20px;
    }

    /* ─── Empty state ─── */
    .empty-section {
      text-align: center;
      padding: 2.5rem;
      color: var(--slate-300);
    }
    .empty-section i { font-size: 1.75rem; display: block; margin-bottom: 0.5rem; }
    .empty-section p { font-size: 0.84rem; margin: 0; color: var(--slate-400); }

    /* ─── Responsive ─── */
    @media (max-width: 1400px) {
      .kpi-strip { grid-template-columns: repeat(3, 1fr); }
      .dash-row-trend { grid-template-columns: 1fr; }
      .donut-layout { flex-direction: row; align-items: center; }
      .donut-layout .donut-chart-wrap { flex-shrink: 0; }
    }
    @media (max-width: 1100px) {
      .dash-row-3 { grid-template-columns: 1fr 1fr; }
      .proj-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .dash-page { padding: 1rem; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
      .dash-row-3 { grid-template-columns: 1fr; }
      .kpi-val { font-size: 1.45rem; }
    }
    @media (max-width: 480px) {
      .kpi-strip { grid-template-columns: 1fr 1fr; gap: 0.625rem; }
      .dash-header { flex-direction: column; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  Math = Math;
  activeTab = '0';

  // ── Loading signals ──
  summaryLoading    = signal(false);
  resourceLoading   = signal(false);
  trendLoading      = signal(false);
  complianceLoading = signal(false);
  managerLoading    = signal(false);
  buLoading         = signal(false);
  projectLoading    = signal(false);
  benchLoading      = signal(false);
  drillLoading      = signal(false);

  anyLoading = computed(() =>
    this.summaryLoading() || this.resourceLoading() || this.trendLoading()
  );

  // ── Data signals ──
  summary           = signal<any>(null);
  resourceData      = signal<any[]>([]);
  filteredResources = signal<any[]>([]);
  resourceFirst     = signal(0);
  resourceRows      = signal(10);
  pagedResources     = computed(() => {
    const first = this.resourceFirst();
    const rows  = this.resourceRows();
    return this.filteredResources().slice(first, first + rows);
  });
  trendData         = signal<any>(null);
  complianceData    = signal<any>(null);
  managerData       = signal<any[]>([]);
  buData            = signal<any[]>([]);
  projectData       = signal<any>(null);
  benchData         = signal<any>(null);
  drillData         = signal<any>(null);

  // ── Filter state ──
  activePeriod   = signal<string>('ytd');
  selectedYear   = new Date().getFullYear();
  fromDate: Date | null = null;
  toDate:   Date | null = null;
  drillFrom: Date | null = null;
  drillTo:   Date | null = null;
  trendView      = signal<'week' | 'month' | 'year'>('month');
  resourceSearch = '';
  resourceSort   = 'total_hours_desc';
  benchThreshold = 50;

  yearOptions = Array.from({ length: 4 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: y.toString(), value: y };
  });

  periodPresets = [
    { key: 'this_week',   label: 'This Week' },
    { key: 'this_month',  label: 'This Month' },
    { key: 'last_month',  label: 'Last Month' },
    { key: 'qtd',         label: 'QTD' },
    { key: 'ytd',         label: 'YTD' },
    { key: 'custom',      label: 'Custom' },
  ];

  resourceSortOptions = [
    { label: 'Highest Hours',      value: 'total_hours_desc' },
    { label: 'Lowest Hours',       value: 'total_hours_asc'  },
    { label: 'Best Utilization',   value: 'util_desc'        },
    { label: 'Lowest Utilization', value: 'util_asc'         },
    { label: 'Best Billable %',    value: 'bill_desc'        },
    { label: 'Name A–Z',           value: 'name_asc'         },
  ];

  thresholdOptions = [
    { label: '< 30%', value: 30 },
    { label: '< 50%', value: 50 },
    { label: '< 70%', value: 70 },
    { label: '< 80%', value: 80 },
  ];

  get activeFilters() {
    const f: Record<string, any> = { year: this.selectedYear };
    if (this.fromDate) f['from_date'] = this.toIso(this.fromDate);
    if (this.toDate)   f['to_date']   = this.toIso(this.toDate);
    return f;
  }

  periodLabel = computed(() => {
    const p = this.activePeriod();
    if (p === 'ytd')        return `YTD ${this.selectedYear}`;
    if (p === 'this_month') return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (p === 'this_week')  return 'This Week';
    if (p === 'custom' && this.fromDate && this.toDate)
      return `${this.toIso(this.fromDate)} → ${this.toIso(this.toDate)}`;
    return `${this.selectedYear}`;
  });

  constructor(
    private dashService: DashboardService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Managers/BUH/Superadmin land on Month-to-Date; plain Users land on This Week.
    const defaultKey = this.isManagerOrAdmin() ? 'this_month' : 'this_week';
    this.applyPreset(this.periodPresets.find(p => p.key === defaultKey)!);
  }

  // Local Y/M/D formatting (NOT toISOString) — toISOString() converts to UTC first,
  // which silently shifts the date back a day for any positive UTC-offset timezone
  // (e.g. IST, UTC+5:30) whenever the Date is pinned to local midnight (all of our
  // preset/date-range values are). That was cutting the *last* day off ranges like
  // "This Month"/"Custom" and silently widening the start, causing Dashboard totals
  // to disagree with the Reports page for the same period.
  toIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isManagerOrAdmin(): boolean {
    const u = this.authService.userValue;
    return !!(u?.type && ['Superadmin', 'BUH', 'manager', 'admin'].includes(u.type));
  }

  applyPreset(p: { key: string; label: string }) {
    this.activePeriod.set(p.key);
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    if (p.key === 'this_week') {
      const day = today.getDay();
      const mon = new Date(today); mon.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      this.fromDate = mon; this.toDate = sun;
    } else if (p.key === 'this_month') {
      this.fromDate = new Date(y, m, 1);     this.toDate = new Date(y, m + 1, 0);
    } else if (p.key === 'last_month') {
      this.fromDate = new Date(y, m - 1, 1); this.toDate = new Date(y, m, 0);
    } else if (p.key === 'qtd') {
      const q = Math.floor(m / 3);
      this.fromDate = new Date(y, q * 3, 1); this.toDate = new Date(y, q * 3 + 3, 0);
    } else if (p.key === 'ytd') {
      // Clicking the YTD preset fresh always means "this year to date" —
      // reset selectedYear so a previously-picked past year doesn't linger
      // (the year dropdown itself is only shown while activePeriod === 'ytd').
      this.selectedYear = y;
      this.fromDate = new Date(y, 0, 1);     this.toDate = today;
    } else {
      return;
    }
    this.loadAll();
  }

  onCustomRange()  { if (this.fromDate && this.toDate) this.loadAll(); }

  onYearChange() {
    // The backend only falls back to `year` when from_date/to_date are absent
    // (see dashboard.py's `if not from_date: from_date = date(year, 1, 1)`),
    // and applyPreset('ytd') always sets fromDate/toDate before this can run.
    // So picking a different year here must also recompute fromDate/toDate —
    // otherwise the request still carries the old year's dates and the
    // (ignored) new `year` param, and the dashboard silently keeps showing
    // the previously-selected year's data.
    const y = this.selectedYear;
    const today = new Date();
    this.fromDate = new Date(y, 0, 1);
    this.toDate   = (y === today.getFullYear()) ? today : new Date(y, 11, 31);
    this.loadAll();
  }

  loadAll() {
    this.loadSummary();
    this.loadResources();
    this.loadTrend();
    this.loadCompliance();
    if (this.isManagerOrAdmin()) this.loadManagers();
    this.loadBU();
    this.loadProjects();
  }

  private handle<T>(loading: ReturnType<typeof signal<boolean>>, sig: ReturnType<typeof signal<T>>) {
    return {
      next: (d: T) => { sig.set(d); loading.set(false); this.cdr.markForCheck(); },
      error: (_: any) => { loading.set(false); this.cdr.markForCheck(); },
    };
  }

  loadSummary()    { this.summaryLoading.set(true);    this.dashService.getSummary(this.activeFilters).subscribe(this.handle(this.summaryLoading, this.summary)); }
  loadResources()  { this.resourceLoading.set(true);   this.dashService.getByResource(this.activeFilters).subscribe({ next: (d: any[]) => { this.resourceData.set(d); this.filteredResources.set(d); this.resourceFirst.set(0); this.sortResources(); this.resourceLoading.set(false); this.cdr.markForCheck(); }, error: () => this.resourceLoading.set(false) }); }
  loadCompliance() { this.complianceLoading.set(true); this.dashService.getSubmissionCompliance(8).subscribe(this.handle(this.complianceLoading, this.complianceData)); }
  loadManagers()   { this.managerLoading.set(true);    this.dashService.getByManager(this.activeFilters).subscribe(this.handle(this.managerLoading, this.managerData)); }
  loadBU()         { this.buLoading.set(true);         this.dashService.getByBusinessUnit(this.activeFilters).subscribe(this.handle(this.buLoading, this.buData)); }
  loadProjects()   { this.projectLoading.set(true);    this.dashService.getByProject(this.activeFilters).subscribe(this.handle(this.projectLoading, this.projectData)); }
  loadBench()      { this.benchLoading.set(true);      this.dashService.getBenchResources(this.benchThreshold, 4).subscribe(this.handle(this.benchLoading, this.benchData)); }

  loadTrend() {
  const filters = this.activeFilters;

  this.trendLoading.set(true);

  if (this.trendView() === 'month') {
    this.dashService.getMonthWise(filters).subscribe(res => {
      this.trendData.set(res);
      this.trendLoading.set(false);
    });
  }

  if (this.trendView() === 'week') {
    this.dashService.getWeekWise(filters).subscribe(res => {
      this.trendData.set(res);
      this.trendLoading.set(false);
    });
  }
}

  loadDateRange() {
    if (!this.drillFrom || !this.drillTo) return;
    this.drillLoading.set(true);
    this.dashService.getByDateRange(this.toIso(this.drillFrom), this.toIso(this.drillTo))
      .subscribe(this.handle(this.drillLoading, this.drillData));
  }

  setTrendView(v: 'week' | 'month' | 'year') { this.trendView.set(v); this.loadTrend(); }

  onTabChange(value: unknown) {
    const idx = Number(value);
    if (idx === 1 && !this.projectData()) this.loadProjects();
    if (idx === 2 && !this.benchData())   this.loadBench();
  }

  filterResources() {
    const term = this.resourceSearch.toLowerCase();
    const filtered = term
      ? this.resourceData().filter(r =>
          r.name.toLowerCase().includes(term)     ||
          r.yash_id.toLowerCase().includes(term)  ||
          (r.b_unit || '').toLowerCase().includes(term) ||
          (r.irm    || '').toLowerCase().includes(term))
      : [...this.resourceData()];
    this.filteredResources.set(filtered);
    this.resourceFirst.set(0);
    this.sortResources();
  }

  sortResources() {
    this.filteredResources.update(list => {
      const s = [...list];
      switch (this.resourceSort) {
        case 'total_hours_desc': s.sort((a, b) => b.total_hours - a.total_hours); break;
        case 'total_hours_asc':  s.sort((a, b) => a.total_hours - b.total_hours); break;
        case 'util_desc':        s.sort((a, b) => b.utilization_pct - a.utilization_pct); break;
        case 'util_asc':         s.sort((a, b) => a.utilization_pct - b.utilization_pct); break;
        case 'bill_desc':        s.sort((a, b) => b.billable_pct - a.billable_pct); break;
        case 'name_asc':         s.sort((a, b) => a.name.localeCompare(b.name)); break;
      }
      return s;
    });
  }

  onResourcePageChange(event: any) { this.resourceFirst.set(event.first); this.resourceRows.set(event.rows); }

  initials(name: string)        { return (name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2); }
  managerInitials(name: string) { return this.initials(name); }

  buBarWidth(bu: any) {
    const max = Math.max(...this.buData().map((b: any) => b.hours), 1);
    return Math.round((bu.hours / max) * 100);
  }

  // ── Chart builders ──

  // Draws each bar's value right on/next to the bar itself (above it for a
  // vertical bar chart, to the right of it for a horizontal one), so the
  // same figure the tooltip already shows on hover is always visible.
  // Registered per-chart via p-chart's [plugins] input — shared by the trend
  // chart and the Top-15-Projects chart below (both are bar charts; the
  // doughnut already surfaces exact values via its side legend, and the
  // drill-down line chart is a different shape, so neither was touched).
  barValueLabelsPlugin = [{
    id: 'barValueLabels',
    afterDatasetsDraw: (chart: any) => {
      const { ctx } = chart;
      const horizontal = chart.options?.indexAxis === 'y';
      chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;
        meta.data.forEach((bar: any, index: number) => {
          const value = dataset.data[index];
          if (!value) return;
          ctx.save();
          ctx.fillStyle = '#374151';
          ctx.font = '600 10px sans-serif';
          if (horizontal) {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${value}`, bar.x + 6, bar.y);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${value}`, bar.x, bar.y - 4);
          }
          ctx.restore();
        });
      });
    },
  }];

  trendChartData = computed(() => {
    const d = this.trendData();
    if (!d) return null;
    const view  = this.trendView();
    const items: any[] = view === 'week'  ? (d.weeks  ?? [])
                       : view === 'month' ? (d.months ?? [])
                       :                   (d.years  ?? []);
    if (!items.length) return null;
    return {
      labels: items.map((i: any) => view === 'year' ? String(i.year) : (i.week ?? i.month ?? '')),
      datasets: [
        { label: 'Billable',  data: items.map((i: any) => i.billable  ?? 0), backgroundColor: '#16A34A', borderRadius: 5, stack: 'A', borderSkipped: false },
      ]
    };
  });

  trendChartOptions = {
    responsive: true,
    layout: { padding: { top: 20 } },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: { font: { size: 11 }, padding: 16, usePointStyle: true, pointStyle: 'circle' as const }
      },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
      y: { stacked: true, beginAtZero: true, grace: '10%', grid: { color: '#F1F5F9', drawBorder: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } }
    }
  };

  hoursTypeChartData = computed(() => {
    const s = this.summary();
    if (!s) return null;
    return {
      labels: ['Billable'],
      datasets: [{
        data: [s.billable_hours],
        backgroundColor: ['#16A34A'],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    };
  });

  hoursTypeLegend = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const total = s.total_hours || 1;
    return [
      { label: 'Billable',  hours: s.billable_hours,  pct: +((s.billable_hours  / total) * 100).toFixed(1), color: '#16A34A' },
    ];
  });

  donutOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} hrs` } }
    }
  };

  drillChartData = computed(() => {
    const d = this.drillData();
    if (!d?.weeks?.length) return null;
    return {
      labels: d.weeks.map((w: any) => w.week),
      datasets: [
        { label: 'Total',    data: d.weeks.map((w: any) => w.total),    borderColor: '#1E3A5F', backgroundColor: 'rgba(30,58,95,0.07)',  fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#1E3A5F' },
        { label: 'Billable', data: d.weeks.map((w: any) => w.billable), borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.05)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#16A34A' },
      ]
    };
  });

  drillChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, align: 'start' as const, labels: { font: { size: 10 }, padding: 12, usePointStyle: true, pointStyle: 'circle' as const } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
      y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
    }
  };

  projectBarData = computed(() => {
    const d = this.projectData();
    if (!d?.projects?.length) return null;
    const top = d.projects.slice(0, 15);
    const colorMap: Record<string, string> = { Billable: '#16A34A', Internal: '#3B82F6', Leave: '#F59E0B', PMO: '#8B5CF6' };
    return {
      labels: top.map((p: any) => p.project.length > 24 ? p.project.slice(0, 24) + '…' : p.project),
      datasets: [{
        label: 'Hours',
        data: top.map((p: any) => p.hours),
        backgroundColor: top.map((p: any) => colorMap[p.type] ?? '#94A3B8'),
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  });

  projectBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    layout: { padding: { right: 32 } },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} hrs` } }
    },
    scales: {
      x: { beginAtZero: true, grace: '10%', grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
      y: { grid: { display: false  }, ticks: { font: { size: 9 }, color: '#475569' } }
    }
  };
}