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
      // /admin alone has nothing to show — land on the content editor.
      { path: '', redirectTo: 'edit-content', pathMatch: 'full' },
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
