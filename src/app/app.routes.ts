import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClaimsListComponent } from './features/claims/claims-list.component';
import { ClaimsNewComponent } from './features/claims/claims-new.component';
import { ProfileComponent } from './features/profile/profile.component';
import { WorkshopComponent } from './features/workshop/workshop.component';
import { SettingsComponent } from './features/profile/settings.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { DocumentsComponent } from './features/documents/documents.component';

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
    path: 'profile',
    component: ProfileComponent,
    title: 'Profile - InsuranceAI'
  },
  {
    path: 'workshop',
    component: WorkshopComponent,
    title: 'Workshop - InsuranceAI'
  },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'Settings - InsuranceAI'
  },
  {
    path: 'documents',
    component: DocumentsComponent,
    title: 'Document Vault - InsuranceAI'
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    title: 'Notifications - InsuranceAI'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
