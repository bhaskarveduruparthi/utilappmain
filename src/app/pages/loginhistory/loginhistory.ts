import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { LoginLog, ManageAdminsService } from '../service/manageadmins.service';
import { AuthenticationService } from '../service/authentication.service';
import { Card } from "primeng/card";

@Component({
    selector: 'app-loginhistory',
    standalone: true,
    imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, RippleModule, ToastModule, TagModule,
    InputIconModule, IconFieldModule, ConfirmDialogModule,
    PaginatorModule, TooltipModule, RouterModule,
    Card
],
    providers: [MessageService, ManageAdminsService, ConfirmationService],
    styles: [`
        /* ── Page shell ── */
        .page-shell {
            padding: 1.5rem 2rem;
            min-height: 100vh;
        }

        /* ── Page header ── */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .page-title {
            font-size: 1.45rem;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 0.15rem;
            letter-spacing: -0.02em;
        }
        .page-sub { font-size: 0.81rem; color: #64748B; }

        /* ── Action bar ── */
        .action-bar {
            display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap;
        }
        .btn-primary {
            background: #1E3A5F; color: white; border: none; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; white-space: nowrap;
        }
        .btn-primary:hover:not(:disabled) { background: #162D4D; }
        .btn-primary:disabled { opacity: 0.6; cursor: default; }
        .btn-secondary {
            background: white; color: #374151; border: 1px solid #E2E8F0; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s; white-space: nowrap;
        }
        .btn-secondary:hover { background: #F1F5F9; border-color: #CBD5E1; }

        /* ── Search bar ── */
        .search-wrap {
            display: flex; align-items: center; background: white;
            border: 1px solid #E2E8F0; border-radius: 8px; padding: 0 0.75rem; gap: 0.5rem;
            transition: border-color 0.15s;
        }
        .search-wrap:focus-within { border-color: #1E3A5F; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
        .search-wrap i { color: #94A3B8; font-size: 0.88rem; }
        .search-input {
            border: none; outline: none; font-size: 0.83rem; color: #0F172A;
            padding: 0.45rem 0; min-width: 200px; background: transparent;
        }
        .clear-btn {
            background: none; border: none; cursor: pointer; color: #94A3B8;
            padding: 0; display: flex; align-items: center; transition: color 0.15s; font-size: 0.8rem;
        }
        .clear-btn:hover { color: #374151; }

        /* ── Stats strip ── */
        .stats-strip {
            display: flex; gap: 0.875rem; margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .stat-card {
            background: white; border: 1px solid #E2E8F0; border-radius: 12px;
            padding: 0.875rem 1.25rem; display: flex; align-items: center; gap: 0.75rem;
            flex: 1; min-width: 140px; position: relative; overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .stat-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 12px 12px 0 0;
        }
        .stat-total::before   { background: #1E3A5F; }
        .stat-success::before { background: #16A34A; }
        .stat-failed::before  { background: #DC2626; }
        .stat-today::before   { background: #D97706; }

        .stat-icon {
            width: 36px; height: 36px; border-radius: 9px; display: flex;
            align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0;
        }
        .stat-total   .stat-icon { background: #EEF2FF; color: #4F46E5; }
        .stat-success .stat-icon { background: #F0FDF4; color: #16A34A; }
        .stat-failed  .stat-icon { background: #FEF2F2; color: #DC2626; }
        .stat-today   .stat-icon { background: #FFFBEB; color: #D97706; }

        .stat-body { }
        .stat-val { font-size: 1.4rem; font-weight: 800; color: #0F172A; line-height: 1; margin-bottom: 2px; }
        .stat-lbl { font-size: 0.7rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── Table card ── */
        .table-card {
            background: white; border: 1px solid #E2E8F0;
            border-radius: 14px; overflow: hidden;
        }
        .table-meta-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.875rem 1.25rem; border-bottom: 1px solid #F1F5F9;
            flex-wrap: wrap; gap: 0.5rem;
        }
        .table-meta-label { font-size: 0.82rem; color: #64748B; }
        .table-meta-label strong { color: #0F172A; }

        .data-table-wrap { overflow-x: auto; }
        .data-table {
            width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 800px;
        }
        .data-table thead th {
            background: #F8FAFC; padding: 0.7rem 0.875rem; text-align: left;
            font-weight: 600; color: #475569; border-bottom: 2px solid #E2E8F0; white-space: nowrap;
        }
        .data-table thead th.col-id { background: #EFF6FF; color: #1E40AF; }
        .data-table tbody tr { border-bottom: 1px solid #F1F5F9; transition: background 0.12s; }
        .data-table tbody tr.row-failed { background: #FFFBFB; }
        .data-table tbody tr.row-failed:hover { background: #FEF2F2; }
        .data-table tbody tr:hover { background: #F8FAFC; }
        .data-table tbody td { padding: 0.65rem 0.875rem; vertical-align: middle; color: #1E293B; }
        .data-table tbody td.col-id { background: #EFF6FF; }

        .id-badge {
            font-family: monospace; font-size: 0.76rem; background: #DBEAFE;
            color: #1E40AF; padding: 3px 8px; border-radius: 5px; font-weight: 700;
        }

        /* ── Status pill ── */
        .status-pill {
            display: inline-flex; align-items: center; gap: 0.3rem;
            padding: 3px 10px; border-radius: 20px; font-size: 0.71rem;
            font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .status-success { background: #DCFCE7; color: #166534; }
        .status-failed  { background: #FEE2E2; color: #991B1B; }

        /* ── IP badge ── */
        .ip-badge {
            font-family: monospace; font-size: 0.78rem; color: #1E3A5F;
            background: #F0F9FF; padding: 2px 7px; border-radius: 5px; white-space: nowrap;
        }

        /* ── Agent cell ── */
        .agent-cell {
            max-width: 280px; white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; color: #64748B; font-size: 0.78rem; cursor: pointer;
        }

        /* ── Timestamp ── */
        .timestamp { font-size: 0.79rem; color: #64748B; white-space: nowrap; }
        .timestamp strong { color: #374151; font-size: 0.81rem; }

        /* ── Empty / loading ── */
        .table-empty { text-align: center; padding: 3rem; color: #94A3B8; }
        .table-empty i { font-size: 2rem; display: block; margin-bottom: 0.625rem; }
        .table-empty p { font-size: 0.87rem; }

        /* ── Paginator ── */
        .paginator-wrap { padding: 0.625rem 0.875rem; border-top: 1px solid #F1F5F9; }
    `],
    template: `
<p-card>
    <p-toast position="top-right" />

<div class="page-shell">

    <!-- ── Page Header ── -->
    <div class="page-header">
        <div>
            <h1 class="page-title">Login History</h1>
            <span class="page-sub">Audit trail of all user authentication attempts</span>
        </div>
        <div class="action-bar">
            <!-- Search -->
            <div class="search-wrap">
                <i class="pi pi-search"></i>
                <input class="search-input" type="text" placeholder="Search Yash ID, IP, message…"
                    [(ngModel)]="searchTerm" (ngModelChange)="applySearch()" />
                @if (searchTerm) {
                    <button class="clear-btn" (click)="clearSearch()">
                        <i class="pi pi-times"></i>
                    </button>
                }
            </div>
            <!-- Filter pills -->
            <div style="display:flex; gap:4px;">
                @for (f of statusFilters; track f.key) {
                    <button class="filter-pill"
                        [class.active]="activeFilter === f.key"
                        (click)="setFilter(f.key)"
                        [style]="activeFilter === f.key ? f.activeStyle : ''">
                        {{ f.label }}
                    </button>
                }
            </div>
            <button class="btn-primary" (click)="downloadAllData()" [disabled]="isDownloading">
                <i class="pi" [class.pi-download]="!isDownloading"
                    [class.pi-spin]="isDownloading" [class.pi-spinner]="isDownloading"></i>
                {{ isDownloading ? 'Exporting…' : 'Export Excel' }}
            </button>
        </div>
    </div>

    <!-- ── Stats Strip ── */
    <div class="stats-strip">
        <div class="stat-card stat-total">
            <div class="stat-icon"><i class="pi pi-list"></i></div>
            <div class="stat-body">
                <div class="stat-val">{{ totalitems }}</div>
                <div class="stat-lbl">Total Logs</div>
            </div>
        </div>
        <div class="stat-card stat-success">
            <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
            <div class="stat-body">
                <div class="stat-val">{{ successCount() }}</div>
                <div class="stat-lbl">Successful</div>
            </div>
        </div>
        <div class="stat-card stat-failed">
            <div class="stat-icon"><i class="pi pi-times-circle"></i></div>
            <div class="stat-body">
                <div class="stat-val">{{ failedCount() }}</div>
                <div class="stat-lbl">Failed</div>
            </div>
        </div>
        <div class="stat-card stat-today">
            <div class="stat-icon"><i class="pi pi-calendar"></i></div>
            <div class="stat-body">
                <div class="stat-val">{{ todayCount() }}</div>
                <div class="stat-lbl">Today</div>
            </div>
        </div>
    </div>

    <!-- ── Table Card ── -->
    <div class="table-card">
        <div class="table-meta-row">
            <span class="table-meta-label">
                Showing <strong>{{ filteredLogs().length }}</strong>
                @if (searchTerm || activeFilter !== 'all') {
                    filtered
                }
                of <strong>{{ totalitems }}</strong> logs
                @if (searchTerm) { · matching "<strong>{{ searchTerm }}</strong>" }
            </span>
        </div>

        <div class="data-table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-id">Yash ID</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Message</th>
                        <th>Timestamp</th>
                        <th>User Agent</th>
                    </tr>
                </thead>
                <tbody>
                    @if (loading) {
                        <tr>
                            <td colspan="6" class="table-empty">
                                <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>
                                <p>Loading login history…</p>
                            </td>
                        </tr>
                    } @else if (filteredLogs().length === 0) {
                        <tr>
                            <td colspan="6" class="table-empty">
                                <i class="pi pi-history"></i>
                                <p>{{ searchTerm ? 'No logs match your search.' : 'No login logs found.' }}</p>
                            </td>
                        </tr>
                    } @else {
                        @for (log of filteredLogs(); track log.id ?? $index) {
                            <tr [class.row-failed]="!log.success">
                                <td class="col-id">
                                    <span class="id-badge">{{ log.yash_id || '—' }}</span>
                                </td>
                                <td>
                                    <span class="ip-badge">{{ log.ip_address || '—' }}</span>
                                </td>
                                <td>
                                    <span class="status-pill"
                                        [class.status-success]="log.success"
                                        [class.status-failed]="!log.success">
                                        <i class="pi"
                                            [class.pi-check]="log.success"
                                            [class.pi-times]="!log.success">
                                        </i>
                                        {{ log.success ? 'Success' : 'Failed' }}
                                    </span>
                                </td>
                                <td style="font-size:0.8rem; color:#374151;">{{ log.message || '—' }}</td>
                                <td>
                                    <div class="timestamp">
                                        <strong>{{ formatDate(log.timestamp) }}</strong>
                                        <div>{{ formatTime(log.timestamp) }}</div>
                                    </div>
                                </td>
                                <td>
                                    <span class="agent-cell"
                                        [title]="log.user_agent || ''"
                                        pTooltip="{{ log.user_agent }}"
                                        tooltipPosition="left">
                                        {{ log.user_agent || '—' }}
                                    </span>
                                </td>
                            </tr>
                        }
                    }
                </tbody>
            </table>
        </div>

        <div class="paginator-wrap">
            <p-paginator
                [totalRecords]="totalitems"
                [first]="first"
                [rows]="10"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs"
                [showCurrentPageReport]="true"
                (onPageChange)="onPageChange($event)" />
        </div>
    </div>

</div>
</p-card>

<style>
    /* Filter pills — scoped here to avoid ::ng-deep */
    .filter-pill {
        background: white; border: 1px solid #E2E8F0; border-radius: 20px;
        padding: 4px 12px; font-size: 0.75rem; font-weight: 500; color: #64748B;
        cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .filter-pill:hover { border-color: #CBD5E1; color: #374151; background: #F8FAFC; }
    .filter-pill.active { font-weight: 700; }
</style>
    `
})
export class LoginHistory implements OnInit {

    logs      = signal<LoginLog[]>([]);
    allLogs   = signal<LoginLog[]>([]); // full page for client-side filter
    loading   = true;
    isDownloading = false;
    isvalid   = false;

    // Pagination
    first                = 0;
    LHistoryCurrentPage  = 1;
    totalitems           = 0;

    // Search + filter
    searchTerm   = '';
    activeFilter = 'all';

    statusFilters = [
        { key: 'all',     label: 'All',     activeStyle: 'background:#1E3A5F; color:white; border-color:#1E3A5F;' },
        { key: 'success', label: 'Success', activeStyle: 'background:#16A34A; color:white; border-color:#16A34A;' },
        { key: 'failed',  label: 'Failed',  activeStyle: 'background:#DC2626; color:white; border-color:#DC2626;' },
    ];

    constructor(
        private manageadminservice: ManageAdminsService,
        public  messageservice: MessageService,
        private authservice: AuthenticationService,
        public  router: Router
    ) {
        this.authservice.user.subscribe(x => {
            if (x?.type === 'Superadmin' || x?.type === 'BUH') {
                this.isvalid = true;
            } else {
                this.isvalid = false;
                this.router.navigate(['/auth/access']);
            }
        });
    }

    ngOnInit() {
        const storedPage = localStorage.getItem('LHistoryCurrentPage');
        if (storedPage) {
            this.LHistoryCurrentPage = parseInt(storedPage);
            this.first = (this.LHistoryCurrentPage - 1) * 10;
        }
        this.loadLogs(this.LHistoryCurrentPage);
        this.loadTotalCount();
    }

    loadLogs(page: number) {
        this.loading = true;
        this.manageadminservice.getalllogs(page).subscribe({
            next: (data: any) => {
                const arr = Array.isArray(data) ? data : [];
                this.logs.set(arr);
                this.allLogs.set(arr);
                this.loading = false;
            },
            error: () => {
                this.logs.set([]);
                this.allLogs.set([]);
                this.loading = false;
                this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to load logs' });
            }
        });
    }

    loadTotalCount() {
        this.manageadminservice.get_log_records().subscribe({
            next: (data: any) => {
                this.totalitems = data?.totalrecords ?? (Array.isArray(data) ? data.length : 0);
            },
            error: () => {}
        });
    }

    onPageChange(event: any) {
        this.LHistoryCurrentPage = event.page + 1;
        this.first = event.first;
        localStorage.setItem('LHistoryCurrentPage', this.LHistoryCurrentPage.toString());
        this.loadLogs(this.LHistoryCurrentPage);
        // Reset client-side filters on page change
        this.searchTerm = '';
        this.activeFilter = 'all';
    }

    // ── Client-side filtering ──

    filteredLogs() {
        let list = this.allLogs();
        if (this.activeFilter === 'success') list = list.filter(l => l.success);
        if (this.activeFilter === 'failed')  list = list.filter(l => !l.success);
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            list = list.filter(l =>
                (l.yash_id    || '').toLowerCase().includes(term) ||
                (l.ip_address || '').toLowerCase().includes(term) ||
                (l.message    || '').toLowerCase().includes(term) ||
                (l.user_agent || '').toLowerCase().includes(term)
            );
        }
        return list;
    }

    applySearch() { /* triggers filteredLogs() recompute via signal read */ }
    clearSearch() { this.searchTerm = ''; }
    setFilter(key: string) { this.activeFilter = key; }

    // ── Stats computed from current page ──
    successCount() { return this.allLogs().filter(l => l.success).length; }
    failedCount()  { return this.allLogs().filter(l => !l.success).length; }
    todayCount() {
        const today = new Date().toDateString();
        return this.allLogs().filter(l => l.timestamp && new Date(l.timestamp).toDateString() === today).length;
    }

    // ── Date / time formatting ──
    formatDate(ts?: string): string {
        if (!ts) return '—';
        const d = new Date(ts);
        return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    }

    formatTime(ts?: string): string {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // ── Excel export ──
    downloadAllData() {
        this.isDownloading = true;
        this.manageadminservice.downloadAllLogs().subscribe({
            next: (data: any) => {
                const arr: LoginLog[] = Array.isArray(data) ? data : [];
                if (!arr.length) {
                    this.messageservice.add({ severity: 'warn', summary: 'No Data', detail: 'No logs available to export' });
                    this.isDownloading = false;
                    return;
                }
                this.exportToExcel(arr);
                this.messageservice.add({ severity: 'success', summary: 'Exported', detail: `${arr.length} logs downloaded`, life: 3000 });
                this.isDownloading = false;
            },
            error: () => {
                this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to export logs' });
                this.isDownloading = false;
            }
        });
    }

    private exportToExcel(data: LoginLog[]) {
        const rows = data.map(l => ({
            'Yash ID':    l.yash_id    || '—',
            'IP Address': l.ip_address || '—',
            'User Agent': l.user_agent || '—',
            'Status':     l.success    ? 'Success' : 'Failed',
            'Message':    l.message    || '—',
            'Date':       this.formatDate(l.timestamp),
            'Time':       this.formatTime(l.timestamp),
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 14 }, { wch: 18 }, { wch: 45 },
            { wch: 10 }, { wch: 30 }, { wch: 14 }, { wch: 10 }
        ];

        // Header row style
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '1E3A5F' } },
            alignment: { horizontal: 'center' }
        };
        ['A1','B1','C1','D1','E1','F1','G1'].forEach(cell => {
            if (ws[cell]) ws[cell].s = headerStyle;
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Login History');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = `Login_History_${new Date().toISOString().slice(0,10)}.xlsx`;
        saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
    }
}