import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClaimsState } from './claims.state';
import { Claim, ClaimStatus } from '../../models/claims.model';

// Feature selector
export const selectClaimsState = createFeatureSelector<ClaimsState>('claims');

// Basic selectors
export const selectAllClaims = createSelector(
  selectClaimsState,
  (state) => state.claims
);

export const selectActiveClaim = createSelector(
  selectClaimsState,
  (state) => state.activeClaim
);

export const selectClaimsLoading = createSelector(
  selectClaimsState,
  (state) => state.loading
);

export const selectClaimsSubmitting = createSelector(
  selectClaimsState,
  (state) => state.submitting
);

export const selectClaimsUploading = createSelector(
  selectClaimsState,
  (state) => state.uploading
);

export const selectClaimsError = createSelector(
  selectClaimsState,
  (state) => state.error
);

export const selectClaimsFilters = createSelector(
  selectClaimsState,
  (state) => state.filters
);

export const selectClaimsDraft = createSelector(
  selectClaimsState,
  (state) => state.draftClaim
);

// Pagination selectors
export const selectClaimsPagination = createSelector(
  selectClaimsState,
  (state) => ({
    page: state.page,
    limit: state.limit,
    total: state.total,
    hasMore: state.hasMore
  })
);

// Computed selectors
export const selectRecentClaims = createSelector(
  selectAllClaims,
  (claims) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return claims
      .filter(claim => new Date(claim.dateReported) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())
      .slice(0, 5);
  }
);

export const selectPendingClaims = createSelector(
  selectAllClaims,
  (claims) => claims.filter(claim => 
    ['submitted', 'under_review', 'investigating', 'awaiting_documentation', 'processing'].includes(claim.status)
  )
);

export const selectActiveClaims = createSelector(
  selectAllClaims,
  (claims) => claims.filter(claim => 
    !['approved', 'rejected', 'closed'].includes(claim.status)
  )
);

export const selectEmergencyClaims = createSelector(
  selectAllClaims,
  (claims) => claims.filter(claim => claim.emergencyFlag === true)
);

export const selectClaimsByStatus = createSelector(
  selectAllClaims,
  (claims) => {
    return claims.reduce((acc, claim) => {
      if (!acc[claim.status]) {
        acc[claim.status] = [];
      }
      acc[claim.status].push(claim);
      return acc;
    }, {} as Record<ClaimStatus, Claim[]>);
  }
);

// Statistical selectors
export const selectTotalEstimatedDamage = createSelector(
  selectAllClaims,
  (claims) => claims.reduce((total, claim) => 
    total + (claim.estimatedDamage || 0), 0
  )
);

export const selectTotalApprovedAmount = createSelector(
  selectAllClaims,
  (claims) => claims.reduce((total, claim) => 
    total + (claim.approvedAmount || 0), 0
  )
);

export const selectAverageProcessingTime = createSelector(
  selectAllClaims,
  (claims) => {
    const closedClaims = claims.filter(claim => 
      ['approved', 'rejected', 'closed'].includes(claim.status)
    );
    
    if (closedClaims.length === 0) return 0;
    
    const totalDays = closedClaims.reduce((total, claim) => {
      const reported = new Date(claim.dateReported);
      const updated = new Date(claim.updatedAt);
      const days = Math.ceil((updated.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);
    
    return Math.round(totalDays / closedClaims.length);
  }
);

// Dashboard summary selector
export const selectClaimsSummary = createSelector(
  selectAllClaims,
  selectPendingClaims,
  selectActiveClaims,
  selectEmergencyClaims,
  selectTotalEstimatedDamage,
  selectTotalApprovedAmount,
  selectAverageProcessingTime,
  (allClaims, pendingClaims, activeClaims, emergencyClaims, totalDamage, totalApproved, avgTime) => ({
    totalClaims: allClaims.length,
    pendingClaims: pendingClaims.length,
    activeClaims: activeClaims.length,
    emergencyClaims: emergencyClaims.length,
    totalEstimatedDamage: totalDamage,
    totalApprovedAmount: totalApproved,
    averageProcessingTime: avgTime,
    approvalRate: allClaims.length > 0 
      ? Math.round((allClaims.filter(c => c.status === 'approved').length / allClaims.length) * 100)
      : 0
  })
);

// Claim by ID selector factory
export const selectClaimById = (claimId: string) => createSelector(
  selectAllClaims,
  (claims) => claims.find(claim => claim.id === claimId) || null
);

// Search and filter selectors
export const selectFilteredClaims = createSelector(
  selectAllClaims,
  selectClaimsFilters,
  (claims, filters) => {
    let filtered = [...claims];
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(claim => filters.status!.includes(claim.status));
    }
    
    // Filter by type
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(claim => filters.type!.includes(claim.type));
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(claim => 
        new Date(claim.dateReported) >= filters.dateFrom!
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(claim => 
        new Date(claim.dateReported) <= filters.dateTo!
      );
    }
    
    // Filter by amount range
    if (filters.amountMin) {
      filtered = filtered.filter(claim => 
        (claim.estimatedDamage || 0) >= filters.amountMin!
      );
    }
    
    if (filters.amountMax) {
      filtered = filtered.filter(claim => 
        (claim.estimatedDamage || 0) <= filters.amountMax!
      );
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchLower) ||
        claim.description.toLowerCase().includes(searchLower) ||
        claim.location.address.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort results
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'dateReported':
            aValue = new Date(a.dateReported);
            bValue = new Date(b.dateReported);
            break;
          case 'dateOfIncident':
            aValue = new Date(a.dateOfIncident);
            bValue = new Date(b.dateOfIncident);
            break;
          case 'estimatedDamage':
            aValue = a.estimatedDamage || 0;
            bValue = b.estimatedDamage || 0;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) {
          return filters.sortOrder === 'desc' ? 1 : -1;
        }
        if (aValue > bValue) {
          return filters.sortOrder === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }
    
    return filtered;
  }
);

// UI state selectors
export const selectClaimsLoadingState = createSelector(
  selectClaimsLoading,
  selectClaimsSubmitting,
  selectClaimsUploading,
  (loading, submitting, uploading) => ({
    isLoading: loading,
    isSubmitting: submitting,
    isUploading: uploading,
    hasAnyLoading: loading || submitting || uploading
  })
);

// Cache status selector
export const selectCacheStatus = createSelector(
  selectClaimsState,
  (state) => ({
    isValid: state.cacheValid,
    lastFetch: state.lastFetch,
    shouldRefresh: !state.cacheValid || 
      (state.lastFetch && (Date.now() - state.lastFetch) > 5 * 60 * 1000) // 5 minutes
  })
);
