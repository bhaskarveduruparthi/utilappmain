import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Card } from 'primeng/card';

import { TimesheetService } from '../service/timsheet.service';

interface AllocationUser {
  id: number;
  name: string;
  yash_id: string;
  email: string;
  b_unit: string;
}

interface ProjectOption {
  id: number;
  project_name: string;
  project_code: string;
  project_type: string;
}

interface Allocation {
  id: number;
  user_id: number;
  user_name: string;
  yash_id: string;
  project_id: number;
  project_name: string;
  project_code: string;
  project_type: string;
  start_date: string;
  end_date: string | null;
  status: 'Active' | 'Upcoming' | 'Ended';
}

@Component({
  selector: 'app-project-allocations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    SelectModule, DatePickerModule, TagModule, ToastModule, ConfirmDialogModule,
    TooltipModule, IconFieldModule, InputIconModule, Card,
  ],
  providers: [MessageService, ConfirmationService],
  template: `

    <p-card>
      <p-toast position="top-right" />
      <p-confirmDialog />

      <div class="pa-page">

        <!-- Header -->
        <div class="pa-header">
          <div>
            <h2 class="pa-title">Project Allocations</h2>
            <span class="pa-sub">Assign billable projects to your team with a start and end date — once the end date passes, it drops off their timesheet automatically</span>
          </div>
          <button pButton label="Assign Project" icon="pi pi-plus"
            class="add-btn" (click)="openCreate()"></button>
        </div>

        <!-- Stats bar -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-num">{{ allocations().length }}</span>
            <span class="stat-lbl">Total</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-num green">{{ statusCount('Active') }}</span>
            <span class="stat-lbl">Active</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-num blue">{{ statusCount('Upcoming') }}</span>
            <span class="stat-lbl">Upcoming</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-num gray">{{ statusCount('Ended') }}</span>
            <span class="stat-lbl">Ended</span>
          </div>
        </div>

        <!-- Table -->
        <div class="pa-table-card">
          <p-table
            [value]="filteredAllocations()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="15"
            [rowsPerPageOptions]="[10, 15, 25, 50]"
            styleClass="pa-table"
            sortField="start_date"
            [sortOrder]="-1"
          >
            <ng-template pTemplate="caption">
              <div class="table-cap">
                <div class="type-filter-tabs">
                  <button class="ftab" [class.active]="activeStatusFilter() === ''"
                    (click)="activeStatusFilter.set(''); applyFilter()">All</button>
                  @for (s of statusOptions; track s) {
                    <button class="ftab" [class.active]="activeStatusFilter() === s"
                      (click)="activeStatusFilter.set(s); applyFilter()">{{ s }}</button>
                  }
                </div>
                <p-iconfield>
                  <p-inputicon styleClass="pi pi-search" />
                  <input pInputText placeholder="Search user or project..." [(ngModel)]="searchTerm"
                    (ngModelChange)="applyFilter()" class="search-input" />
                </p-iconfield>
              </div>
            </ng-template>

            <ng-template pTemplate="header">
              <tr style="background: #EFF6FF; color: #1E40AF;">
                <th pSortableColumn="user_name">User <p-sortIcon field="user_name" /></th>
                <th pSortableColumn="project_name">Project <p-sortIcon field="project_name" /></th>
                <th pSortableColumn="start_date" style="width:130px">Start Date <p-sortIcon field="start_date" /></th>
                <th pSortableColumn="end_date" style="width:130px">End Date <p-sortIcon field="end_date" /></th>
                <th style="width:100px; text-align:center">Status</th>
                <th style="width:130px; text-align:center">Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-a>
              <tr [class.inactive-row]="a.status === 'Ended'">
                <td>
                  <div class="user-cell">
                    <span class="user-name">{{ a.user_name }}</span>
                    <span class="user-sub">{{ a.yash_id }}</span>
                  </div>
                </td>
                <td>
                  <div class="proj-cell">
                    <span class="proj-name">{{ a.project_name }}</span>
                    <span class="type-pill type-{{ a.project_type?.toLowerCase() }}">{{ a.project_type }}</span>
                  </div>
                </td>
                <td>{{ a.start_date | date: 'dd MMM yyyy' }}</td>
                <td>{{ a.end_date ? (a.end_date | date: 'dd MMM yyyy') : 'Open-ended' }}</td>
                <td style="text-align:center">
                  <p-tag [value]="a.status" [severity]="statusSeverity(a.status)" />
                </td>
                <td style="text-align:center">
                  <button pButton icon="pi pi-pencil"
                    class="p-button-text p-button-sm p-button-rounded edit-btn"
                    pTooltip="Edit dates" tooltipPosition="top"
                    (click)="openEdit(a)">
                  </button>
                  @if (a.status !== 'Ended') {
                    <button pButton icon="pi pi-stop-circle"
                      class="p-button-text p-button-sm p-button-rounded p-button-warning"
                      pTooltip="End now" tooltipPosition="top"
                      (click)="confirmEndNow(a)">
                    </button>
                  }
                  @if (removeAllocationEnabled) {
                    <button pButton icon="pi pi-trash"
                      class="p-button-text p-button-sm p-button-rounded p-button-danger delete-btn"
                      pTooltip="Remove" tooltipPosition="top"
                      (click)="confirmDelete(a)">
                    </button>
                  }
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <i class="pi pi-user-plus empty-icon"></i>
                    <p>No project allocations yet</p>
                    <button pButton label="Assign First Project" icon="pi pi-plus"
                      class="p-button-outlined p-button-sm" (click)="openCreate()"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Create / Edit Dialog -->
        <p-dialog
          [header]="editMode() ? 'Edit Allocation Dates' : 'Assign Project to User'"
          [(visible)]="dialogVisible"
          [modal]="true"
          [style]="{ width: '560px' }"
          [draggable]="false"
          styleClass="pa-dialog"
        >
          <form [formGroup]="allocForm" class="alloc-form">

            @if (!editMode()) {
              <div class="form-row">
                <div class="form-field">
                  <label>User <span class="req">*</span></label>
                  <p-select
                    formControlName="user_id"
                    [options]="userOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select user"
                    [filter]="true"
                    filterBy="label"
                    appendTo="body"
                    [class.ng-invalid]="isInvalid('user_id')"
                  />
                  @if (isInvalid('user_id')) {
                    <span class="field-error">User is required</span>
                  }
                </div>
                <div class="form-field">
                  <label>Project <span class="req">*</span></label>
                  <p-select
                    formControlName="project_id"
                    [options]="projectOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select project"
                    [filter]="true"
                    filterBy="label"
                    appendTo="body"
                    [class.ng-invalid]="isInvalid('project_id')"
                  />
                  @if (isInvalid('project_id')) {
                    <span class="field-error">Project is required</span>
                  }
                </div>
              </div>
            } @else {
              <div class="edit-readonly-banner">
                <i class="pi pi-info-circle"></i>
                <span><strong>{{ editingUserName }}</strong> — {{ editingProjectName }}</span>
              </div>
            }

            <div class="form-row">
              <div class="form-field">
                <label>Start Date <span class="req">*</span></label>
                <p-datepicker formControlName="start_date" dateFormat="dd/mm/yy"
                  placeholder="Start date" [showIcon]="true" appendTo="body" />
                @if (isInvalid('start_date')) {
                  <span class="field-error">Start date is required</span>
                }
              </div>
              <div class="form-field">
                <label>End Date</label>
                <p-datepicker formControlName="end_date" dateFormat="dd/mm/yy"
                  placeholder="Leave blank for open-ended" [showIcon]="true" [showClear]="true" appendTo="body" />
              </div>
            </div>

            <div class="type-hint">
              <i class="pi pi-info-circle"></i>
              Leaving the end date blank keeps this project visible on the user's timesheet until you end it.
            </div>

          </form>

          <ng-template pTemplate="footer">
            <button pButton label="Cancel" icon="pi pi-times"
              class="p-button-text p-button-secondary"
              (click)="dialogVisible = false"></button>
            <button pButton [label]="editMode() ? 'Save Dates' : 'Assign Project'"
              icon="pi pi-check"
              [loading]="saving()"
              [disabled]="allocForm.invalid"
              class="save-btn"
              (click)="saveAllocation()"></button>
          </ng-template>
        </p-dialog>

      </div>
    </p-card>

  `,
  styles: [`
    .pa-page { padding: 1.5rem 2rem; max-width: 1500px; margin: 0 auto; }

    .pa-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
    }
    .pa-title { font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem; }
    .pa-sub { font-size: 0.9rem; color: #6B7280; max-width: 640px; display: inline-block; }
    .add-btn { background: #1E3A5F !important; border-color: #1E3A5F !important; font-weight: 600; white-space: nowrap; }

    .stats-bar {
      display: flex; align-items: center; gap: 0;
      background: white; border: 1px solid #E5E7EB; border-radius: 10px;
      padding: 1.2rem 2rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.25rem;
    }
    .stat-item { text-align: center; padding: 0 1rem; }
    .stat-num { display: block; font-size: 1.6rem; font-weight: 800; color: #111827; line-height: 1; }
    .stat-num.green { color: #16A34A; }
    .stat-num.blue { color: #2563EB; }
    .stat-num.gray { color: #6B7280; }
    .stat-lbl { font-size: 0.8rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-sep { width: 1px; height: 32px; background: #E5E7EB; }

    .pa-table-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }

    .table-cap { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
    .type-filter-tabs { display: flex; gap: 4px; }
    .ftab {
      border: 1px solid #E5E7EB; background: white; border-radius: 20px;
      padding: 6px 18px; font-size: 0.9rem; font-weight: 500; color: #6B7280;
      cursor: pointer; transition: all 0.15s;
    }
    .ftab:hover { border-color: #1E3A5F; color: #1E3A5F; }
    .ftab.active { background: #1E3A5F; border-color: #1E3A5F; color: white; font-weight: 600; }
    .search-input { font-size: 0.95rem !important; width: 280px; }

    .user-cell, .proj-cell { display: flex; flex-direction: column; gap: 2px; }
    .user-name, .proj-name { font-weight: 600; color: #111827; font-size: 0.95rem; }
    .user-sub { font-size: 0.78rem; color: #9CA3AF; }

    .type-pill {
      font-size: 0.65rem; font-weight: 700; padding: 2px 8px; width: fit-content;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .type-billable { background: #DCFCE7; color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave { background: #FEF3C7; color: #92400E; }
    .type-pmo { background: #F3E8FF; color: #7E22CE; }

    .inactive-row td { opacity: 0.55; }
    .edit-btn { color: #4F46E5 !important; }
    .delete-btn:hover { background: #FEF2F2 !important; }

    .empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .empty-icon { font-size: 2.5rem; color: #D1D5DB; }
    .empty-state p { color: #6B7280; font-size: 0.9rem; margin: 0; }

    .alloc-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.25rem 0; }
    .form-row { display: flex; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
    .form-field label { font-size: 0.78rem; font-weight: 600; color: #374151; }
    .req { color: #EF4444; }
    .field-error { font-size: 0.72rem; color: #DC2626; }

    .edit-readonly-banner {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;
      background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 8px; padding: 0.6rem 0.875rem; color: #374151;
    }

    .type-hint {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.78rem; padding: 0.6rem 0.875rem; border-radius: 8px;
      background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;
    }

    .save-btn { background: #1E3A5F !important; border-color: #1E3A5F !important; }

    ::ng-deep .pa-table .p-datatable-tbody > tr > td { padding: 0.9rem 1rem; }
    ::ng-deep .pa-table .p-datatable-thead > tr > th { background: #F8FAFC; padding: 1rem; font-size: 0.95rem; }
    ::ng-deep .pa-dialog .p-datepicker-input, ::ng-deep .pa-dialog .p-select { width: 100%; }
  `]
})
export class ProjectAllocationsComponent implements OnInit {
  // Disabled 2026-09-09: "Remove Project Allocation" is turned off in the
  // UI (flip to re-enable; the backend has a matching
  // REMOVE_PROJECT_ALLOCATION_ENABLED flag in timesheet_views.py that
  // must also be flipped for the action to actually work end-to-end).
  removeAllocationEnabled = false;

  loading = signal(false);
  saving = signal(false);
  editMode = signal(false);
  dialogVisible = false;
  searchTerm = '';
  activeStatusFilter = signal('');

  allocations = signal<Allocation[]>([]);
  filteredAllocations = signal<Allocation[]>([]);

  users = signal<AllocationUser[]>([]);
  projects = signal<ProjectOption[]>([]);
  userOptions: { label: string; value: number }[] = [];
  projectOptions: { label: string; value: number }[] = [];

  statusOptions = ['Active', 'Upcoming', 'Ended'];

  editingId: number | null = null;
  editingUserName = '';
  editingProjectName = '';

  allocForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tsService: TimesheetService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.allocForm = this.fb.group({
      user_id: [null, Validators.required],
      project_id: [null, Validators.required],
      start_date: [new Date(), Validators.required],
      end_date: [null],
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadProjects();
    this.loadAllocations();
  }

  loadUsers() {
    this.tsService.getAllocatableUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.userOptions = data.map(u => ({ label: `${u.name} (${u.yash_id})`, value: u.id }));
      }
    });
  }

  loadProjects() {
    this.tsService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.projectOptions = data.map((p: any) => ({ label: `${p.project_name} [${p.project_code}]`, value: p.id }));
      }
    });
  }

  loadAllocations() {
    this.loading.set(true);
    this.tsService.getAllocations().subscribe({
      next: (data) => {
        this.allocations.set(data as Allocation[]);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter() {
    let result = this.allocations();
    if (this.activeStatusFilter()) {
      result = result.filter(a => a.status === this.activeStatusFilter());
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(a =>
        a.user_name.toLowerCase().includes(term) ||
        a.project_name.toLowerCase().includes(term) ||
        a.project_code.toLowerCase().includes(term)
      );
    }
    this.filteredAllocations.set(result);
  }

  statusCount(status: string) { return this.allocations().filter(a => a.status === status).length; }

  statusSeverity(status: string): 'success' | 'info' | 'secondary' {
    if (status === 'Active') return 'success';
    if (status === 'Upcoming') return 'info';
    return 'secondary';
  }

  isInvalid(field: string) {
    const ctrl = this.allocForm.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  openCreate() {
    this.editMode.set(false);
    this.editingId = null;
    this.allocForm.reset({ user_id: null, project_id: null, start_date: new Date(), end_date: null });
    this.allocForm.get('user_id')?.enable();
    this.allocForm.get('project_id')?.enable();
    this.dialogVisible = true;
  }

  openEdit(a: Allocation) {
    this.editMode.set(true);
    this.editingId = a.id;
    this.editingUserName = a.user_name;
    this.editingProjectName = `${a.project_name} [${a.project_code}]`;
    this.allocForm.reset({
      user_id: a.user_id,
      project_id: a.project_id,
      start_date: new Date(a.start_date),
      end_date: a.end_date ? new Date(a.end_date) : null,
    });
    this.dialogVisible = true;
  }

  private toIso(d: Date | null): string | null {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  saveAllocation() {
    if (this.allocForm.invalid) {
      this.allocForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.allocForm.value;
    const startIso = this.toIso(value.start_date);
    const endIso = this.toIso(value.end_date);

    const req = this.editMode()
      ? this.tsService.updateAllocation(this.editingId!, { start_date: startIso!, end_date: endIso })
      : this.tsService.createAllocation({
          user_id: value.user_id, project_id: value.project_id,
          start_date: startIso!, end_date: endIso,
        });

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible = false;
        this.loadAllocations();
        this.messageService.add({
          severity: 'success',
          summary: this.editMode() ? 'Updated' : 'Assigned',
          detail: this.editMode() ? 'Allocation dates updated' : 'Project assigned successfully',
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err.error?.message || 'Failed to save allocation',
        });
      }
    });
  }

  confirmEndNow(a: Allocation) {
    this.confirmationService.confirm({
      message: `End <strong>${a.user_name}</strong>'s allocation to <strong>${a.project_name}</strong> today? It will stop appearing on their timesheet from tomorrow.`,
      header: 'End Allocation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        const today = this.toIso(new Date());
        this.tsService.updateAllocation(a.id, { end_date: today }).subscribe({
          next: () => {
            this.loadAllocations();
            this.messageService.add({ severity: 'warn', summary: 'Ended', detail: 'Allocation ends today' });
          }
        });
      }
    });
  }

  confirmDelete(a: Allocation) {
    if (!this.removeAllocationEnabled) {
      return;
    }
    this.confirmationService.confirm({
      message: `Remove <strong>${a.user_name}</strong>'s allocation to <strong>${a.project_name}</strong> entirely? This cannot be undone.`,
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tsService.deleteAllocation(a.id).subscribe({
          next: () => {
            this.loadAllocations();
            this.messageService.add({ severity: 'warn', summary: 'Removed', detail: 'Allocation removed' });
          }
        });
      }
    });
  }
}
