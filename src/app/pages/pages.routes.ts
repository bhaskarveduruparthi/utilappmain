import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { LoginHistory } from './loginhistory/loginhistory';
import { ManageCustomers } from './managecustomers/managecustomers';
import { SubmitTimesheetComponent } from './timesheet/submittimesheet.component';
import { ReportsComponent } from './timesheet/reports.component';
import { TeamTimesheetsComponent } from './timesheet/teamtimesheets.component';

export default [
    { path: 'manageusers', component: ManageUsers, title: 'Manage Users' },
    { path: 'managecustomers', component: ManageCustomers, title: 'Manage Customers' },
    { path: 'login-history', component: LoginHistory, title: 'Login History' },
    { path: 'timesheet', component: SubmitTimesheetComponent, title: 'Submit Timesheet' },
    {path: 'manage-projects', loadComponent: () => import('./timesheet/manageprojects.component').then(m => m.ManageProjectsComponent), title: 'Manage Projects' },
    {path: 'timesheet/history', loadComponent: () => import('./timesheet/timesheethistory.component').then(m => m.TimesheetHistoryComponent), title: 'Timesheet History' },
    { path: 'reports', component: ReportsComponent, title: 'Utilization Reports' },
    { path: 'team', component: TeamTimesheetsComponent, title: 'Team Timesheets' },
    
    { path: '**', redirectTo: '/notfound' }
] as Routes;