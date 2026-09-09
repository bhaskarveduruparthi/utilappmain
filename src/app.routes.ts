import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from '@/helper/auth-guard';
import { DashboardComponent } from '@/pages/dashboard/dashboard.component';

export const appRoutes: Routes = [
    // Redirect root to auth/login
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

    // Auth module (user will land here first)
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

    // Main app routes under /app
    {
        path: 'app',
        component: AppLayout,
        children: [
            { path: '', component: DashboardComponent, title: 'RUT - Dashboard' },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ], 
        canActivate: [AuthGuard]
    },

    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
