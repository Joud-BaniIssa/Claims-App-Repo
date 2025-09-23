import { createAction, props } from '@ngrx/store';
import { 
  Claim, 
  ClaimFilters, 
  ClaimInitiationForm, 
  ClaimSubmissionResponse,
  Photo,
  Document 
} from '../../models/claims.model';

// Load Claims Actions
export const loadClaims = createAction(
  '[Claims] Load Claims',
  props<{ filters?: ClaimFilters; page?: number; refresh?: boolean }>()
);

export const loadClaimsSuccess = createAction(
  '[Claims] Load Claims Success',
  props<{ 
    claims: Claim[]; 
    total: number; 
    page: number; 
    hasMore: boolean;
    append?: boolean;
  }>()
);

export const loadClaimsFailure = createAction(
  '[Claims] Load Claims Failure',
  props<{ error: string }>()
);

// Individual Claim Actions
export const loadClaimDetails = createAction(
  '[Claims] Load Claim Details',
  props<{ claimId: string }>()
);

export const loadClaimDetailsSuccess = createAction(
  '[Claims] Load Claim Details Success',
  props<{ claim: Claim }>()
);

export const loadClaimDetailsFailure = createAction(
  '[Claims] Load Claim Details Failure',
  props<{ error: string }>()
);

// Create Claim Actions
export const createClaim = createAction(
  '[Claims] Create Claim',
  props<{ claimData: ClaimInitiationForm }>()
);

export const createClaimSuccess = createAction(
  '[Claims] Create Claim Success',
  props<{ response: ClaimSubmissionResponse }>()
);

export const createClaimFailure = createAction(
  '[Claims] Create Claim Failure',
  props<{ error: string }>()
);

// Update Claim Actions
export const updateClaim = createAction(
  '[Claims] Update Claim',
  props<{ claimId: string; updates: Partial<Claim> }>()
);

export const updateClaimSuccess = createAction(
  '[Claims] Update Claim Success',
  props<{ claim: Claim }>()
);

export const updateClaimFailure = createAction(
  '[Claims] Update Claim Failure',
  props<{ error: string }>()
);

// File Upload Actions
export const uploadPhoto = createAction(
  '[Claims] Upload Photo',
  props<{ claimId: string; photo: File; damageArea?: string }>()
);

export const uploadPhotoSuccess = createAction(
  '[Claims] Upload Photo Success',
  props<{ claimId: string; photo: Photo }>()
);

export const uploadPhotoFailure = createAction(
  '[Claims] Upload Photo Failure',
  props<{ error: string }>()
);

export const uploadDocument = createAction(
  '[Claims] Upload Document',
  props<{ claimId: string; document: File; documentType: string }>()
);

export const uploadDocumentSuccess = createAction(
  '[Claims] Upload Document Success',
  props<{ claimId: string; document: Document }>()
);

export const uploadDocumentFailure = createAction(
  '[Claims] Upload Document Failure',
  props<{ error: string }>()
);

// Filter and Search Actions
export const setFilters = createAction(
  '[Claims] Set Filters',
  props<{ filters: ClaimFilters }>()
);

export const clearFilters = createAction('[Claims] Clear Filters');

export const searchClaims = createAction(
  '[Claims] Search Claims',
  props<{ searchTerm: string }>()
);

// Draft Actions
export const saveDraft = createAction(
  '[Claims] Save Draft',
  props<{ draftData: Partial<ClaimInitiationForm> }>()
);

export const clearDraft = createAction('[Claims] Clear Draft');

export const loadDraft = createAction('[Claims] Load Draft');

// UI State Actions
export const setActiveClaim = createAction(
  '[Claims] Set Active Claim',
  props<{ claim: Claim }>()
);

export const clearActiveClaim = createAction('[Claims] Clear Active Claim');

export const setLoading = createAction(
  '[Claims] Set Loading',
  props<{ loading: boolean }>()
);

export const clearError = createAction('[Claims] Clear Error');

// Emergency Actions
export const flagAsEmergency = createAction(
  '[Claims] Flag As Emergency',
  props<{ claimId: string }>()
);

export const flagAsEmergencySuccess = createAction(
  '[Claims] Flag As Emergency Success',
  props<{ claimId: string }>()
);

export const flagAsEmergencyFailure = createAction(
  '[Claims] Flag As Emergency Failure',
  props<{ error: string }>()
);

// AI Analysis Actions
export const requestAIAnalysis = createAction(
  '[Claims] Request AI Analysis',
  props<{ claimId: string; photos: string[] }>()
);

export const aiAnalysisSuccess = createAction(
  '[Claims] AI Analysis Success',
  props<{ claimId: string; assessment: any }>()
);

export const aiAnalysisFailure = createAction(
  '[Claims] AI Analysis Failure',
  props<{ error: string }>()
);

// Cache Management
export const invalidateCache = createAction('[Claims] Invalidate Cache');

export const refreshClaims = createAction('[Claims] Refresh Claims');

// Pagination Actions
export const loadMoreClaims = createAction('[Claims] Load More Claims');

export const resetPagination = createAction('[Claims] Reset Pagination');
