import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Router, RouterModule } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { User, ManageAdminsService } from '../service/manageadmins.service';
import { AuthenticationService } from '../service/authentication.service';

interface Column { field: string; header: string; }
interface ExportColumn { title: string; dataKey: string; }

@Component({
    selector: 'app-manageusers',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        ButtonModule, RippleModule, ToastModule, RouterModule,
        ToolbarModule, PanelModule, AutoCompleteModule, InputTextModule,
        TextareaModule, SelectModule, InputNumberModule, DialogModule,
        TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule,
        PasswordModule, MessageModule, PaginatorModule
    ],
    providers: [MessageService, ManageAdminsService, ConfirmationService],
    styles: [`
        /* ── Page ── */
        .page-shell {
            padding: 1.5rem 2rem;
            background: #fff;
            min-height: 100vh;
            border-radius: 14px;
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
            font-size: 1.45rem; font-weight: 800; color: #0F172A;
            margin: 0 0 0.15rem; letter-spacing: -0.02em;
        }
        .page-sub { font-size: 0.81rem; color: #64748B; }

        /* ── Toolbar ── */
        .toolbar-wrap {
            display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap;
        }
        .btn-primary {
            background: #1E3A5F; color: white; border: none; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; white-space: nowrap;
        }
        .btn-primary:hover { background: #162D4D; }
        .btn-secondary {
            background: white; color: #374151; border: 1px solid #E2E8F0; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s; white-space: nowrap;
        }
        .btn-secondary:hover { background: #F1F5F9; border-color: #CBD5E1; }

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

        /* ── View toggle ── */
        .view-toggle {
            display: flex; background: white; border: 1px solid #E2E8F0;
            border-radius: 8px; overflow: hidden;
        }
        .vt-btn {
            background: none; border: none; width: 34px; height: 34px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: #94A3B8; transition: all 0.15s; font-size: 0.88rem;
        }
        .vt-btn:hover { background: #F8FAFC; color: #374151; }
        .vt-btn.active { background: #1E3A5F; color: white; }
        .vt-btn:first-child { border-right: 1px solid #E2E8F0; }

        /* ── Table card ── */
        .table-card {
            background: white; border: 1px solid #E2E8F0;
            border-radius: 14px; overflow: hidden; margin-bottom: 0;
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
            width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 900px;
        }
        .data-table thead th {
            background: #F8FAFC; padding: 0.7rem 0.875rem; text-align: left;
            font-weight: 600; color: #475569; border-bottom: 2px solid #E2E8F0;
            white-space: nowrap;
        }
        .data-table thead th.col-id { background: #EFF6FF; color: #1E40AF; }
        .data-table tbody tr { border-bottom: 1px solid #F1F5F9; transition: background 0.12s; }
        .data-table tbody tr:hover { background: #F8FAFC; }
        .data-table tbody td { padding: 0.65rem 0.875rem; vertical-align: middle; color: #1E293B; }
        .data-table tbody td.col-id { background: #EFF6FF; }

        .id-badge {
            font-family: monospace; font-size: 0.76rem; background: #DBEAFE;
            color: #1E40AF; padding: 3px 8px; border-radius: 5px; font-weight: 700;
        }

        /* ── Type badges ── */
        .type-pill {
            display: inline-flex; align-items: center; padding: 3px 10px;
            border-radius: 20px; font-size: 0.71rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.04em;
        }
        .type-superadmin { background: #FEE2E2; color: #991B1B; }
        .type-manager    { background: #FEF3C7; color: #92400E; }
        .type-user       { background: #DCFCE7; color: #166534; }
        .type-default    { background: #F1F5F9; color: #475569; }

        /* ── Row actions ── */
        .row-actions { display: flex; gap: 5px; align-items: center; }
        .row-btn {
            width: 28px; height: 28px; border-radius: 7px; border: 1px solid #E2E8F0;
            background: white; cursor: pointer; display: flex; align-items: center;
            justify-content: center; font-size: 0.78rem; transition: all 0.15s;
        }
        .row-btn-edit { color: #4F46E5; }
        .row-btn-edit:hover { background: #EEF2FF; border-color: #C7D2FE; }
        .row-btn-del  { color: #DC2626; }
        .row-btn-del:hover  { background: #FEF2F2; border-color: #FECACA; }

        /* ── Empty / loading ── */
        .table-empty { text-align: center; padding: 3rem; color: #94A3B8; }
        .table-empty i { font-size: 2rem; display: block; margin-bottom: 0.625rem; }
        .table-empty p { font-size: 0.87rem; }
        .paginator-wrap { padding: 0.625rem 0.875rem; border-top: 1px solid #F1F5F9; }

        /* ── Card grid ── */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            padding: 1.25rem;
        }
        .user-card {
            background: white; border: 1px solid #E2E8F0; border-radius: 14px;
            padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;
            transition: box-shadow 0.2s, transform 0.15s; position: relative; overflow: hidden;
        }
        .user-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #1E3A5F;
        }
        .user-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-2px); }

        .uc-header { display: flex; align-items: flex-start; gap: 0.75rem; }
        .uc-avatar {
            width: 42px; height: 42px; background: #1E3A5F; color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
        }
        .uc-info { flex: 1; min-width: 0; }
        .uc-name { font-size: 0.95rem; font-weight: 700; color: #0F172A; margin-bottom: 2px; }
        .uc-email { font-size: 0.75rem; color: #64748B; word-break: break-all; }

        .uc-divider { border: none; border-top: 1px solid #F1F5F9; margin: 0; }

        .uc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; }
        .uc-meta-item { }
        .uc-meta-label { font-size: 0.68rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 2px; }
        .uc-meta-value { font-size: 0.82rem; font-weight: 500; color: #374151; }

        .uc-irm {
            background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px;
            padding: 0.45rem 0.75rem; font-size: 0.78rem; color: #0369A1;
            display: flex; align-items: center; gap: 0.35rem;
        }

        .uc-actions { display: flex; gap: 0.5rem; }
        .uca-edit {
            flex: 1; background: white; color: #1E3A5F; border: 1px solid #1E3A5F;
            border-radius: 8px; padding: 0.4rem 0; font-size: 0.8rem; font-weight: 600;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
            transition: all 0.15s;
        }
        .uca-edit:hover { background: #1E3A5F; color: white; }
        .uca-del {
            flex: 1; background: white; color: #DC2626; border: 1px solid #FECACA;
            border-radius: 8px; padding: 0.4rem 0; font-size: 0.8rem; font-weight: 600;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
            transition: all 0.15s;
        }
        .uca-del:hover { background: #FEF2F2; }

        /* ── Dialog form ── */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 1.5rem; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        .form-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .form-field label { font-size: 0.78rem; font-weight: 600; color: #374151; }
        .form-field label.req::after { content: ' *'; color: #EF4444; }
        .field-error { font-size: 0.72rem; color: #DC2626; margin-top: 2px; }

        .dlg-footer { display: flex; gap: 0.625rem; justify-content: flex-end; }
        .dlg-cancel {
            background: none; border: 1px solid #E2E8F0; border-radius: 8px;
            padding: 0.45rem 1rem; font-size: 0.83rem; cursor: pointer; color: #374151; transition: all 0.15s;
        }
        .dlg-cancel:hover { background: #F8FAFC; }
        .dlg-save {
            background: #1E3A5F; color: white; border: none; border-radius: 8px;
            padding: 0.45rem 1.25rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .dlg-save:hover { background: #162D4D; }
        .dlg-save:disabled { opacity: 0.5; cursor: default; }
        .dlg-danger {
            background: #DC2626; color: white; border: none; border-radius: 8px;
            padding: 0.45rem 1.25rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .dlg-danger:hover { background: #B91C1C; }
    `],
    template: `
<p-toast />
<p-confirmDialog />

<div class="page-shell">

    <!-- ── Page Header ── -->
    <div class="page-header">
        <div>
            <h1 class="page-title">Employee Master</h1>
            <span class="page-sub">Manage all users, roles and business unit assignments</span>
        </div>
        <div class="toolbar-wrap">
            <!-- Search -->
            <div class="search-wrap">
                <i class="pi pi-search"></i>
                <input class="search-input" type="text" placeholder="Search name, email, ID…"
                    (input)="onSearch($event)" />
            </div>
            <!-- View toggle -->
            <div class="view-toggle">
                <button class="vt-btn" [class.active]="viewMode === 'table'"
                    (click)="viewMode = 'table'" title="Table view">
                    <i class="pi pi-list"></i>
                </button>
                <button class="vt-btn" [class.active]="viewMode === 'card'"
                    (click)="viewMode = 'card'" title="Card view">
                    <i class="pi pi-th-large"></i>
                </button>
            </div>
            <button class="btn-primary" (click)="openNew()">
                <i class="pi pi-plus"></i> Add User
            </button>
            <button class="btn-secondary" (click)="exportCSV()">
                <i class="pi pi-download"></i> Export Excel
            </button>
        </div>
    </div>

    <!-- ── Table Card ── -->
    <div class="table-card">
        <div class="table-meta-row">
            <span class="table-meta-label">
                <strong>{{ filteredUsersList.length }}</strong> users
                @if (searchTerm) { · matching "<strong>{{ searchTerm }}</strong>" }
            </span>
        </div>

        <!-- TABLE VIEW -->
        @if (viewMode === 'table') {
            <div class="data-table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="col-id">Yash ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Business Unit</th>
                            <th>IRM</th>
                            <th>SRM</th>
                            <th>BUH</th>
                            <th>BGH</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if (loading) {
                            <tr>
                                <td colspan="10" class="table-empty">
                                    <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>
                                    <p>Loading users…</p>
                                </td>
                            </tr>
                        } @else if (paginatedUsers.length === 0) {
                            <tr>
                                <td colspan="10" class="table-empty">
                                    <i class="pi pi-users"></i>
                                    <p>{{ searchTerm ? 'No users match your search.' : 'No users found.' }}</p>
                                </td>
                            </tr>
                        } @else {
                            @for (u of paginatedUsers; track u.yash_id) {
                                <tr>
                                    <td class="col-id"><span class="id-badge">{{ u.yash_id }}</span></td>
                                    <td><strong>{{ u.name }}</strong></td>
                                    <td>{{ u.email }}</td>
                                    <td>{{ u.b_unit || '—' }}</td>
                                    <td>{{ u.irm || '—' }}</td>
                                    <td>{{ u.srm || '—' }}</td>
                                    <td>{{ u.buh || '—' }}</td>
                                    <td>{{ u.bgh || '—' }}</td>
                                    <td>
                                        <span class="type-pill" [class]="typeClass(u.type)">
                                            {{ u.type }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="row-actions">
                                            <button class="row-btn row-btn-edit" (click)="editUser(u)" title="Edit">
                                                <i class="pi pi-pencil"></i>
                                            </button>
                                            <button class="row-btn row-btn-del" (click)="deleteUser(u)" title="Delete">
                                                <i class="pi pi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            }
                        }
                    </tbody>
                </table>
            </div>
        }

        <!-- CARD VIEW -->
        @if (viewMode === 'card') {
            @if (loading) {
                <div class="table-empty">
                    <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>
                    <p>Loading users…</p>
                </div>
            } @else if (paginatedUsers.length === 0) {
                <div class="table-empty">
                    <i class="pi pi-users"></i>
                    <p>{{ searchTerm ? 'No users match your search.' : 'No users found.' }}</p>
                </div>
            } @else {
                <div class="card-grid">
                    @for (u of paginatedUsers; track u.yash_id) {
                        <div class="user-card">
                            <!-- Header -->
                            <div class="uc-header">
                                <div class="uc-avatar">{{ getInitials(u.name) }}</div>
                                <div class="uc-info">
                                    <div class="uc-name">{{ u.name }}</div>
                                    <div class="uc-email">{{ u.email }}</div>
                                </div>
                                <span class="type-pill" [class]="typeClass(u.type)">{{ u.type }}</span>
                            </div>
                            <hr class="uc-divider" />
                            <!-- Meta -->
                            <div class="uc-meta">
                                <div class="uc-meta-item">
                                    <span class="uc-meta-label">Yash ID</span>
                                    <span class="uc-meta-value">
                                        <span class="id-badge">{{ u.yash_id || '—' }}</span>
                                    </span>
                                </div>
                                <div class="uc-meta-item">
                                    <span class="uc-meta-label">Business Unit</span>
                                    <span class="uc-meta-value">{{ u.b_unit || '—' }}</span>
                                </div>
                                @if (u.srm) {
                                    <div class="uc-meta-item">
                                        <span class="uc-meta-label">SRM</span>
                                        <span class="uc-meta-value">{{ u.srm }}</span>
                                    </div>
                                }
                                @if (u.buh) {
                                    <div class="uc-meta-item">
                                        <span class="uc-meta-label">BUH</span>
                                        <span class="uc-meta-value">{{ u.buh }}</span>
                                    </div>
                                }
                            </div>
                            @if (u.irm) {
                                <div class="uc-irm">
                                    <i class="pi pi-user"></i>
                                    <span><strong>IRM:</strong> {{ u.irm }}</span>
                                </div>
                            }
                            <hr class="uc-divider" />
                            <!-- Actions -->
                            <div class="uc-actions">
                                <button class="uca-edit" (click)="editUser(u)">
                                    <i class="pi pi-pencil"></i> Edit
                                </button>
                                <button class="uca-del" (click)="deleteUser(u)">
                                    <i class="pi pi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    }
                </div>
            }
        }

        <div class="paginator-wrap">
            <p-paginator
                [totalRecords]="filteredUsersList.length"
                [rows]="rows"
                [first]="first"
                [rowsPerPageOptions]="[10, 20, 30]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                [showCurrentPageReport]="true"
                (onPageChange)="onPageChange($event)" />
        </div>
    </div>

</div>

<!-- ═══════════════ ADD USER DIALOG ═══════════════ -->
<p-dialog [(visible)]="userDialog" [style]="{width:'700px'}"
    header="Add User" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="form-grid">
            <div class="form-field">
                <label class="req">Type</label>
                <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes"
                    (completeMethod)="filterTypes($event)" [(ngModel)]="user.type"
                    optionLabel="label" optionValue="value" placeholder="Select type"
                    [forceSelection]="true" [showClear]="true"
                    [class.ng-invalid]="submitted && !user.type" />
                @if (submitted && !user.type) {
                    <span class="field-error">Type is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Business Unit</label>
                <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits"
                    (completeMethod)="filterBusinessUnits($event)" [(ngModel)]="user.b_unit"
                    optionLabel="label" optionValue="value" placeholder="Select BU"
                    [forceSelection]="true" [showClear]="true"
                    [class.ng-invalid]="submitted && !user.b_unit" />
                @if (submitted && !user.b_unit) {
                    <span class="field-error">Business Unit is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Yash ID</label>
                <input pInputText type="text" [(ngModel)]="user.yash_id"
                    placeholder="e.g. 1001234" [pattern]="integerRegex"
                    [class.ng-invalid]="submitted && !user.yash_id" />
                @if (submitted && !user.yash_id) {
                    <span class="field-error">Yash ID is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">User Name</label>
                <input pInputText type="text" [(ngModel)]="user.name"
                    placeholder="Full name"
                    [class.ng-invalid]="submitted && !user.name" />
                @if (submitted && !user.name) {
                    <span class="field-error">Name is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Email</label>
                <input pInputText type="email" [(ngModel)]="user.email"
                    placeholder="email@yash.com" [pattern]="emailRegex"
                    [class.ng-invalid]="submitted && !user.email" />
                @if (submitted && !user.email) {
                    <span class="field-error">Email is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Password</label>
                <p-password [(ngModel)]="user.password" [toggleMask]="true"
                    inputStyleClass="w-full"
                    [class.ng-invalid]="submitted && !user.password" />
                @if (submitted && !user.password) {
                    <span class="field-error">Password is required</span>
                }
            </div>
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="userDialog = false">Cancel</button>
            <button class="dlg-save" (click)="addUser(user)">
                <i class="pi pi-check"></i> Add User
            </button>
        </div>
    </ng-template>
</p-dialog>

<!-- ═══════════════ EDIT USER DIALOG ═══════════════ -->
<p-dialog [(visible)]="userEditDialog" [style]="{width:'700px'}"
    header="Edit User Details" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="form-grid">
            <div class="form-field">
                <label class="req">Type</label>
                <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes"
                    (completeMethod)="filterTypes($event)" [(ngModel)]="user.type"
                    optionLabel="label" optionValue="value" [forceSelection]="true" />
            </div>
            <div class="form-field">
                <label class="req">Business Unit</label>
                <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits"
                    (completeMethod)="filterBusinessUnits($event)" [(ngModel)]="user.b_unit"
                    optionLabel="label" optionValue="value" [forceSelection]="true" />
            </div>
            <div class="form-field">
                <label class="req">Yash ID</label>
                <input pInputText type="text" [(ngModel)]="user.yash_id" />
            </div>
            <div class="form-field">
                <label class="req">User Name</label>
                <input pInputText type="text" [(ngModel)]="user.name" />
            </div>
            <div class="form-field">
                <label class="req">Email</label>
                <input pInputText type="email" [(ngModel)]="user.email" />
            </div>
            <div class="form-field">
                <label>IRM</label>
                <input pInputText type="text" [(ngModel)]="user.irm" placeholder="Manager name" />
            </div>
            <div class="form-field">
                <label>SRM</label>
                <input pInputText type="text" [(ngModel)]="user.srm" />
            </div>
            <div class="form-field">
                <label>BUH</label>
                <input pInputText type="text" [(ngModel)]="user.buh" />
            </div>
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="userEditDialog = false">Cancel</button>
            <button class="dlg-save" (click)="update_user(user)">
                <i class="pi pi-check"></i> Update User
            </button>
        </div>
    </ng-template>
</p-dialog>

<!-- ═══════════════ DELETE CONFIRM DIALOG ═══════════════ -->
<p-dialog [(visible)]="deleteUserDialog" [style]="{width:'440px'}"
    header="Confirm Delete" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div style="display:flex; align-items:center; gap:1rem; padding:0.5rem 0;">
            <div style="width:44px; height:44px; background:#FEF2F2; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i class="pi pi-exclamation-triangle" style="color:#DC2626; font-size:1.2rem;"></i>
            </div>
            <div>
                <div style="font-weight:700; color:#0F172A; margin-bottom:4px;">Delete User</div>
                <div style="font-size:0.85rem; color:#64748B;">
                    Are you sure you want to delete <strong>{{ user?.name }}</strong>?
                    This action cannot be undone.
                </div>
            </div>
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="deleteUserDialog = false">Cancel</button>
            <button class="dlg-danger" (click)="delete_User(user.yash_id)">
                <i class="pi pi-trash"></i> Yes, Delete
            </button>
        </div>
    </ng-template>
</p-dialog>
    `
})
export class ManageUsers implements OnInit {

    users              = signal<User[]>([]);
    user!: User;
    submitted          = false;
    filteredUsersList : User[] = [];
    first              = 0;
    rows               = 10;
    searchTerm         = '';
    loading            = true;
    isvalid            = false;
    viewMode: 'table' | 'card' = 'table';

    userDialog         = false;
    userEditDialog     = false;
    deleteUserDialog   = false;

    integerRegex = /^\d+$/;
    emailRegex   = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    cols!: Column[];
    exportColumns!: ExportColumn[];

    userTypes = [
        { label: 'User',    value: 'user'    },
        { label: 'Manager', value: 'manager' }
    ];
    filteredTypes: any[] = [];

    businessUnits = [
        { label: 'BG6-BU1', value: 'BG6-BU1' },
        { label: 'BG6-BU2', value: 'BG6-BU2' },
        { label: 'BG6-BU3', value: 'BG6-BU3' },
        { label: 'BG6-BU4', value: 'BG6-BU4' },
        { label: 'BG6-BU5', value: 'BG6-BU5' },
        { label: 'BG6-BU6', value: 'BG6-BU6' },
        { label: 'BG6-BU7', value: 'BG6-BU7' },
        { label: 'BG6-BU8', value: 'BG6-BU8' },
    ];
    filteredBusinessUnits: any[] = [];

    constructor(
        private fb: FormBuilder,
        private manageadminservice: ManageAdminsService,
        public  messageService: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public  router: Router
    ) {
        this.authservice.user.subscribe(x => {
            if (x?.type === 'Superadmin') {
                this.isvalid = true;
            } else {
                this.router.navigate(['/auth/access']);
            }
        });
    }

    ngOnInit() {
        this.loadDemoData();
        this.cols = [
            { field: 'yash_id', header: 'Yash ID' },
            { field: 'name',    header: 'User Name' },
            { field: 'email',   header: 'Email' },
            { field: 'b_unit',  header: 'Business Unit' },
            { field: 'type',    header: 'Type' },
            { field: 'irm',     header: 'IRM' },
            { field: 'srm',     header: 'SRM' },
            { field: 'buh',     header: 'BUH' },
            { field: 'bgh',     header: 'BGH' },
        ];
        this.exportColumns = this.cols.map(c => ({ title: c.header, dataKey: c.field }));
    }

    loadDemoData() {
        this.manageadminservice.getUsers().subscribe((data: any) => {
            this.users.set(data);
            this.filteredUsersList = data;
            this.loading = false;
        });
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchTerm = value;
        this.first = 0;
        this.filteredUsersList = value
            ? this.users().filter(u =>
                u.name?.toLowerCase().includes(value)       ||
                u.email?.toLowerCase().includes(value)      ||
                u.yash_id?.toString().includes(value)       ||
                u.b_unit?.toLowerCase().includes(value)     ||
                u.irm?.toLowerCase().includes(value))
            : this.users();
    }

    get paginatedUsers(): User[] {
        return this.filteredUsersList.slice(this.first, this.first + this.rows);
    }

    onPageChange(event: any) { this.first = event.first; this.rows = event.rows; }

    getInitials(name?: string): string {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    typeClass(type?: string): string {
        if (!type) return 'type-default type-pill';
        const t = type.toLowerCase();
        if (t === 'superadmin') return 'type-superadmin type-pill';
        if (t === 'manager')    return 'type-manager type-pill';
        if (t === 'user')       return 'type-user type-pill';
        return 'type-default type-pill';
    }

    openNew() { this.user = {}; this.submitted = false; this.userDialog = true; }

    editUser(u: User) { this.user = { ...u }; this.userEditDialog = true; }

    deleteUser(u: User) { this.user = { ...u }; this.deleteUserDialog = true; }

    addUser(u: User) {
        this.submitted = true;
        if (!u.type || !u.b_unit || !u.yash_id || !u.name || !u.email || !u.password) return;
        this.manageadminservice.add_user(u).subscribe(created => {
            this.userDialog = false;
            this.submitted = false;
            this.user = {};
            this.users.update(list => [...list, created]);
            this.filteredUsersList = this.users();
            this.messageService.add({ severity: 'success', summary: 'User Added', detail: `${created.name} added successfully`, life: 3000 });
        });
    }

    update_user(u: User) {
        this.manageadminservice.edit_User(u).subscribe(() => {
            this.submitted = true;
            this.userEditDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'User updated successfully', life: 3000 });
            this.reloadPage();
        });
    }

    delete_User(yash_id: any) {
        this.manageadminservice.delete_user(yash_id).subscribe(() => {
            this.deleteUserDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted', life: 3000 });
            this.reloadPage();
        });
    }

    exportCSV() {
        if (!this.filteredUsersList.length) return;
        const data = this.filteredUsersList.map(u => {
            const row: any = {};
            this.exportColumns.forEach(c => row[c.title] = (u as any)[c.dataKey]);
            return row;
        });
        const ws   = XLSX.utils.json_to_sheet(data);
        const wb   = { Sheets: { Users: ws }, SheetNames: ['Users'] };
        const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'users_list.xlsx');
        this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'Excel downloaded', life: 3000 });
    }

    filterTypes(event: { query: string }) {
        const q = event.query.toLowerCase();
        this.filteredTypes = this.userTypes.filter(t => t.label.toLowerCase().startsWith(q));
    }

    filterBusinessUnits(event: { query: string }) {
        const q = event.query.toLowerCase();
        this.filteredBusinessUnits = this.businessUnits.filter(u => u.label.toLowerCase().startsWith(q));
    }

    reloadPage() { window.location.reload(); }
}