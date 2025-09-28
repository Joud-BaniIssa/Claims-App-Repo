import { createReducer, on } from '@ngrx/store';
import { ClaimsState, initialClaimsState } from './claims.state';
import * as ClaimsActions from './claims.actions';
import { Claim } from '../../models/claims.model';

export const claimsReducer = createReducer(
  initialClaimsState,

  // Load Claims
  on(ClaimsActions.loadClaims, (state, { page, refresh }) => ({
    ...state,
    loading: true,
    error: null,
    page: page || state.page,
    ...(refresh && { claims: [], page: 1 })
  })),

  on(ClaimsActions.loadClaimsSuccess, (state, { claims, total, page, hasMore, append }) => ({
    ...state,
    claims: append ? [...state.claims, ...claims] : claims,
    total,
    page,
    hasMore,
    loading: false,
    error: null,
    lastFetch: Date.now(),
    cacheValid: true
  })),

  on(ClaimsActions.loadClaimsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    cacheValid: false
  })),

  // Load Claim Details
  on(ClaimsActions.loadClaimDetails, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ClaimsActions.loadClaimDetailsSuccess, (state, { claim }) => ({
    ...state,
    activeClaim: claim,
    loading: false,
    error: null,
    // Update claim in list if it exists
    claims: state.claims.map(c => c.id === claim.id ? claim : c)
  })),

  on(ClaimsActions.loadClaimDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Claim
  on(ClaimsActions.createClaim, (state) => ({
    ...state,
    submitting: true,
    error: null
  })),

  on(ClaimsActions.createClaimSuccess, (state, { response }) => {
    const now = new Date();
    const newClaim: Claim = {
      id: response.claimId || String(Date.now()),
      claimNumber: response.claimNumber || `CLA-${String(state.total + 1).padStart(4, '0')}`,
      policyNumber: 'POLICY-TEMP',
      status: 'submitted',
      type: 'other',
      dateReported: now,
      dateOfIncident: now,
      location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: response.message || 'New claim submitted',
      documents: [],
      photos: [],
      timeline: [],
      deductible: 0,
      createdAt: now,
      updatedAt: now
    };

    return {
      ...state,
      submitting: false,
      error: null,
      draftClaim: null,
      claims: [newClaim, ...state.claims],
      total: state.total + 1,
      cacheValid: true
    };
  }),

  on(ClaimsActions.createClaimFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error
  })),

  // Update Claim
  on(ClaimsActions.updateClaim, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ClaimsActions.updateClaimSuccess, (state, { claim }) => ({
    ...state,
    loading: false,
    error: null,
    claims: state.claims.map(c => c.id === claim.id ? claim : c),
    activeClaim: state.activeClaim?.id === claim.id ? claim : state.activeClaim
  })),

  on(ClaimsActions.updateClaimFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Photo Upload
  on(ClaimsActions.uploadPhoto, (state) => ({
    ...state,
    uploading: true,
    error: null
  })),

  on(ClaimsActions.uploadPhotoSuccess, (state, { claimId, photo }) => ({
    ...state,
    uploading: false,
    error: null,
    claims: state.claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, photos: [...claim.photos, photo] }
        : claim
    ),
    activeClaim: state.activeClaim?.id === claimId 
      ? { ...state.activeClaim, photos: [...state.activeClaim.photos, photo] }
      : state.activeClaim
  })),

  on(ClaimsActions.uploadPhotoFailure, (state, { error }) => ({
    ...state,
    uploading: false,
    error
  })),

  // Document Upload
  on(ClaimsActions.uploadDocument, (state) => ({
    ...state,
    uploading: true,
    error: null
  })),

  on(ClaimsActions.uploadDocumentSuccess, (state, { claimId, document }) => ({
    ...state,
    uploading: false,
    error: null,
    claims: state.claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, documents: [...claim.documents, document] }
        : claim
    ),
    activeClaim: state.activeClaim?.id === claimId 
      ? { ...state.activeClaim, documents: [...state.activeClaim.documents, document] }
      : state.activeClaim
  })),

  on(ClaimsActions.uploadDocumentFailure, (state, { error }) => ({
    ...state,
    uploading: false,
    error
  })),

  // Filters and Search
  on(ClaimsActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    page: 1, // Reset pagination when filters change
    cacheValid: false // Invalidate cache
  })),

  on(ClaimsActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    page: 1,
    cacheValid: false
  })),

  on(ClaimsActions.searchClaims, (state, { searchTerm }) => ({
    ...state,
    filters: { ...state.filters, searchTerm },
    page: 1,
    loading: true,
    cacheValid: false
  })),

  // Draft Management
  on(ClaimsActions.saveDraft, (state, { draftData }) => ({
    ...state,
    draftClaim: { ...state.draftClaim, ...draftData }
  })),

  on(ClaimsActions.clearDraft, (state) => ({
    ...state,
    draftClaim: null
  })),

  // UI State Management
  on(ClaimsActions.setActiveClaim, (state, { claim }) => ({
    ...state,
    activeClaim: claim
  })),

  on(ClaimsActions.clearActiveClaim, (state) => ({
    ...state,
    activeClaim: null
  })),

  on(ClaimsActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(ClaimsActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  // Emergency Actions
  on(ClaimsActions.flagAsEmergency, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ClaimsActions.flagAsEmergencySuccess, (state, { claimId }) => ({
    ...state,
    loading: false,
    error: null,
    claims: state.claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, emergencyFlag: true }
        : claim
    ),
    activeClaim: state.activeClaim?.id === claimId 
      ? { ...state.activeClaim, emergencyFlag: true }
      : state.activeClaim
  })),

  on(ClaimsActions.flagAsEmergencyFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // AI Analysis
  on(ClaimsActions.requestAIAnalysis, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ClaimsActions.aiAnalysisSuccess, (state, { claimId, assessment }) => ({
    ...state,
    loading: false,
    error: null,
    claims: state.claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, aiAssessment: assessment }
        : claim
    ),
    activeClaim: state.activeClaim?.id === claimId 
      ? { ...state.activeClaim, aiAssessment: assessment }
      : state.activeClaim
  })),

  on(ClaimsActions.aiAnalysisFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cache Management
  on(ClaimsActions.invalidateCache, (state) => ({
    ...state,
    cacheValid: false,
    lastFetch: null
  })),

  on(ClaimsActions.refreshClaims, (state) => ({
    ...state,
    loading: true,
    page: 1,
    cacheValid: false
  })),

  // Pagination
  on(ClaimsActions.loadMoreClaims, (state) => ({
    ...state,
    page: state.page + 1,
    loading: true
  })),

  on(ClaimsActions.resetPagination, (state) => ({
    ...state,
    page: 1,
    hasMore: false,
    claims: []
  }))
);
