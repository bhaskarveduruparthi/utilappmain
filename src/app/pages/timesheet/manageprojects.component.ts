import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '../service/url.service';
import { Card } from "primeng/card";
 // ← adjust path if needed

interface Project {
  id?: number;
  project_code: string;
  project_name: string;
  customer_id: number | null;
  customer_name?: string;
  project_type: string;
  active: string;
}

interface Customer {
  id: number;
  customer_name: string;
  customer_code: string;
}

@Component({
  selector: 'app-manage-projects',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    SelectModule, TagModule, ToastModule, ConfirmDialogModule,
    TooltipModule, ToggleSwitchModule, IconFieldModule, InputIconModule,
    Card
],
  providers: [MessageService, ConfirmationService],
  template: `

    <p-card>
      <p-toast position="top-right" />
<p-confirmDialog />

<div class="mp-page">

  <!-- Header -->
  <div class="mp-header">
    <div>
      <h2 class="mp-title">Manage Projects</h2>
      <span class="mp-sub">Configure billable and internal projects for timesheet allocation</span>
    </div>
    <button pButton label="Add Project" icon="pi pi-plus"
      class="add-btn" (click)="openCreate()"></button>
  </div>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-num">{{ projects().length }}</span>
      <span class="stat-lbl">Total</span>
    </div>
    <div class="stat-sep"></div>
    <div class="stat-item">
      <span class="stat-num green">{{ activeCount() }}</span>
      <span class="stat-lbl">Active</span>
    </div>
    <div class="stat-sep"></div>
    @for (type of projectTypes; track type.value) {
      <div class="stat-item">
        <span class="stat-num" [style.color]="type.color">{{ typeCount(type.value) }}</span>
        <span class="stat-lbl">{{ type.label }}</span>
      </div>
      <div class="stat-sep"></div>
    }
  </div>

  <!-- Table -->
  <div class="mp-table-card">
    <p-table
      [value]="filteredProjects()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="15"
      [rowsPerPageOptions]="[10, 15, 25, 50]"
      styleClass="mp-table"
      sortField="project_name"
      [globalFilterFields]="['project_name','project_code','project_type','customer_name']"
      #dt
    >
      <ng-template pTemplate="caption">
        <div class="table-cap">
          <div class="type-filter-tabs">
            <button class="ftab" [class.active]="activeTypeFilter() === ''"
              (click)="activeTypeFilter.set('')">All</button>
            @for (t of projectTypes; track t.value) {
              <button class="ftab" [class.active]="activeTypeFilter() === t.value"
                (click)="activeTypeFilter.set(t.value)">{{ t.label }}</button>
            }
          </div>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText placeholder="Search projects..." [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilter()" class="search-input" />
          </p-iconfield>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr style="background: #EFF6FF; color: #1E40AF;">
          <th pSortableColumn="project_code" style="width:120px">
            Code <p-sortIcon field="project_code" />
          </th>
          <th pSortableColumn="project_name">
            Project Name <p-sortIcon field="project_name" />
          </th>
          <th pSortableColumn="customer_name">
            Customer <p-sortIcon field="customer_name" />
          </th>
          <th pSortableColumn="project_type" style="width:130px">
            Type <p-sortIcon field="project_type" />
          </th>
          <th style="width:90px; text-align:center">Active</th>
          <th style="width:110px; text-align:center">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-project>
        <tr [class.inactive-row]="project.active === 'N'">
          <td>
            <code class="proj-code">{{ project.project_code }}</code>
          </td>
          <td>
            <div class="proj-name-cell">
              <span class="proj-name">{{ project.project_name }}</span>
            </div>
          </td>
          <td>
            <span class="customer-name">{{ project.customer_name || '—' }}</span>
          </td>
          <td>
            <span class="type-pill type-{{ project.project_type?.toLowerCase() }}">
              {{ project.project_type }}
            </span>
          </td>
          <td style="text-align:center">
            <p-toggleswitch
              [ngModel]="project.active === 'Y'"
              (ngModelChange)="toggleActive(project, $event)"
            />
          </td>
          <td style="text-align:center">
            <button pButton icon="pi pi-pencil"
              class="p-button-text p-button-sm p-button-rounded edit-btn"
              pTooltip="Edit" tooltipPosition="top"
              (click)="openEdit(project)">
            </button>
            <button pButton icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-rounded p-button-danger delete-btn"
              pTooltip="Delete" tooltipPosition="top"
              (click)="confirmDelete(project)">
            </button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="pi pi-briefcase empty-icon"></i>
              <p>No projects found</p>
              <button pButton label="Add First Project" icon="pi pi-plus"
                class="p-button-outlined p-button-sm" (click)="openCreate()"></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Create / Edit Dialog -->
  <p-dialog
    [header]="editMode() ? 'Edit Project' : 'Add New Project'"
    [(visible)]="dialogVisible"
    [modal]="true"
    [style]="{ width: '620px' }"
    [draggable]="false"
    styleClass="mp-dialog"
  >
    <form [formGroup]="projectForm" class="proj-form">

      <div class="form-row">
        <div class="form-field">
          <label>Project Code <span class="req">*</span></label>
          <input pInputText formControlName="project_code"
            placeholder="e.g. JK-SAP-001"
            [class.ng-invalid]="isInvalid('project_code')" />
          @if (isInvalid('project_code')) {
            <span class="field-error">Project code is required</span>
          }
        </div>
        <div class="form-field flex-2">
          <label>Project Name <span class="req">*</span></label>
          <input pInputText formControlName="project_name"
            placeholder="e.g. JK Cement SAP Implementation"
            [class.ng-invalid]="isInvalid('project_name')" />
          @if (isInvalid('project_name')) {
            <span class="field-error">Project name is required</span>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="form-field flex-2">
          <label>Customer</label>
          <p-select
            formControlName="customer_id"
            [options]="customerOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select customer (optional)"
            [filter]="true"
            filterBy="label"
            [showClear]="true"
          />
        </div>
        <div class="form-field">
          <label>Project Type <span class="req">*</span></label>
          <p-select
            formControlName="project_type"
            [options]="projectTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            [class.ng-invalid]="isInvalid('project_type')"
          />
          @if (isInvalid('project_type')) {
            <span class="field-error">Type is required</span>
          }
        </div>
      </div>

      <!-- Type info hint -->
      @if (projectForm.get('project_type')?.value) {
        <div class="type-hint" [class]="'hint-' + projectForm.get('project_type')?.value?.toLowerCase()">
          <i class="pi pi-info-circle"></i>
          {{ typeHints[projectForm.get('project_type')?.value] }}
        </div>
      }

    </form>

    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times"
        class="p-button-text p-button-secondary"
        (click)="dialogVisible = false"></button>
      <button pButton [label]="editMode() ? 'Update Project' : 'Create Project'"
        icon="pi pi-check"
        [loading]="saving()"
        [disabled]="projectForm.invalid"
        class="save-btn"
        (click)="saveProject()"></button>
    </ng-template>
  </p-dialog>

</div>
    </p-card>

  `,
  styles: [`
    .mp-page { padding: 1.5rem 2rem; max-width: 1500px; margin: 0 auto; }

    .mp-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
    }
    .mp-title { font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem; }
    .mp-sub { font-size: 0.95rem; color: #6B7280; }
    .add-btn { background: #1E3A5F !important; border-color: #1E3A5F !important; font-weight: 600; }

    /* Stats */
    .stats-bar {
      display: flex; align-items: center; gap: 0;
      background: white; border: 1px solid #E5E7EB; border-radius: 10px;
      padding: 1.2rem 2rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.25rem;
    }
    .stat-item { text-align: center; padding: 0 1rem; }
    .stat-num { display: block; font-size: 1.6rem; font-weight: 800; color: #111827; line-height: 1; }
    .stat-num.green { color: #16A34A; }
    .stat-lbl { font-size: 0.8rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-sep { width: 1px; height: 32px; background: #E5E7EB; }

    /* Table card */
    .mp-table-card {
      background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;
    }

    .table-cap {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 0.75rem;
    }

    .type-filter-tabs { display: flex; gap: 4px; }
    .ftab {
      border: 1px solid #E5E7EB; background: white; border-radius: 20px;
      padding: 6px 18px; font-size: 0.9rem; font-weight: 500; color: #6B7280;
      cursor: pointer; transition: all 0.15s;
    }
    .ftab:hover { border-color: #1E3A5F; color: #1E3A5F; }
    .ftab.active { background: #1E3A5F; border-color: #1E3A5F; color: white; font-weight: 600; }

    .search-input { font-size: 0.95rem !important; width: 280px; }

    .proj-code {
      font-family: 'Courier New', monospace; font-size: 0.9rem;
      background: #F3F4F6; padding: 3px 8px; border-radius: 4px; color: #374151;
    }
    .proj-name { font-weight: 600; color: #111827; font-size: 1rem; }
    .customer-name { font-size: 0.95rem; color: #374151; }

    .type-pill {
      font-size: 0.7rem; font-weight: 700; padding: 3px 10px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .type-billable { background: #DCFCE7; color: #166534; }
    .type-internal { background: #DBEAFE; color: #1E40AF; }
    .type-leave { background: #FEF3C7; color: #92400E; }
    .type-pmo { background: #F3E8FF; color: #7E22CE; }

    .inactive-row td { opacity: 0.5; }
    .edit-btn { color: #4F46E5 !important; }
    .delete-btn:hover { background: #FEF2F2 !important; }

    .empty-state {
      text-align: center; padding: 3rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    }
    .empty-icon { font-size: 2.5rem; color: #D1D5DB; }
    .empty-state p { color: #6B7280; font-size: 0.9rem; margin: 0; }

    /* Form */
    .proj-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.25rem 0; }
    .form-row { display: flex; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
    .form-field.flex-2 { flex: 2; }
    .form-field label { font-size: 0.78rem; font-weight: 600; color: #374151; }
    .req { color: #EF4444; }
    .field-error { font-size: 0.72rem; color: #DC2626; }

    .type-hint {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.78rem; padding: 0.6rem 0.875rem; border-radius: 8px;
    }
    .hint-billable { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
    .hint-internal { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
    .hint-leave { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
    .hint-pmo { background: #FAF5FF; color: #7E22CE; border: 1px solid #E9D5FF; }

    .save-btn { background: #1E3A5F !important; border-color: #1E3A5F !important; }

    ::ng-deep .mp-table .p-datatable-tbody > tr > td { padding: 1rem 1rem; }
    ::ng-deep .mp-table .p-datatable-thead > tr > th { background: #F8FAFC; padding: 1rem; font-size: 0.95rem; }
  `]
})
export class ManageProjectsComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  editMode = signal(false);
  dialogVisible = false;
  searchTerm = '';
  activeTypeFilter = signal('');

  projects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  customers = signal<Customer[]>([]);

  customerOptions: { label: string; value: number }[] = [];

  projectTypes = [
    { label: 'Billable', value: 'Billable', color: '#16A34A' },
  ];

  projectTypeOptions = this.projectTypes.map(t => ({ label: t.label, value: t.value }));

  typeHints: Record<string, string> = {
    Billable: 'Hours logged here count as billable utilization for clients.',
    Internal: 'Internal projects like R&D, training, or bench activities.',
    Leave: 'Leave/holiday tracking — maps to absence management.',
    PMO: 'Project Management Office / administrative activities.',
  };

  editingId: number | null = null;
  private apiBase: string;  // ← computed once from UrlService

  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private urlService: UrlService,             // ← injected
  ) {
    // getApiUrl() returns "protocol://host/" — strip the trailing slash
    this.apiBase = this.urlService.getApiUrl().replace(/\/$/, '');

    this.projectForm = this.fb.group({
      project_code: ['', [Validators.required, Validators.maxLength(50)]],
      project_name: ['', [Validators.required, Validators.maxLength(200)]],
      customer_id: [null],
      project_type: ['Billable', Validators.required],
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.loadCustomers();
  }

  loadProjects() {
    this.loading.set(true);
    this.http.get<Project[]>(`${this.apiBase}/timesheet/projects?include_inactive=true`).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCustomers() {
    // getallcustomers is paginated (10/page) — use the unpaginated
    // "records" endpoint so the dropdown lists every customer.
    this.http.get<{ data: Customer[] }>(`${this.apiBase}/customers/getallcustomersrecords`).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.customers.set(data);
        this.customerOptions = data
          .map(c => ({ label: c.customer_name, value: c.id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }
    });
  }

  applyFilter() {
    let result = this.projects();
    if (this.activeTypeFilter()) {
      result = result.filter(p => p.project_type === this.activeTypeFilter());
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.project_name.toLowerCase().includes(term) ||
        p.project_code.toLowerCase().includes(term) ||
        (p.customer_name || '').toLowerCase().includes(term)
      );
    }
    this.filteredProjects.set(result);
  }

  activeCount() { return this.projects().filter(p => p.active === 'Y').length; }
  typeCount(type: string) { return this.projects().filter(p => p.project_type === type).length; }

  isInvalid(field: string) {
    const ctrl = this.projectForm.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  openCreate() {
    this.editMode.set(false);
    this.editingId = null;
    this.projectForm.reset({ project_type: 'Billable' });
    this.dialogVisible = true;
  }

  openEdit(project: Project) {
    this.editMode.set(true);
    this.editingId = project.id ?? null;
    this.projectForm.patchValue({
      project_code: project.project_code,
      project_name: project.project_name,
      customer_id: project.customer_id,
      project_type: project.project_type,
    });
    this.dialogVisible = true;
  }

  saveProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.projectForm.value;

    const req = this.editMode()
      ? this.http.put(`${this.apiBase}/timesheet/projects/${this.editingId}`, payload)
      : this.http.post(`${this.apiBase}/timesheet/createproject`, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible = false;
        this.loadProjects();
        this.messageService.add({
          severity: 'success',
          summary: this.editMode() ? 'Updated' : 'Created',
          detail: `Project ${this.editMode() ? 'updated' : 'created'} successfully`,
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err.error?.message || 'Failed to save project',
        });
      }
    });
  }

  toggleActive(project: Project, active: boolean) {
    this.http.put(`${this.apiBase}/timesheet/projects/${project.id}`, {
      ...project, active: active ? 'Y' : 'N'
    }).subscribe({
      next: () => {
        this.projects.update(list =>
          list.map(p => p.id === project.id ? { ...p, active: active ? 'Y' : 'N' } : p)
        );
        this.applyFilter();
      }
    });
  }

  confirmDelete(project: Project) {
    this.confirmationService.confirm({
      message: `Delete project "<strong>${project.project_name}</strong>"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.http.put(`${this.apiBase}/timesheet/projects/${project.id}`, { active: 'N' }).subscribe({
          next: () => {
            this.loadProjects();
            this.messageService.add({ severity: 'warn', summary: 'Deactivated', detail: 'Project has been deactivated' });
          }
        });
      }
    });
  }
}