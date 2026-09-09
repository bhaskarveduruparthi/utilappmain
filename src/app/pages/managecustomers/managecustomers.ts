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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Customer, CustomerOptions, ManageCustomerService } from '../service/managecustomer.service';
import { AuthenticationService } from '../service/authentication.service';

@Component({
    selector: 'app-managecustomers',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        ButtonModule, RippleModule, ToastModule, RouterModule,
        ToolbarModule, PanelModule, AutoCompleteModule, InputTextModule,
        TextareaModule, SelectModule, InputNumberModule, DialogModule,
        TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule,
        PasswordModule, MessageModule, PaginatorModule
    ],
    providers: [MessageService, ManageCustomerService, ConfirmationService],
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
            font-size: 1.45rem;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 0.15rem;
            letter-spacing: -0.02em;
        }
        .page-sub { font-size: 0.81rem; color: #64748B; }

        /* ── Action bar ── */
        .action-bar {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            flex-wrap: wrap;
        }
        .btn-primary {
            background: #1E3A5F; color: white; border: none; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
            white-space: nowrap;
        }
        .btn-primary:hover { background: #162D4D; }
        .btn-secondary {
            background: white; color: #374151; border: 1px solid #E2E8F0; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s;
            white-space: nowrap;
        }
        .btn-secondary:hover { background: #F1F5F9; border-color: #CBD5E1; }
        .btn-success {
            background: #16A34A; color: white; border: none; border-radius: 8px;
            padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .btn-success:hover { background: #15803D; }

        /* ── Search bar ── */
        .search-wrap {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 0 0.75rem;
            gap: 0.5rem;
            transition: border-color 0.15s;
        }
        .search-wrap:focus-within { border-color: #1E3A5F; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
        .search-wrap i { color: #94A3B8; font-size: 0.9rem; }
        .search-input {
            border: none; outline: none; font-size: 0.83rem; color: #0F172A;
            padding: 0.45rem 0; min-width: 220px; background: transparent;
        }
        .clear-search-btn {
            background: none; border: none; cursor: pointer; color: #94A3B8;
            display: flex; align-items: center; padding: 0; font-size: 0.8rem;
            transition: color 0.15s;
        }
        .clear-search-btn:hover { color: #374151; }

        /* ── Table card ── */
        .table-card {
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            overflow: hidden;
            margin-bottom: 0;
        }
        .table-meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.875rem 1.25rem;
            border-bottom: 1px solid #F1F5F9;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .table-meta-label {
            font-size: 0.82rem;
            color: #64748B;
        }
        .table-meta-label strong { color: #0F172A; }

        /* ── Table ── */
        .data-table-wrap { overflow-x: auto; }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.82rem;
            min-width: 1200px;
        }
        .data-table thead th {
            background: #F8FAFC;
            padding: 0.7rem 0.875rem;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #E2E8F0;
            white-space: nowrap;
            position: sticky;
            top: 0;
            z-index: 1;
        }
        .data-table thead th.col-code {
            background: #EFF6FF;
            color: #1E40AF;
        }
        .data-table tbody tr {
            border-bottom: 1px solid #F1F5F9;
            transition: background 0.12s;
        }
        .data-table tbody tr:hover { background: #F8FAFC; }
        .data-table tbody td {
            padding: 0.65rem 0.875rem;
            vertical-align: middle;
            color: #1E293B;
        }
        .data-table tbody td.col-code {
            background: #EFF6FF;
        }

        .code-badge {
            font-family: monospace;
            font-size: 0.76rem;
            background: #DBEAFE;
            color: #1E40AF;
            padding: 3px 8px;
            border-radius: 5px;
            font-weight: 700;
        }

        /* ── Status badges ── */
        .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.71rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .status-acquired  { background: #DCFCE7; color: #166534; }
        .status-active    { background: #DBEAFE; color: #1E40AF; }
        .status-inactive  { background: #F3F4F6; color: #6B7280; }
        .status-prospect  { background: #FEF3C7; color: #92400E; }
        .status-lost      { background: #FEE2E2; color: #991B1B; }
        .status-default   { background: #F1F5F9; color: #475569; }

        /* ── Action buttons in table ── */
        .row-actions { display: flex; gap: 5px; align-items: center; }
        .row-btn {
            width: 28px; height: 28px; border-radius: 7px; border: 1px solid #E2E8F0;
            background: white; cursor: pointer; display: flex; align-items: center;
            justify-content: center; font-size: 0.78rem; transition: all 0.15s;
        }
        .row-btn-edit  { color: #4F46E5; }
        .row-btn-edit:hover  { background: #EEF2FF; border-color: #C7D2FE; }
        .row-btn-del   { color: #DC2626; }
        .row-btn-del:hover   { background: #FEF2F2; border-color: #FECACA; }

        /* ── Empty / loading ── */
        .table-empty {
            text-align: center;
            padding: 3rem;
            color: #94A3B8;
        }
        .table-empty i { font-size: 2rem; display: block; margin-bottom: 0.625rem; }
        .table-empty p { font-size: 0.87rem; }

        /* ── Paginator wrapper ── */
        .paginator-wrap {
            padding: 0.625rem 0.875rem;
            border-top: 1px solid #F1F5F9;
        }

        /* ── Dialog form grid ── */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem 1.5rem;
        }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        .form-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .form-field label {
            font-size: 0.78rem;
            font-weight: 600;
            color: #374151;
        }
        .form-field label.req::after { content: ' *'; color: #EF4444; }
        .field-error { font-size: 0.72rem; color: #DC2626; margin-top: 2px; }

        /* ── Dialog footer ── */
        .dlg-footer { display: flex; gap: 0.625rem; justify-content: flex-end; }
        .dlg-cancel {
            background: none; border: 1px solid #E2E8F0; border-radius: 8px;
            padding: 0.45rem 1rem; font-size: 0.83rem; cursor: pointer; color: #374151;
            transition: all 0.15s;
        }
        .dlg-cancel:hover { background: #F8FAFC; }
        .dlg-save {
            background: #1E3A5F; color: white; border: none; border-radius: 8px;
            padding: 0.45rem 1.25rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .dlg-save:hover { background: #162D4D; }
        .dlg-save:disabled { opacity: 0.5; cursor: default; }
    `],
    template: `
<p-toast />
<p-confirmDialog />

<div class="page-shell">

    <!-- ── Page Header ── -->
    <div class="page-header">
        <div>
            <h1 class="page-title">Customer Master</h1>
            <span class="page-sub">Manage all customer accounts, groups and billing entities</span>
        </div>
        <div class="action-bar">
            <!-- Search -->
            <div class="search-wrap">
                <i class="pi pi-search"></i>
                <input
                    class="search-input"
                    type="text"
                    placeholder="Search customers…"
                    [(ngModel)]="searchTerm"
                    (ngModelChange)="onSearchChange($event)"
                />
                @if (searchTerm) {
                    <button class="clear-search-btn" (click)="clearSearch()">
                        <i class="pi pi-times"></i>
                    </button>
                }
            </div>
            @if (isvalid) {
                <button class="btn-primary" (click)="openNew()">
                    <i class="pi pi-plus"></i> Add Customer
                </button>
                <!--<button class="btn-secondary" (click)="openUploadDialog()">
                    <i class="pi pi-upload"></i> Bulk Upload
                </button>-->
                <button class="btn-success" (click)="downloadExcel()">
                    <i class="pi pi-download"></i> Export Excel
                </button>
            }
        </div>
    </div>

    <!-- ── Table Card ── -->
    <div class="table-card">
        <div class="table-meta-row">
            <span class="table-meta-label">
                Showing <strong>{{ customers().length }}</strong> of
                <strong>{{ totalitems }}</strong> customers
            </span>
        </div>

        <div class="data-table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-code">Customer Code</th>
                        <th>Customer Name</th>
                        <th>Customer Group</th>
                        <th>Geography</th>
                        <th>Country</th>
                        <th>Region</th>
                        <th>Territory</th>
                        <th>Market</th>
                        <th>YASH Billing Entity</th>
                        <th>BDL Name</th>
                        <th>BDL ID</th>
                        
                        <th>Status</th>
                        @if (isvalid) { <th>Actions</th> }
                    </tr>
                </thead>
                <tbody>
                    @if (loading) {
                        <tr>
                            <td [attr.colspan]="isvalid ? 14 : 13" class="table-empty">
                                <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>
                                <p>Loading customers…</p>
                            </td>
                        </tr>
                    } @else if (customers().length === 0) {
                        <tr>
                            <td [attr.colspan]="isvalid ? 14 : 13" class="table-empty">
                                <i class="pi pi-inbox"></i>
                                <p>{{ searchTerm ? 'No customers match your search.' : 'No customers found.' }}</p>
                            </td>
                        </tr>
                    } @else {
                        @for (c of customers(); track c.id) {
                            <tr>
                                <td class="col-code"><span class="code-badge">{{ c.customer_code }}</span></td>
                                <td><strong>{{ c.customer_name }}</strong></td>
                                <td>{{ c.customer_group || '—' }}</td>
                                <td>{{ c.geography || '—' }}</td>
                                <td>{{ c.country || '—' }}</td>
                                <td>{{ c.region || '—' }}</td>
                                <td>{{ c.territory || '—' }}</td>
                                <td>{{ c.market || '—' }}</td>
                                <td>{{ c.yash_billing_entity || '—' }}</td>
                                <td>{{ c.business_development_lead || '—' }}</td>
                                <td>{{ c.business_development_lead_id || '—' }}</td>
                                
                                <td>
                                    <span class="status-pill" [class]="statusClass(c.customer_status)">
                                        {{ c.customer_status || '—' }}
                                    </span>
                                </td>
                                @if (isvalid) {
                                    <td>
                                        <div class="row-actions">
                                            <button class="row-btn row-btn-edit"
                                                (click)="editCustomer(c)"
                                                title="Edit">
                                                <i class="pi pi-pencil"></i>
                                            </button>
                                            <button class="row-btn row-btn-del"
                                                (click)="confirmDelete(c)"
                                                title="Delete">
                                                <i class="pi pi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                }
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
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} customers"
                [showCurrentPageReport]="true"
                (onPageChange)="onPageChange($event)" />
        </div>
    </div>

</div>

<!-- ═══════════════ ADD CUSTOMER DIALOG ═══════════════ -->
<p-dialog [(visible)]="customerDialog" [style]="{width:'860px'}"
    header="Add Customer" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="form-grid">
            <div class="form-field">
                <label class="req">Customer Code</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_code"
                    placeholder="e.g. CUST-001"
                    [class.ng-invalid]="submitted && !customer.customer_code" />
                @if (submitted && !customer.customer_code) {
                    <span class="field-error">Customer Code is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Customer Name</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_name"
                    placeholder="Full customer name"
                    [class.ng-invalid]="submitted && !customer.customer_name" />
                @if (submitted && !customer.customer_name) {
                    <span class="field-error">Customer Name is required</span>
                }
            </div>
            <div class="form-field">
                <label>Customer Group</label>
                <p-autocomplete [(ngModel)]="customer.customer_group"
                    [suggestions]="filteredGroups" (completeMethod)="filterGroups($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="Select or type" />
            </div>
            <div class="form-field">
                <label>Geography</label>
                <p-autocomplete [(ngModel)]="customer.geography"
                    [suggestions]="filteredGeographies" (completeMethod)="filterGeographies($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="Select or type" />
            </div>
            <div class="form-field">
                <label>YASH Billing Entity</label>
                <p-autocomplete [(ngModel)]="customer.yash_billing_entity"
                    [suggestions]="filteredBillingEntities" (completeMethod)="filterBillingEntities($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="Select or type" />
            </div>
            <div class="form-field">
                <label>Region</label>
                <p-autocomplete [(ngModel)]="customer.region"
                    [suggestions]="filteredRegions" (completeMethod)="filterRegions($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="Select or type" />
            </div>
            <div class="form-field">
                <label>Country</label>
                <p-autocomplete [(ngModel)]="customer.country"
                    [suggestions]="filteredCountries" (completeMethod)="filterCountries($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="Select or type" />
            </div>
            <div class="form-field">
                <label>Territory</label>
                <input pInputText type="text" [(ngModel)]="customer.territory" placeholder="e.g. APAC" />
            </div>
            <div class="form-field">
                <label>Market</label>
                <input pInputText type="text" [(ngModel)]="customer.market" placeholder="e.g. Manufacturing" />
            </div>
            <div class="form-field">
                <label>Business Development Lead</label>
                <input pInputText type="text" [(ngModel)]="customer.business_development_lead" />
            </div>
            <div class="form-field">
                <label>BD Lead ID</label>
                <input pInputText type="text" [(ngModel)]="customer.business_development_lead_id" />
            </div>
            <div class="form-field">
                <label>Customer Growth Partner</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_growth_partner" />
            </div>
            <div class="form-field">
                <label>Customer Status</label>
                <p-autocomplete [(ngModel)]="customer.customer_status"
                    [suggestions]="filteredStatuses" (completeMethod)="filterStatuses($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true"
                    placeholder="e.g. Active" />
            </div>
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="customerDialog = false" [disabled]="saving">Cancel</button>
            <button class="dlg-save" (click)="saveCustomer()" [disabled]="saving">
                <i class="pi" [class.pi-check]="!saving" [class.pi-spin]="saving" [class.pi-spinner]="saving"></i>
                {{ saving ? 'Saving…' : 'Add Customer' }}
            </button>
        </div>
    </ng-template>
</p-dialog>

<!-- ═══════════════ EDIT CUSTOMER DIALOG ═══════════════ -->
<p-dialog [(visible)]="customerEditDialog" [style]="{width:'860px'}"
    header="Edit Customer" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="form-grid">
            <div class="form-field">
                <label class="req">Customer Code</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_code"
                    [class.ng-invalid]="submitted && !customer.customer_code" />
                @if (submitted && !customer.customer_code) {
                    <span class="field-error">Customer Code is required</span>
                }
            </div>
            <div class="form-field">
                <label class="req">Customer Name</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_name"
                    [class.ng-invalid]="submitted && !customer.customer_name" />
                @if (submitted && !customer.customer_name) {
                    <span class="field-error">Customer Name is required</span>
                }
            </div>
            <div class="form-field">
                <label>Customer Group</label>
                <p-autocomplete [(ngModel)]="customer.customer_group"
                    [suggestions]="filteredGroups" (completeMethod)="filterGroups($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
            <div class="form-field">
                <label>Geography</label>
                <p-autocomplete [(ngModel)]="customer.geography"
                    [suggestions]="filteredGeographies" (completeMethod)="filterGeographies($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
            <div class="form-field">
                <label>YASH Billing Entity</label>
                <p-autocomplete [(ngModel)]="customer.yash_billing_entity"
                    [suggestions]="filteredBillingEntities" (completeMethod)="filterBillingEntities($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
            <div class="form-field">
                <label>Region</label>
                <p-autocomplete [(ngModel)]="customer.region"
                    [suggestions]="filteredRegions" (completeMethod)="filterRegions($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
            <div class="form-field">
                <label>Country</label>
                <p-autocomplete [(ngModel)]="customer.country"
                    [suggestions]="filteredCountries" (completeMethod)="filterCountries($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
            <div class="form-field">
                <label>Territory</label>
                <input pInputText type="text" [(ngModel)]="customer.territory" />
            </div>
            <div class="form-field">
                <label>Market</label>
                <input pInputText type="text" [(ngModel)]="customer.market" />
            </div>
            <div class="form-field">
                <label>Business Development Lead</label>
                <input pInputText type="text" [(ngModel)]="customer.business_development_lead" />
            </div>
            <div class="form-field">
                <label>BD Lead ID</label>
                <input pInputText type="text" [(ngModel)]="customer.business_development_lead_id" />
            </div>
            <div class="form-field">
                <label>Customer Growth Partner</label>
                <input pInputText type="text" [(ngModel)]="customer.customer_growth_partner" />
            </div>
            <div class="form-field">
                <label>Customer Status</label>
                <p-autocomplete [(ngModel)]="customer.customer_status"
                    [suggestions]="filteredStatuses" (completeMethod)="filterStatuses($event)"
                    [dropdown]="true" [forceSelection]="false" [showClear]="true" />
            </div>
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="customerEditDialog = false" [disabled]="saving">Cancel</button>
            <button class="dlg-save" (click)="updateCustomer()" [disabled]="saving">
                <i class="pi" [class.pi-check]="!saving" [class.pi-spin]="saving" [class.pi-spinner]="saving"></i>
                {{ saving ? 'Saving…' : 'Update Customer' }}
            </button>
        </div>
    </ng-template>
</p-dialog>

<!-- ═══════════════ BULK UPLOAD DIALOG ═══════════════ -->
<p-dialog [(visible)]="uploadDialog" [style]="{width:'520px'}"
    header="Bulk Upload Customers" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div style="display:flex; flex-direction:column; gap:1rem;">
            <div style="background:#F0F9FF; border:1px solid #BAE6FD; border-radius:8px; padding:0.875rem 1rem; font-size:0.82rem; color:#0369A1;">
                <i class="pi pi-info-circle" style="margin-right:0.4rem;"></i>
                Upload an <strong>Excel</strong> (.xlsx/.xls) or <strong>CSV</strong> file. Columns must match the template.
            </div>
            <button class="btn-secondary" style="width:fit-content" (click)="downloadTemplate()">
                <i class="pi pi-download"></i> Download Template
            </button>
            <div class="form-field">
                <label style="font-size:0.78rem; font-weight:600; color:#374151;">Select File</label>
                <input type="file" id="fileUpload"
                    accept=".xlsx,.xls,.csv"
                    (change)="onFileSelect($event)"
                    style="border:1px solid #E2E8F0; border-radius:8px; padding:0.45rem; font-size:0.82rem;" />
                @if (selectedFile) {
                    <span style="font-size:0.78rem; color:#16A34A; display:flex; align-items:center; gap:0.3rem; margin-top:4px;">
                        <i class="pi pi-file-excel"></i> {{ selectedFile.name }}
                    </span>
                }
            </div>
            @if (loading) {
                <div style="display:flex; align-items:center; gap:0.5rem; color:#64748B; font-size:0.83rem;">
                    <i class="pi pi-spin pi-spinner"></i> Uploading…
                </div>
            }
        </div>
    </ng-template>
    <ng-template pTemplate="footer">
        <div class="dlg-footer">
            <button class="dlg-cancel" (click)="uploadDialog = false" [disabled]="loading">Cancel</button>
            <button class="dlg-save" (click)="uploadFile()" [disabled]="!selectedFile || loading">
                <i class="pi" [class.pi-upload]="!loading" [class.pi-spin]="loading" [class.pi-spinner]="loading"></i>
                {{ loading ? 'Uploading…' : 'Upload' }}
            </button>
        </div>
    </ng-template>
</p-dialog>
    `
})
export class ManageCustomers implements OnInit {

    customers   = signal<Customer[]>([]);
    customer: Customer = {};
    submitted   = false;
    saving      = false;
    loading     = true;
    isvalid     = false;

    customerDialog     = false;
    customerEditDialog = false;
    uploadDialog       = false;
    selectedFile: File | null = null;

    first               = 0;
    CurrentCustomerPage = 1;
    totalitems          = 0;

    searchTerm   = '';
    private searchSubject = new Subject<string>();

    allGroups          : string[] = [];
    allGeographies     : string[] = [];
    allBillingEntities : string[] = [];
    allRegions         : string[] = [];
    allCountries       : string[] = [];
    allStatuses        : string[] = ['Acquired', 'Active', 'Inactive', 'Prospect', 'Lost'];

    filteredGroups          : string[] = [];
    filteredGeographies     : string[] = [];
    filteredBillingEntities : string[] = [];
    filteredRegions         : string[] = [];
    filteredCountries       : string[] = [];
    filteredStatuses        : string[] = [];

    constructor(
        private fb: FormBuilder,
        private managecustomerservice: ManageCustomerService,
        public  messageService: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public  router: Router
    ) {
        this.authservice.user.subscribe(x => {
            if (x?.type === 'Superadmin' || x?.type === 'BUH') {
                this.isvalid = true;
            } else if (x?.type === 'manager') {
                this.isvalid = false;
            } else {
                this.router.navigate(['/auth/access']);
            }
        });
    }

    ngOnInit() {
        const storedPage = localStorage.getItem('CurrentCustomerPage');
        if (storedPage) {
            this.CurrentCustomerPage = parseInt(storedPage);
            this.first = (this.CurrentCustomerPage - 1) * 10;
        }
        this.loadCustomers(this.CurrentCustomerPage);
        this.loadDropdownOptions();

        this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(term => {
            this.CurrentCustomerPage = 1;
            this.first = 0;
            this.loadCustomers(1, term);
        });
    }

    loadCustomers(page: number, search: string = this.searchTerm) {
        this.loading = true;
        this.managecustomerservice.getCustomers(page, search).subscribe({
            next: (data: any) => {
                if (data && Array.isArray(data.data)) {
                    this.customers.set(data.data);
                    this.totalitems = data.totalrecords ?? data.data.length;
                } else if (Array.isArray(data)) {
                    this.customers.set(data);
                    this.totalitems = data.length;
                } else {
                    this.customers.set([]);
                    this.totalitems = 0;
                }
                this.loading = false;
            },
            error: err => {
                this.customers.set([]);
                this.totalitems = 0;
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load customers' });
            }
        });
    }

    loadDropdownOptions() {
        this.managecustomerservice.getCustomerOptions().subscribe({
            next: (opts) => {
                this.allGroups          = opts.customer_groups        ?? [];
                this.allGeographies     = opts.geographies             ?? [];
                this.allBillingEntities = opts.yash_billing_entities  ?? [];
                this.allRegions         = opts.regions                 ?? [];
                this.allCountries       = opts.countries               ?? [];
                if (opts.customer_statuses?.length) this.allStatuses = opts.customer_statuses;
            },
            error: err => console.error('Could not load dropdown options:', err)
        });
    }

    onSearchChange(term: string) { this.searchSubject.next(term); }

    clearSearch() {
        this.searchTerm = '';
        this.CurrentCustomerPage = 1;
        this.first = 0;
        this.loadCustomers(1, '');
    }

    onPageChange(event: any) {
        this.CurrentCustomerPage = event.page + 1;
        this.first = event.first;
        localStorage.setItem('CurrentCustomerPage', this.CurrentCustomerPage.toString());
        this.loadCustomers(this.CurrentCustomerPage);
    }

    openNew() { this.customer = {}; this.submitted = false; this.customerDialog = true; }

    editCustomer(c: Customer) { this.customer = { ...c }; this.submitted = false; this.customerEditDialog = true; }

    saveCustomer() {
        this.submitted = true;
        if (!this.customer.customer_code?.trim() || !this.customer.customer_name?.trim()) return;
        this.saving = true;
        this.managecustomerservice.addCustomer(this.customer).subscribe({
            next: () => {
                this.saving = false; this.customerDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Customer added successfully', life: 3000 });
                this.loadCustomers(this.CurrentCustomerPage);
                this.loadDropdownOptions();
            },
            error: err => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to add customer' });
            }
        });
    }

    updateCustomer() {
        this.submitted = true;
        if (!this.customer.customer_code?.trim() || !this.customer.customer_name?.trim() || !this.customer.id) return;
        this.saving = true;
        this.managecustomerservice.editCustomer(this.customer.id, this.customer).subscribe({
            next: () => {
                this.saving = false; this.customerEditDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Customer updated successfully', life: 3000 });
                this.loadCustomers(this.CurrentCustomerPage);
                this.loadDropdownOptions();
            },
            error: err => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to update customer' });
            }
        });
    }

    confirmDelete(c: Customer) {
        this.confirmationService.confirm({
            message: `Delete <b>${c.customer_name}</b>? This cannot be undone.`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, delete',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (!c.id) return;
                this.managecustomerservice.deleteCustomer(c.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Customer deleted', life: 3000 });
                        this.loadCustomers(this.CurrentCustomerPage);
                    },
                    error: err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Delete failed' })
                });
            }
        });
    }

    openUploadDialog() { this.selectedFile = null; this.uploadDialog = true; }

    onFileSelect(event: any) {
        const file: File = event.target.files[0];
        if (!file) return;
        const valid = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
        if (valid.includes(file.type) || /\.(xlsx|xls|csv)$/i.test(file.name)) {
            this.selectedFile = file;
        } else {
            this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Please select .xlsx, .xls, or .csv' });
            event.target.value = '';
        }
    }

    uploadFile() {
        if (!this.selectedFile) return;
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        this.loading = true;
        this.managecustomerservice.uploadCustomersBulk(formData).subscribe({
            next: (res: any) => {
                this.loading = false; this.uploadDialog = false; this.selectedFile = null;
                this.messageService.add({ severity: 'success', summary: 'Upload Complete', detail: `Added: ${res.added ?? 0}, Updated: ${res.updated ?? 0}, Failed: ${res.failed ?? 0}`, life: 6000 });
                this.loadCustomers(this.CurrentCustomerPage);
                this.loadDropdownOptions();
            },
            error: err => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: err.error?.error || 'Unknown error' });
            }
        });
    }

    downloadExcel() {
        this.loading = true;
        this.managecustomerservice.downloadCustomersExcel().subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `customers_${new Date().toISOString().slice(0,10)}.xlsx`;
                a.click(); window.URL.revokeObjectURL(url);
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'Excel downloaded', life: 3000 });
            },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Export failed' }); }
        });
    }

    downloadTemplate() {
        this.managecustomerservice.downloadTemplate().subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'customer_upload_template.xlsx';
                a.click(); window.URL.revokeObjectURL(url);
                this.messageService.add({ severity: 'success', summary: 'Downloaded', detail: 'Template downloaded', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to download template' })
        });
    }

    statusClass(status?: string): string {
        if (!status) return 'status-default';
        const s = status.toLowerCase();
        if (s === 'acquired') return 'status-acquired status-pill';
        if (s === 'active')   return 'status-active status-pill';
        if (s === 'inactive') return 'status-inactive status-pill';
        if (s === 'prospect') return 'status-prospect status-pill';
        if (s === 'lost')     return 'status-lost status-pill';
        return 'status-default status-pill';
    }

    private filterList(list: string[], query: string): string[] {
        const q = (query || '').toLowerCase();
        return q ? list.filter(i => i.toLowerCase().includes(q)) : [...list];
    }

    filterGroups(event: any)          { this.filteredGroups          = this.filterList(this.allGroups, event.query); }
    filterGeographies(event: any)     { this.filteredGeographies     = this.filterList(this.allGeographies, event.query); }
    filterBillingEntities(event: any) { this.filteredBillingEntities = this.filterList(this.allBillingEntities, event.query); }
    filterRegions(event: any)         { this.filteredRegions         = this.filterList(this.allRegions, event.query); }
    filterCountries(event: any)       { this.filteredCountries       = this.filterList(this.allCountries, event.query); }
    filterStatuses(event: any)        { this.filteredStatuses        = this.filterList(this.allStatuses, event.query); }
}