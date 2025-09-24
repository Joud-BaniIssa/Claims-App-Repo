import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div [class]="containerClasses()">
      <div class="mx-auto w-full max-w-screen-sm">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Documents Vault</h1>
          <p class="text-gray-600">Securely store and access your important documents</p>
        </div>

        <!-- Upload Dropzone -->
        <div class="rounded-2xl border border-dashed border-gray-300 bg-white shadow-sm p-6 mb-6 text-center"
             [class.ring-2]="isDragging()" [class.ring-primary-100]="isDragging()"
             (drop)="onDrop($event)" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)">
          <div class="mx-auto mb-4 w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
            <mat-icon class="text-3xl text-gray-500">cloud_upload</mat-icon>
          </div>
          <h2 class="font-semibold text-gray-900">Upload New Document</h2>
          <p class="text-sm text-gray-600 mb-4">Drag and drop files here, or click to browse</p>

          <button mat-raised-button color="warn" (click)="fileInput.click()">
            <mat-icon>upload</mat-icon>
            <span class="ml-2">Choose Files</span>
          </button>
          <input #fileInput type="file" class="hidden" multiple (change)="onFileSelect($event)"
                 accept=".pdf,.png,.jpg,.jpeg,.heic,.webp,image/*" />

          <div class="mt-3 text-xs text-gray-500">Supported formats: PDF, JPG, PNG • Max file size: 10MB</div>

          <!-- Recently added preview -->
          <div *ngIf="recentFiles().length" class="mt-4 grid grid-cols-3 gap-2">
            <div *ngFor="let f of recentFiles()" class="bg-gray-50 rounded-xl p-2 text-[11px] text-gray-700 truncate">
              <mat-icon class="align-middle text-sm mr-1">insert_drive_file</mat-icon>{{ f.name }}
            </div>
          </div>
        </div>

        <!-- Category Shortcuts -->
        <div class="grid grid-cols-2 gap-4">
          <a routerLink="/documents" class="doc-tile">
            <div class="tile-icon"><mat-icon>description</mat-icon></div>
            <div>
              <div class="tile-title">Policy Docs</div>
              <div class="tile-sub">{{ counts.policy }} document</div>
            </div>
          </a>
          <a routerLink="/documents" class="doc-tile">
            <div class="tile-icon"><mat-icon>directions_car</mat-icon></div>
            <div>
              <div class="tile-title">Vehicle</div>
              <div class="tile-sub">{{ counts.vehicle }} document</div>
            </div>
          </a>
          <a routerLink="/documents" class="doc-tile">
            <div class="tile-icon"><mat-icon>badge</mat-icon></div>
            <div>
              <div class="tile-title">Personal</div>
              <div class="tile-sub">{{ counts.personal }} document</div>
            </div>
          </a>
          <a routerLink="/documents" class="doc-tile">
            <div class="tile-icon"><mat-icon>collections</mat-icon></div>
            <div>
              <div class="tile-title">Gallery</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doc-tile { @apply flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow no-underline; color: inherit; }
    .tile-icon { @apply w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700; }
    .tile-title { @apply font-medium text-gray-900; }
    .tile-sub { @apply text-xs text-gray-600; }
  `]
})
export class DocumentsComponent {
  protected responsiveService = inject(ResponsiveService);
  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50');

  counts = { policy: 1, vehicle: 1, personal: 1, claims: 2 };

  private dragging = signal(false);
  isDragging = computed(() => this.dragging());

  recentFiles = signal<{ name: string }[]>([]);

  onDragOver(event: DragEvent) { event.preventDefault(); this.dragging.set(true); }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.dragging.set(false); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    if (!event.dataTransfer) return;
    const files = Array.from(event.dataTransfer.files || []);
    this.pushRecent(files);
  }
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.pushRecent(files);
    input.value = '';
  }
  private pushRecent(files: File[]) {
    const mapped = files.slice(0, 6).map(f => ({ name: f.name }));
    this.recentFiles.set(mapped);
  }
}
