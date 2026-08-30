import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { User } from '@/pages/service/manageadmins.service';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '@/pages/service/authentication.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of display_menu; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`
})
export class AppMenu implements OnInit {

    admin_menu: MenuItem[] = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }
            ]
        },
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Employee Master', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/manageusers'] },
                { label: 'Customer Master', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/managecustomers'] },
                
            ]
        },
        {
            label: 'Timesheet',
            icon: 'pi pi-fw pi-calendar',
            items: [
                { label: 'Manage Projects', icon: 'pi pi-fw pi-folder', routerLink: ['/app/pages/manage-projects'] },
                { label: 'Project Allocations', icon: 'pi pi-fw pi-user-plus', routerLink: ['/app/pages/project-allocations'] },
                { label: 'Validate Timesheets', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/team'] },
                { label: 'Submit Timesheet', icon: 'pi pi-fw pi-plus', routerLink: ['/app/pages/timesheet'] },
                { label: 'Timesheet History', icon: 'pi pi-fw pi-clock', routerLink: ['/app/pages/timesheet/history'] }
            ]
        },
        {
            label: 'Reports',
            icon: 'pi pi-fw pi-file',
            items: [
                { label: 'Utilization Reports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/pages/reports'] }
            ]
        },
        {
            label: 'Logs',
            items: [
                { label: 'Login History', icon: 'pi pi-fw pi-history', routerLink: ['/app/pages/login-history'] }
            ]
        }
    ];

    user_menu: MenuItem[] = [
        
        {
            label: 'Timesheet',
            icon: 'pi pi-fw pi-calendar',
            items: [
                { label: 'Submit Timesheet', icon: 'pi pi-fw pi-plus', routerLink: ['/app/pages/timesheet'] },
                { label: 'Timesheet History', icon: 'pi pi-fw pi-clock', routerLink: ['/app/pages/timesheet/history'] }
            ]
        },
        
    ];

    manager_menu: MenuItem[] = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }
            ]
        },
        {
            label: 'Manager',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                
                
                { label: 'Manage Projects', icon: 'pi pi-fw pi-folder', routerLink: ['/app/pages/manage-projects'] },
                { label: 'Project Allocations', icon: 'pi pi-fw pi-user-plus', routerLink: ['/app/pages/project-allocations'] },
                { label: 'Validate Timesheets', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/team'] },
            ]
        },
        {
            label: 'Timesheet',
            icon: 'pi pi-fw pi-calendar',
            items: [
                { label: 'Submit Timesheet', icon: 'pi pi-fw pi-plus', routerLink: ['/app/pages/timesheet'] },
                { label: 'Timesheet History', icon: 'pi pi-fw pi-clock', routerLink: ['/app/pages/timesheet/history'] }
            ]
        },
        {
            label: 'Reports',
            icon: 'pi pi-fw pi-file',
            items: [
                { label: 'Utilization Reports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/pages/reports'] }
            ]
        }
    ];

    display_menu: MenuItem[] = [];
    user: User | null = null;

    constructor(public layoutService: LayoutService, private authenticationService: AuthenticationService) {}

    ngOnInit() {
        this.authenticationService.user.subscribe(user => {
            this.user = user;
            if (user?.type === 'Superadmin') {
                this.display_menu = this.admin_menu;
            } else if (user?.type === 'manager') {
                this.display_menu = this.manager_menu;
            } else {
                this.display_menu = this.user_menu;
            }
        });
    }
}