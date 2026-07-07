import { Routes } from '@angular/router';
import { HomeComponent } from '@public/home/home.component';
import { authGuard, noAuthGuard } from '@core/guards/auth.guard';

// Only the public home page loads eagerly — the admin dashboard, login and
// 404 are lazy chunks so visitors never download the CMS code.
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'login',
    loadComponent: () =>
      import('@dashboard/login/login.component').then((m) => m.LoginComponent),
    canActivate: [noAuthGuard],
    title: 'Login',
  },
  // Old bookmarks/muscle memory: the admin used to live at /dashboard.
  { path: 'dashboard', redirectTo: 'admin' },
  {
    path: 'admin',
    loadComponent: () =>
      import('@dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
    title: 'Dashboard',
    children: [
      // Land on the traffic overview — the "what happened since I last looked" page.
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      {
        path: 'analytics',
        loadComponent: () =>
          import('@dashboard/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent,
          ),
        title: 'Analytics',
      },
      {
        path: 'edit-content',
        loadComponent: () =>
          import('@dashboard/edit-content/edit-content.component').then(
            (m) => m.EditContentComponent,
          ),
        title: 'Edit Content',
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('@dashboard/messages/messages.component').then(
            (m) => m.MessagesComponent,
          ),
        title: 'Messages',
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('@public/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    title: 'Page Not Found',
  },
];
