import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { of, EMPTY } from 'rxjs';
import { 
  map, 
  mergeMap, 
  catchError, 
  withLatestFrom,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';

import * as ClaimsActions from './claims.actions';
import { selectClaimsFilters, selectClaimsPagination } from './claims.selectors';
import { 
  ClaimsResponse, 
  Claim, 
  ClaimSubmissionResponse,
  ClaimInitiationForm 
} from '../../models/claims.model';

@Injectable()
export class ClaimsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);

  // Load Claims Effect
  loadClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.loadClaims),
      withLatestFrom(
        this.store.select(selectClaimsFilters),
        this.store.select(selectClaimsPagination)
      ),
      switchMap(([action, filters, pagination]) => {
        const params: any = {
          page: action.page || pagination.page,
          limit: pagination.limit
        };

        // Convert filters to HTTP-compatible params
        if (filters.status) params.status = filters.status.join(',');
        if (filters.type) params.type = filters.type.join(',');
        if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
        if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();
        if (filters.amountMin) params.amountMin = filters.amountMin.toString();
        if (filters.amountMax) params.amountMax = filters.amountMax.toString();
        if (filters.searchTerm) params.searchTerm = filters.searchTerm;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;

        // Request text to robustly handle non-JSON or empty responses
        return this.http.get('/api/claims', { params, responseType: 'text' as 'json' }).pipe(
          map(raw => {
            const page = Number(params.page) || 1;
            const limit = Number(params.limit) || 10;
            let parsed: ClaimsResponse | null = null;
            try {
              parsed = typeof raw === 'string' ? JSON.parse(raw as unknown as string) : (raw as unknown as ClaimsResponse);
            } catch {
              parsed = null;
            }
            const response: ClaimsResponse = parsed && Array.isArray((parsed as any).claims)
              ? parsed
              : { claims: [], total: 0, page, limit, hasMore: false } as ClaimsResponse;

            return ClaimsActions.loadClaimsSuccess({
              claims: response.claims,
              total: response.total,
              page: response.page,
              hasMore: response.hasMore,
              append: action.page ? action.page > 1 : false
            });
          }),
          catchError(error =>
            of(ClaimsActions.loadClaimsFailure({
              error: error.message || 'Failed to load claims'
            }))
          )
        );
      })
    )
  );

  // Load Claim Details Effect
  loadClaimDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.loadClaimDetails),
      switchMap(action =>
        this.http.get<Claim>(`/api/claims/${action.claimId}`).pipe(
          map(claim => ClaimsActions.loadClaimDetailsSuccess({ claim })),
          catchError(error =>
            of(ClaimsActions.loadClaimDetailsFailure({ 
              error: error.message || 'Failed to load claim details' 
            }))
          )
        )
      )
    )
  );

  // Create Claim Effect
  createClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.createClaim),
      switchMap(action =>
        this.http.post<ClaimSubmissionResponse>('/api/claims', action.claimData).pipe(
          map(response => ClaimsActions.createClaimSuccess({ response })),
          catchError(error =>
            of(ClaimsActions.createClaimFailure({ 
              error: error.message || 'Failed to create claim' 
            }))
          )
        )
      )
    )
  );

  // Update Claim Effect
  updateClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.updateClaim),
      switchMap(action =>
        this.http.put<Claim>(`/api/claims/${action.claimId}`, action.updates).pipe(
          map(claim => ClaimsActions.updateClaimSuccess({ claim })),
          catchError(error =>
            of(ClaimsActions.updateClaimFailure({ 
              error: error.message || 'Failed to update claim' 
            }))
          )
        )
      )
    )
  );

  // Upload Photo Effect
  uploadPhoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.uploadPhoto),
      switchMap(action => {
        const formData = new FormData();
        formData.append('photo', action.photo);
        if (action.damageArea) {
          formData.append('damageArea', action.damageArea);
        }

        return this.http.post<any>(`/api/claims/${action.claimId}/photos`, formData).pipe(
          map(response => ClaimsActions.uploadPhotoSuccess({ 
            claimId: action.claimId, 
            photo: response.photo 
          })),
          catchError(error =>
            of(ClaimsActions.uploadPhotoFailure({ 
              error: error.message || 'Failed to upload photo' 
            }))
          )
        );
      })
    )
  );

  // Upload Document Effect
  uploadDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.uploadDocument),
      switchMap(action => {
        const formData = new FormData();
        formData.append('document', action.document);
        formData.append('documentType', action.documentType);

        return this.http.post<any>(`/api/claims/${action.claimId}/documents`, formData).pipe(
          map(response => ClaimsActions.uploadDocumentSuccess({ 
            claimId: action.claimId, 
            document: response.document 
          })),
          catchError(error =>
            of(ClaimsActions.uploadDocumentFailure({ 
              error: error.message || 'Failed to upload document' 
            }))
          )
        );
      })
    )
  );

  // Search Claims Effect (with debounce)
  searchClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.searchClaims),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(action =>
        this.http.get('/api/claims/search', {
          params: { q: action.searchTerm },
          responseType: 'text' as 'json'
        }).pipe(
          map(raw => {
            let parsed: ClaimsResponse | null = null;
            try {
              parsed = typeof raw === 'string' ? JSON.parse(raw as unknown as string) : (raw as unknown as ClaimsResponse);
            } catch {
              parsed = null;
            }
            const response: ClaimsResponse = parsed && Array.isArray((parsed as any).claims)
              ? parsed
              : { claims: [], total: 0, page: 1, limit: 10, hasMore: false } as ClaimsResponse;
            return ClaimsActions.loadClaimsSuccess({
              claims: response.claims,
              total: response.total,
              page: 1,
              hasMore: response.hasMore
            });
          }),
          catchError(error =>
            of(ClaimsActions.loadClaimsFailure({
              error: error.message || 'Search failed'
            }))
          )
        )
      )
    )
  );

  // Flag as Emergency Effect
  flagAsEmergency$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.flagAsEmergency),
      switchMap(action =>
        this.http.patch(`/api/claims/${action.claimId}/emergency`, { emergency: true }).pipe(
          map(() => ClaimsActions.flagAsEmergencySuccess({ claimId: action.claimId })),
          catchError(error =>
            of(ClaimsActions.flagAsEmergencyFailure({ 
              error: error.message || 'Failed to flag as emergency' 
            }))
          )
        )
      )
    )
  );

  // AI Analysis Effect
  requestAIAnalysis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.requestAIAnalysis),
      switchMap(action =>
        this.http.post(`/api/claims/${action.claimId}/ai-analysis`, {
          photos: action.photos
        }).pipe(
          map(response => ClaimsActions.aiAnalysisSuccess({ 
            claimId: action.claimId, 
            assessment: response 
          })),
          catchError(error =>
            of(ClaimsActions.aiAnalysisFailure({ 
              error: error.message || 'AI analysis failed' 
            }))
          )
        )
      )
    )
  );

  // Refresh Claims Effect
  refreshClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.refreshClaims),
      map(() => ClaimsActions.loadClaims({ refresh: true }))
    )
  );

  // Load More Claims Effect
  loadMoreClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.loadMoreClaims),
      withLatestFrom(this.store.select(selectClaimsPagination)),
      map(([action, pagination]) => 
        ClaimsActions.loadClaims({ page: pagination.page + 1 })
      )
    )
  );

  // Auto-save Draft Effect
  saveDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.saveDraft),
      debounceTime(1000), // Auto-save after 1 second of inactivity
      tap(action => {
        // Save to local storage
        localStorage.setItem('claimDraft', JSON.stringify(action.draftData));
      })
    ), { dispatch: false }
  );

  // Load Draft Effect
  loadDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.loadDraft),
      map(() => {
        const draftData = localStorage.getItem('claimDraft');
        if (draftData) {
          return ClaimsActions.saveDraft({ 
            draftData: JSON.parse(draftData) 
          });
        }
        return { type: 'NO_ACTION' };
      })
    )
  );

  // Clear Draft Effect
  clearDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.clearDraft),
      tap(() => {
        localStorage.removeItem('claimDraft');
      })
    ), { dispatch: false }
  );

  // Success Effects for UI feedback
  createClaimSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.createClaimSuccess),
      tap(action => {
        // Could trigger toast notification or navigation
        console.log('Claim created successfully:', action.response);
      })
    ), { dispatch: false }
  );

  uploadSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClaimsActions.uploadPhotoSuccess, ClaimsActions.uploadDocumentSuccess),
      tap(() => {
        // Could trigger toast notification
        console.log('Upload completed successfully');
      })
    ), { dispatch: false }
  );

  // Error Effects for UI feedback
  errorEffects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ClaimsActions.loadClaimsFailure,
        ClaimsActions.createClaimFailure,
        ClaimsActions.updateClaimFailure,
        ClaimsActions.uploadPhotoFailure,
        ClaimsActions.uploadDocumentFailure
      ),
      tap(action => {
        // Could trigger error toast or notification
        console.error('Claims error:', action.error);
      })
    ), { dispatch: false }
  );
}
