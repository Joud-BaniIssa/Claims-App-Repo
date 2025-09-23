import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClaimsListComponent } from './features/claims/claims-list.component';
import { ClaimsNewComponent } from './features/claims/claims-new.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard - InsuranceAI'
  },
  {
    path: 'claims',
    component: ClaimsListComponent,
    title: 'Claims - InsuranceAI'
  },
  {
    path: 'claims/new',
    component: ClaimsNewComponent,
    title: 'New Claim - InsuranceAI'
  },
  {
    path: 'documents',
    component: DocumentsComponent,
    title: 'Documents - InsuranceAI'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Profile - InsuranceAI'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
