import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './dashboard/login/login.component';
import { authGuard, noAuthGuard } from './guard/auth.guard';
import { MessagesComponent } from './dashboard/messages/messages.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

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
  },
  {
    path: 'messages',
    component: MessagesComponent,
    canActivate: [authGuard],
    title: 'Messages',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Page Not Found',
  },
];
