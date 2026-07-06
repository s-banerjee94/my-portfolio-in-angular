import { Routes } from '@angular/router';
import { DashboardComponent } from '@dashboard/dashboard.component';
import { HomeComponent } from '@public/home/home.component';
import { LoginComponent } from '@dashboard/login/login.component';
import { authGuard, noAuthGuard } from '@core/guards/auth.guard';
import { MessagesComponent } from '@dashboard/messages/messages.component';
import { PageNotFoundComponent } from '@public/page-not-found/page-not-found.component';
import { EditContentComponent } from '@dashboard/edit-content/edit-content.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Login',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard',
    children: [
      // /dashboard alone has nothing to show — land on the content editor.
      { path: '', redirectTo: 'edit-content', pathMatch: 'full' },
      {
        path: 'edit-content',
        component: EditContentComponent,
        title: 'Edit Content',
      },
      {
        path: 'messages',
        component: MessagesComponent,
        title: 'Messages',
      },
    ],
  },

  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Page Not Found',
  },
];
