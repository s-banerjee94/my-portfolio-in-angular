import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './dashboard/login/login.component';
import { authGuard, noAuthGuard } from './guard/auth.guard';
import { MessagesComponent } from './dashboard/messages/messages.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EditContentComponent } from './dashboard/edit-content/edit-content.component';

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
      {
        path: 'edit-content',
        component: EditContentComponent,
      },
      {
        path: 'messages',
        component: MessagesComponent,
      },
    ],
  },

  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Page Not Found',
  },
];
