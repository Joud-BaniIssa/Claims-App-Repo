import { Claim, ClaimFilters, ClaimInitiationForm } from '../../models/claims.model';

export interface ClaimsState {
  // Current claims data
  claims: Claim[];
  activeClaim: Claim | null;
  
  // Pagination and filtering
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: ClaimFilters;
  
  // Loading states
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  
  // Error handling
  error: string | null;
  
  // Form state
  draftClaim: Partial<ClaimInitiationForm> | null;
  
  // Cache and optimization
  lastFetch: number | null;
  cacheValid: boolean;
}

export const initialClaimsState: ClaimsState = {
  claims: [],
  activeClaim: null,
  total: 0,
  page: 1,
  limit: 10,
  hasMore: false,
  filters: {},
  loading: false,
  submitting: false,
  uploading: false,
  error: null,
  draftClaim: null,
  lastFetch: null,
  cacheValid: false,
};

// Selectors for computed state
export interface ClaimsSelectors {
  recentClaims: Claim[];
  pendingClaims: Claim[];
  activeClaims: Claim[];
  emergencyClaims: Claim[];
  claimsByStatus: Record<string, Claim[]>;
  totalEstimatedDamage: number;
  averageProcessingTime: number;
}
