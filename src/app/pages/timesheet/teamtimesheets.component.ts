import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TimesheetService } from '../service/timsheet.service';
import { AuthenticationService } from '../service/authentication.service';
import { Card } from "primeng/card";

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

interface TeamResponse {
  week_start: string;
  week_end: string;
  data: TeamMember[];
}

@Component({
  selector: 'app-team-timesheets',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, TagModule, ButtonModule, DialogModule,
    ToastModule, SelectModule, TooltipModule, SkeletonModule,
    TextareaModule, ConfirmDialogModule,
    Card
],
  providers: [MessageService, ConfirmationService],
  template: `
<p-card>
  <p-toast position="top-right" />
<p-confirmDialog />

<div class="team-page">

  <!-- ── Header ── -->
  <div class="team-header">
    <div>
      <h2 class="team-title">Team Timesheets</h2>
      <span class="team-sub">Review and approve your team's weekly timesheets</span>
    </div>
    <div class="team-controls">
      <!-- Week navigator -->
      <div class="week-nav-group">
        <button class="wk-btn" (click)="shiftWeek(-1)"><i class="pi pi-chevron-left"></i></button>
        <div class="wk-label">
          <span class="wk-range">{{ weekLabel }}</span>
          <span class="wk-year">{{ weekYear }}</span>
        </div>
        <button class="wk-btn" (click)="shiftWeek(1)"><i class="pi pi-chevron-right"></i></button>
      </div>

      <p-select
        [options]="statusFilterOptions"
        [(ngModel)]="selectedStatus"
        optionLabel="label" optionValue="value"
        placeholder="All Statuses"
        (ngModelChange)="applyStatusFilter()"
        styleClass="status-filter-select"
      />

      <button class="reload-btn" (click)="loadTeam()" [disabled]="loading()">
        <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
      </button>
    </div>
  </div>

  <!-- ── Status Summary Cards ── -->
  <div class="status-cards">
    @for (card of statusCards(); track card.label) {
      <div class="stat-card" [class]="'stat-' + card.key"
        [class.active]="selectedStatus === card.filterVal"
        (click)="filterByStatus(card.filterVal)">
        <div class="sc-count">{{ card.count }}</div>
        <div class="sc-label">{{ card.label }}</div>
        @if (card.key === 'pending') {
          <div class="sc-badge pulse"></div>
        }
      </div>
    }
  </div>

  <!-- ── Main Table ── -->
  <div class="team-table-card">
    <div class="table-toolbar">
      <span class="tb-info">
        Showing <strong>{{ filteredData().length }}</strong> of <strong>{{ allTeamData().length }}</strong> members
        &nbsp;·&nbsp; Week: <strong>{{ weekLabel }}, {{ weekYear }}</strong>
      </span>
      @if (pendingCount() > 0 && !selectedStatus) {
        <button class="bulk-approve-btn" (click)="bulkApproveConfirm()">
          <i class="pi pi-check-circle"></i>
          Approve All Submitted ({{ pendingCount() }})
        </button>
      }
    </div>

    @if (loading()) {
      <div class="skeleton-rows">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="skel-row">
            <p-skeleton width="80px" height="14px" />
            <p-skeleton width="160px" height="14px" />
            <p-skeleton width="100px" height="14px" />
            <p-skeleton width="80px" height="22px" borderRadius="20px" />
            <p-skeleton width="60px" height="14px" />
            <p-skeleton width="200px" height="14px" />
            <p-skeleton width="80px" height="28px" />
          </div>
        }
      </div>
    } @else if (filteredData().length === 0) {
      <div class="empty-state">
        <i class="pi pi-users"></i>
        <p>No team members found for this filter</p>
        <button class="clear-filter-btn" (click)="clearFilter()">Clear filter</button>
      </div>
    } @else {
      <table class="team-table">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Business Unit</th>
            <th>Status</th>
            <th>Hours</th>
            <th>Projects</th>
            <th style="text-align:center">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (item of filteredData(); track item.user_id) {
            <tr [class]="rowClass(item)">
              <td><span class="emp-id">{{ item.yash_id }}</span></td>
              <td>
                <div class="name-cell">
                  <div class="name-avatar">{{ initials(item.user_name) }}</div>
                  <div>
                    <div class="name-text">{{ item.user_name }}</div>
                    <div class="irm-text">{{ item.b_unit }}</div>
                  </div>
                </div>
              </td>
              <td><span class="bu-tag">{{ item.b_unit }}</span></td>
              <td>
                <p-tag [value]="item.status" [severity]="statusSeverity(item.status)" />
              </td>
              <td>
                @if (item.timesheet) {
                  <div class="hours-cell">
                    <span class="h-val" [class.low]="item.timesheet.total_hours < 30"
                      [class.good]="item.timesheet.total_hours >= 40">
                      {{ item.timesheet.total_hours }}
                    </span>
                    <span class="h-sched">/ {{ item.timesheet.scheduled_hours }}</span>
                    <div class="h-bar">
                      <div class="h-fill"
                        [style.width]="Math.min((item.timesheet.total_hours / item.timesheet.scheduled_hours) * 100, 100) + '%'"
                        [class.low]="item.timesheet.total_hours < 30">
                      </div>
                    </div>
                  </div>
                } @else {
                  <span class="no-ts">No timesheet</span>
                }
              </td>
              <td>
                @if (item.timesheet?.entries?.length) {
                  <div class="proj-chips">
                    @for (e of item.timesheet.entries.slice(0, 3); track e.project_name) {
                      <span class="proj-chip">{{ e.project_name }}</span>
                    }
                    @if (item.timesheet.entries.length > 3) {
                      <span class="proj-chip more">+{{ item.timesheet.entries.length - 3 }} more</span>
                    }
                  </div>
                } @else {
                  <span class="no-ts">—</span>
                }
              </td>
              <td>
                <div class="action-btns">
                  @if (item.timesheet) {
                    <button class="act-btn view-btn" (click)="openView(item)"
                      pTooltip="View details" tooltipPosition="top">
                      <i class="pi pi-eye"></i>
                    </button>
                  }
                  @if (item.status === 'Submitted') {
                    <button class="act-btn approve-btn"
                      [disabled]="item._approving"
                      (click)="approve(item)"
                      pTooltip="Approve" tooltipPosition="top">
                      <i class="pi" [class.pi-check]="!item._approving" [class.pi-spin]="item._approving" [class.pi-spinner]="item._approving"></i>
                    </button>
                    <button class="act-btn reject-btn"
                      (click)="openRejectDialog(item)"
                      pTooltip="Reject" tooltipPosition="top">
                      <i class="pi pi-times"></i>
                    </button>
                  }
                  @if (item.status === 'Rejected') {
                    <span class="rejection-hint" [pTooltip]="item.timesheet?.remarks || 'Rejected'" tooltipPosition="top">
                      <i class="pi pi-exclamation-circle"></i> Rejected
                    </span>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>

</div>
</p-card>

<!-- ═════════════════ View Timesheet Dialog ═════════════════ -->
<!-- ═════════════════ View Timesheet Dialog ═════════════════ -->
<p-dialog
  [header]="viewItem ? viewItem.user_name + ' — ' + weekLabel : ''"
  [(visible)]="viewVisible"
  [modal]="true"
  [style]="{ width: '880px', maxWidth: '96vw' }"
  [draggable]="false"
  styleClass="ts-view-dialog"
>
  @if (viewItem; as vi) {
    @if (vi.timesheet; as ts) {
      <div class="view-body">

        <!-- Meta strip -->
        <div class="view-meta">
          <div class="vm-item">
            <span class="vm-lbl">Employee</span>
            <span class="vm-val">{{ vi.user_name }}</span>
          </div>
          <div class="vm-item">
            <span class="vm-lbl">Yash ID</span>
            <span class="vm-val mono">{{ vi.yash_id }}</span>
          </div>
          <div class="vm-item">
            <span class="vm-lbl">Business Unit</span>
            <span class="vm-val">{{ vi.b_unit }}</span>
          </div>
          <div class="vm-item">
            <span class="vm-lbl">Total Hours</span>
            <span class="vm-val bold" [class.low]="ts.total_hours < 30">
              {{ ts.total_hours }} / {{ ts.scheduled_hours }}
            </span>
          </div>
          <div class="vm-item">
            <span class="vm-lbl">Status</span>
            <p-tag [value]="vi.status" [severity]="statusSeverity(vi.status ?? '')" />
          </div>
          @if (ts.submitted_at) {
            <div class="vm-item">
              <span class="vm-lbl">Submitted On</span>
              <span class="vm-val">{{ ts.submitted_at | date:'dd MMM yyyy, hh:mm a' }}</span>
            </div>
          }
        </div>

        @if (ts.remarks) {
          <div class="remarks-box">
            <i class="pi pi-comment"></i>
            <strong>Remarks:</strong> {{ ts.remarks }}
          </div>
        }

        <!-- Daily Breakdown -->
        <div class="entries-section">
          <h4 class="entries-title">Daily Breakdown</h4>
          <div class="entries-scroll">
            <table class="entries-table">
              <thead>
                <tr>
                  <th class="proj-th">Project</th>
                  <th class="type-th">Type</th>
                  @for (dh of viewDayHeaders(); track dh.label) {
                    <th class="day-th" [class.wknd]="dh.weekend">
                      <span class="dh-name">{{ dh.label }}</span>
                      <span class="dh-date">{{ dh.date }}</span>
                    </th>
                  }
                  <th class="total-th">Total</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of ts.entries; track entry.project_name) {
                  <tr>
                    <td class="proj-td">{{ entry.project_name }}</td>
                    <td class="type-td">
                      <span class="type-pill type-{{ entry.project_type?.toLowerCase() }}">
                        {{ entry.project_type }}
                      </span>
                    </td>
                    @for (dk of dayKeys; track dk) {
                      <td class="day-td" [class.has-val]="entry[dk + '_hours'] > 0">
                        {{ entry[dk + '_hours'] > 0 ? entry[dk + '_hours'] : '—' }}
                      </td>
                    }
                    <td class="total-td">{{ entry.total_hours }}</td>
                  </tr>
                }
                <!-- Totals row -->
                <tr class="totals-foot">
                  <td colspan="2"><strong>Daily Total</strong></td>
                  @for (dk of dayKeys; track dk) {
                    <td class="day-td">
                      <strong>{{ getDayTotal(ts, dk) || '' }}</strong>
                    </td>
                  }
                  <td class="total-td"><strong>{{ ts.total_hours }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    }
  }

  <ng-template pTemplate="footer">
    <div class="dialog-footer-row">
      <button class="dlg-btn-ghost" (click)="viewVisible = false">Close</button>
      @if (viewItem?.status === 'Submitted') {
        <button class="dlg-btn-reject"
          (click)="viewVisible = false; openRejectDialog(viewItem!)">
          <i class="pi pi-times"></i> Reject
        </button>
        <button class="dlg-btn-approve"
          [disabled]="viewItem?._approving"
          (click)="approve(viewItem!); viewVisible = false">
          <i class="pi pi-check"></i> Approve
        </button>
      }
    </div>
  </ng-template>
</p-dialog>

<!-- ═════════════════ Reject Dialog ═════════════════ -->
<p-dialog
  header="Reject Timesheet"
  [(visible)]="rejectVisible"
  [modal]="true"
  [style]="{ width: '440px' }"
  [draggable]="false"
>
  @if (rejectTarget) {
    <div class="reject-body">
      <div class="reject-who">
        Rejecting timesheet for <strong>{{ rejectTarget.user_name }}</strong> ({{ weekLabel }})
      </div>
      <label class="rej-label">Reason for rejection <span class="req">*</span></label>
      <textarea
        pTextarea
        [(ngModel)]="rejectRemarks"
        rows="4"
        class="rej-textarea"
        placeholder="Explain what needs to be corrected…"
        [autoResize]="true">
      </textarea>
      @if (!rejectRemarks.trim()) {
        <span class="rej-hint">A reason is required so the employee can correct and resubmit.</span>
      }
    </div>
  }
  <ng-template pTemplate="footer">
    <button class="dlg-btn-ghost" (click)="rejectVisible = false">Cancel</button>
    <button class="dlg-btn-reject" [disabled]="!rejectRemarks.trim() || rejecting()"
      (click)="confirmReject()">
      <i class="pi" [class.pi-times]="!rejecting()" [class.pi-spin]="rejecting()" [class.pi-spinner]="rejecting()"></i>
      {{ rejecting() ? 'Rejecting…' : 'Reject & Notify' }}
    </button>
  </ng-template>
</p-dialog>
  `,
  styles: [`
    .team-page { padding: 1.5rem 2rem; max-width: 1400px; margin: 0 auto; font-size: 1.2rem; }

    /* Header */
    .team-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .team-title { font-size: 2rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem; }
    .team-sub { font-size: 1rem; color: #6B7280; }
    .team-controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    /* Week navigator */
    .week-nav-group { display: flex; align-items: center; background: white; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; }
    .wk-btn { background: none; border: none; border-right: 1px solid #E5E7EB; cursor: pointer; width: 42px; height: 44px; display: flex; align-items: center; justify-content: center; color: #6B7280; transition: background 0.15s; font-size: 1rem; }
    .wk-btn:last-child { border-right: none; border-left: 1px solid #E5E7EB; }
    .wk-btn:hover { background: #F3F4F6; }
    .wk-label { padding: 0 1rem; text-align: center; min-width: 180px; }
    .wk-range { font-size: 0.88rem; font-weight: 700; color: #111827; display: block; }
    .wk-year { font-size: 0.7rem; color: #6B7280; }
    .reload-btn { background: white; border: 1px solid #E5E7EB; border-radius: 8px; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B7280; transition: all 0.15s; }
    .reload-btn:hover { background: #F3F4F6; }
    .reload-btn:disabled { opacity: 0.5; }

    /* Status cards */
    .status-cards { display: flex; gap: 0.875rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .stat-card {
      flex: 1; min-width: 100px; background: white; border: 2px solid #E5E7EB;
      border-radius: 10px; padding: 1.25rem 1.5rem; cursor: pointer;
      transition: all 0.15s; position: relative; overflow: hidden;
    }
    .stat-card:hover { border-color: #9CA3AF; }
    .stat-card.active { border-color: #1E3A5F; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
    .sc-count { font-size: 2rem; font-weight: 800; line-height: 1; }
    .sc-label { font-size: 0.9rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 3px; }
    .stat-total .sc-count { color: #111827; }
    .stat-pending .sc-count { color: #2563EB; }
    .stat-approved .sc-count { color: #16A34A; }
    .stat-not-submitted .sc-count { color: #DC2626; }
    .stat-rejected .sc-count { color: #EF4444; }
    .stat-draft .sc-count { color: #6B7280; }
    .sc-badge { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #2563EB; border-radius: 50%; }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }

    /* Table card */
    .team-table-card { background: white; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
    .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.25rem; border-bottom: 1px solid #F3F4F6; flex-wrap: wrap; gap: 0.5rem; }
    .tb-info { font-size: 0.82rem; color: #6B7280; }
    .bulk-approve-btn { background: #16A34A; color: white; border: none; border-radius: 8px; padding: 0.45rem 1rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; }
    .bulk-approve-btn:hover { background: #15803D; }

    .skeleton-rows { padding: 0.5rem 1.25rem; }
    .skel-row { display: flex; align-items: center; gap: 1.5rem; padding: 0.875rem 0; border-bottom: 1px solid #F9FAFB; }

    .empty-state { text-align: center; padding: 3rem; color: #6B7280; }
    .empty-state i { font-size: 2.5rem; color: #D1D5DB; display: block; margin-bottom: 0.75rem; }
    .empty-state p { font-size: 0.9rem; }
    .clear-filter-btn { background: none; border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 16px; cursor: pointer; font-size: 0.82rem; margin-top: 0.5rem; }

    /* Table */
    .team-table { width: 100%; border-collapse: collapse; font-size: 1rem; }
    .team-table thead th { background: #F8FAFC; padding: 1rem 1.2rem; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB; white-space: nowrap; text-align: left; font-size: 1rem; }
    .team-table tbody tr:hover { background: #F9FAFB; }
    .team-table tbody td { padding: 1rem 1.2rem; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }

    .row-not-submitted td { background: #FFFBFB; }
    .row-submitted td { background: #F0F9FF; }
    .row-approved td { background: #F0FDF4; }
    .row-rejected td { background: #FEF9F9; }
    .row-draft td { background: #FAFAFA; }

    .emp-id { font-family: monospace; font-size: 0.78rem; background: #F3F4F6; padding: 2px 7px; border-radius: 4px; }
    .name-cell { display: flex; align-items: center; gap: 0.625rem; }
    .name-avatar { width: 38px; height: 38px; border-radius: 50%; background: #1E3A5F; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
    .name-text { font-weight: 600; color: #111827; font-size: 1rem; }
    .irm-text { font-size: 0.85rem; color: #9CA3AF; }
    .bu-tag { font-size: 0.75rem; background: #EEF2FF; color: #4338CA; padding: 2px 8px; border-radius: 10px; font-weight: 500; }

    .hours-cell { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .h-val { font-weight: 700; font-size: 0.9rem; color: #374151; }
    .h-val.low { color: #EF4444; }
    .h-val.good { color: #16A34A; }
    .h-sched { font-size: 0.75rem; color: #9CA3AF; }
    .h-bar { width: 50px; height: 5px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
    .h-fill { height: 100%; background: #4F46E5; border-radius: 3px; }
    .h-fill.low { background: #EF4444; }
    .no-ts { color: #D1D5DB; font-size: 0.82rem; }

    .proj-chips { display: flex; flex-wrap: wrap; gap: 3px; }
    .proj-chip { font-size: 0.68rem; background: #EEF2FF; color: #4338CA; padding: 2px 7px; border-radius: 10px; white-space: nowrap; }
    .proj-chip.more { background: #F3F4F6; color: #6B7280; }

    .action-btns { display: flex; align-items: center; gap: 4px; justify-content: center; }
    .act-btn { width: 36px; height: 36px; border: 1px solid #E5E7EB; border-radius: 7px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.15s; }
    .view-btn { color: #4F46E5; }
    .view-btn:hover { background: #EEF2FF; border-color: #C7D2FE; }
    .approve-btn { color: #16A34A; }
    .approve-btn:hover:not(:disabled) { background: #F0FDF4; border-color: #86EFAC; }
    .approve-btn:disabled { opacity: 0.5; cursor: default; }
    .reject-btn { color: #DC2626; }
    .reject-btn:hover { background: #FEF2F2; border-color: #FECACA; }
    .rejection-hint { font-size: 0.75rem; color: #EF4444; display: flex; align-items: center; gap: 3px; cursor: pointer; white-space: nowrap; }

    /* View dialog */
    .view-body { display: flex; flex-direction: column; gap: 1.25rem; }
    .view-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1rem 1.25rem; }
    .vm-item { display: flex; flex-direction: column; gap: 3px; }
    .vm-lbl { font-size: 0.68rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .vm-val { font-size: 0.88rem; font-weight: 500; color: #111827; }
    .vm-val.bold { font-weight: 700; font-size: 0.95rem; }
    .vm-val.low { color: #DC2626; }
    .vm-val.mono { font-family: monospace; }
    .remarks-box { display: flex; align-items: flex-start; gap: 0.5rem; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.83rem; color: #991B1B; }

    .entries-section { }
    .entries-title { font-size: 0.8rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 0.625rem; }
    .entries-scroll { overflow-x: auto; }
    .entries-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .entries-table thead th { background: #F8FAFC; padding: 0.5rem 0.5rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB; }
    .proj-th { text-align: left !important; width: 200px; }
    .type-th { width: 90px; }
    .day-th { width: 60px; }
    .day-th.wknd { background: #F1F5F9; }
    .total-th { width: 60px; }
    .dh-name { display: block; font-size: 0.65rem; color: #6B7280; }
    .dh-date { display: block; font-size: 0.85rem; font-weight: 700; }
    .entries-table tbody td { padding: 0.45rem 0.5rem; border-bottom: 1px solid #F3F4F6; text-align: center; }
    .proj-td { text-align: left !important; font-weight: 600; color: #1E3A5F; }
    .type-td { }
    .day-td { color: #9CA3AF; }
    .day-td.has-val { color: #4338CA; font-weight: 700; }
    .total-td { font-weight: 700; color: #111827; }
    .totals-foot td { background: #F8FAFC; border-top: 2px solid #E5E7EB; }
    .type-pill { font-size: 0.66rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; }
    .type-billable { background: #DCFCE7; color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave { background: #FEF3C7; color: #92400E; }
    .type-pmo { background: #F3E8FF; color: #7E22CE; }

    /* Dialog footer */
    .dialog-footer-row { display: flex; align-items: center; gap: 0.75rem; justify-content: flex-end; }
    .dlg-btn-ghost { background: none; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0.45rem 1rem; cursor: pointer; font-size: 0.84rem; color: #374151; }
    .dlg-btn-approve { background: #16A34A; color: white; border: none; border-radius: 8px; padding: 0.45rem 1.25rem; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
    .dlg-btn-approve:disabled { opacity: 0.5; cursor: default; }
    .dlg-btn-reject { background: #DC2626; color: white; border: none; border-radius: 8px; padding: 0.45rem 1.25rem; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
    .dlg-btn-reject:disabled { opacity: 0.5; cursor: default; }

    /* Reject dialog */
    .reject-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .reject-who { font-size: 0.85rem; color: #374151; padding: 0.625rem 0.875rem; background: #FEF2F2; border-radius: 8px; border: 1px solid #FECACA; }
    .rej-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
    .req { color: #EF4444; }
    .rej-textarea { width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0.625rem; font-size: 0.84rem; outline: none; resize: vertical; font-family: inherit; }
    .rej-textarea:focus { border-color: #DC2626; box-shadow: 0 0 0 2px rgba(220,38,38,0.1); }
    .rej-hint { font-size: 0.73rem; color: #9CA3AF; }

    ::ng-deep .status-filter-select { min-width: 160px; }
  `]
})
export class TeamTimesheetsComponent implements OnInit {
  Math = Math;
  loading = signal(false);
  rejecting = signal(false);
  allTeamData = signal<TeamMember[]>([]);
  filteredData = signal<TeamMember[]>([]);
  selectedStatus: string | null = null;

  // Week navigation
  currentWeekStart: Date = this.getMonday(new Date());
  viewVisible = false;
  rejectVisible = false;
  viewItem: TeamMember | null = null;
  rejectTarget: TeamMember | null = null;
  rejectRemarks = '';

  dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  statusFilterOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Submitted (Pending)', value: 'Submitted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Not Submitted', value: 'Not Submitted' },
  ];
  userChangedWeek: boolean = false; // 🔥 important flag to track manual week changes

  get weekLabel() {
    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 6);
    const s = this.currentWeekStart;
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = end.toLocaleDateString('en-US', { month: 'short' });
    if (sMonth === eMonth) return `${sMonth} ${s.getDate()} – ${end.getDate()}`;
    return `${sMonth} ${s.getDate()} – ${eMonth} ${end.getDate()}`;
  }

  get weekYear() { return this.currentWeekStart.getFullYear().toString(); }

  pendingCount = computed(() => this.allTeamData().filter(m => m.status === 'Submitted').length);

  statusCards = computed(() => {
    const d = this.allTeamData();
    return [
      { key: 'total', label: 'Total Members', count: d.length, filterVal: null },
      { key: 'pending', label: 'Pending Approval', count: d.filter(m => m.status === 'Submitted').length, filterVal: 'Submitted' },
      { key: 'approved', label: 'Approved', count: d.filter(m => m.status === 'Approved').length, filterVal: 'Approved' },
      { key: 'not-submitted', label: 'Not Submitted', count: d.filter(m => m.status === 'Not Submitted').length, filterVal: 'Not Submitted' },
      { key: 'rejected', label: 'Rejected', count: d.filter(m => m.status === 'Rejected').length, filterVal: 'Rejected' },
      { key: 'draft', label: 'Draft', count: d.filter(m => m.status === 'Draft').length, filterVal: 'Draft' },
    ];
  });

  constructor(
    private tsService: TimesheetService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() { this.loadTeam(true); }

  getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }

  shiftWeek(dir: number) {
  this.userChangedWeek = true;   // 🔥 important

  this.currentWeekStart = new Date(this.currentWeekStart);
  this.currentWeekStart.setDate(this.currentWeekStart.getDate() + dir * 7);

  this.loadTeam();
}

  // Local Y/M/D formatting, not toISOString(): currentWeekStart is pinned to local
  // midnight, and toISOString() converts to UTC first — in IST (UTC+5:30) that rolls
  // the date back to Sunday, which the backend's get_week_dates() then re-snaps to
  // *last* Monday, showing the manager a week that's a full 7 days too early.
  weekStartIso() {
    const d = this.currentWeekStart;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadTeam(isInitialLoad = false) {
  this.loading.set(true);

  const week = isInitialLoad ? null : this.weekStartIso();

  this.tsService.getTeamTimesheets(week).subscribe({
    next: (res: TeamResponse) => {

      this.allTeamData.set(res.data || []);

      // ✅ Set week ONLY on first load
      if (isInitialLoad && res.week_start) {
        this.currentWeekStart = new Date(res.week_start);
      }

      this.applyStatusFilter();
      this.loading.set(false);
    },

    error: (err) => {
      this.loading.set(false);
      const msg = err.error?.message || 'Failed to load team timesheets';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
    }
  });
}

  applyStatusFilter() {
    if (!this.selectedStatus) {
      this.filteredData.set(this.allTeamData());
    } else {
      this.filteredData.set(this.allTeamData().filter(m => m.status === this.selectedStatus));
    }
  }

  filterByStatus(val: string | null) {
    this.selectedStatus = this.selectedStatus === val ? null : val;
    this.applyStatusFilter();
  }

  clearFilter() { this.selectedStatus = null; this.applyStatusFilter(); }

  rowClass(item: TeamMember) {
    if (item.status === 'Not Submitted') return 'row-not-submitted';
    if (item.status === 'Submitted') return 'row-submitted';
    if (item.status === 'Approved') return 'row-approved';
    if (item.status === 'Rejected') return 'row-rejected';
    return 'row-draft';
  }

  statusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (s === 'Approved') return 'success';
    if (s === 'Submitted') return 'info';
    if (s === 'Rejected') return 'danger';
    if (s === 'Not Submitted') return 'danger';
    return 'secondary';
  }

  initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  openView(item: TeamMember) {
    this.viewItem = item;
    this.viewVisible = true;
  }

  viewDayHeaders() {
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, i) => {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      return { label, date: d.getDate().toString(), weekend: i >= 5 };
    });
  }

  getDayTotal(ts: any, dk: string): number {
    if (!ts?.entries) return 0;
    return ts.entries.reduce((s: number, e: any) => s + (e[dk + '_hours'] || 0), 0);
  }

  approve(item: TeamMember) {
    if (!item.timesheet) return;
    item._approving = true;
    this.tsService.approveTimesheet(item.timesheet.id).subscribe({
      next: () => {
        // Optimistically update in place — no full reload needed
        this.allTeamData.update(list =>
          list.map(m => m.user_id === item.user_id
            ? { ...m, status: 'Approved', _approving: false, timesheet: { ...m.timesheet, status: 'Approved' } }
            : m
          )
        );
        this.applyStatusFilter();
        this.messageService.add({
          severity: 'success', summary: 'Approved',
          detail: `${item.user_name}'s timesheet approved`
        });
      },
      error: () => {
        item._approving = false;
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not approve timesheet' });
      }
    });
  }

  openRejectDialog(item: TeamMember) {
    this.rejectTarget = item;
    this.rejectRemarks = '';
    this.rejectVisible = true;
  }

  confirmReject() {
    if (!this.rejectTarget?.timesheet || !this.rejectRemarks.trim()) return;
    this.rejecting.set(true);
    this.tsService.rejectTimesheet(this.rejectTarget.timesheet.id, this.rejectRemarks).subscribe({
      next: () => {
        const target = this.rejectTarget!;
        this.allTeamData.update(list =>
          list.map(m => m.user_id === target.user_id
            ? { ...m, status: 'Rejected', timesheet: { ...m.timesheet, status: 'Rejected', remarks: this.rejectRemarks } }
            : m
          )
        );
        this.applyStatusFilter();
        this.rejecting.set(false);
        this.rejectVisible = false;
        this.messageService.add({
          severity: 'warn', summary: 'Rejected',
          detail: `${target.user_name}'s timesheet rejected`
        });
      },
      error: () => {
        this.rejecting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not reject timesheet' });
      }
    });
  }

  bulkApproveConfirm() {
    const count = this.pendingCount();
    this.confirmationService.confirm({
      message: `Approve all <strong>${count} submitted</strong> timesheets for this week?`,
      header: 'Bulk Approve',
      icon: 'pi pi-check-circle',
      acceptLabel: `Yes, Approve ${count}`,
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.bulkApprove(),
    });
  }

  bulkApprove() {
    const pending = this.allTeamData().filter(m => m.status === 'Submitted' && m.timesheet);
    let done = 0;
    pending.forEach(item => {
      this.tsService.approveTimesheet(item.timesheet.id).subscribe({
        next: () => {
          done++;
          this.allTeamData.update(list =>
            list.map(m => m.user_id === item.user_id
              ? { ...m, status: 'Approved', timesheet: { ...m.timesheet, status: 'Approved' } }
              : m
            )
          );
          this.applyStatusFilter();
          if (done === pending.length) {
            this.messageService.add({ severity: 'success', summary: 'All Approved', detail: `${done} timesheets approved` });
          }
        }
      });
    });
  }
}