export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  status: ClaimStatus;
  type: ClaimType;
  dateReported: Date;
  dateOfIncident: Date;
  location: Location;
  description: string;
  estimatedDamage?: number;
  approvedAmount?: number;
  deductible: number;
  documents: Document[];
  photos: Photo[];
  timeline: ClaimEvent[];
  assignedAdjuster?: Adjuster;
  emergencyFlag?: boolean;
  aiAssessment?: AIAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export type ClaimStatus = 
  | 'draft'
  | 'submitted' 
  | 'under_review'
  | 'investigating'
  | 'awaiting_documentation'
  | 'processing'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'closed'
  | 'reopened';

export type ClaimType = 
  | 'auto_collision'
  | 'auto_comprehensive'
  | 'auto_liability'
  | 'property_damage'
  | 'theft'
  | 'vandalism'
  | 'natural_disaster'
  | 'personal_injury'
  | 'medical'
  | 'other';

export interface Location {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  uploadedAt: Date;
  required: boolean;
  verified?: boolean;
}

export type DocumentType = 
  | 'police_report'
  | 'repair_estimate'
  | 'medical_report'
  | 'receipt'
  | 'insurance_card'
  | 'drivers_license'
  | 'registration'
  | 'witness_statement'
  | 'other';

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  damageArea?: DamageArea;
  aiAnalysis?: PhotoAIAnalysis;
  uploadedAt: Date;
  location?: Location;
}

export type DamageArea = 
  | 'front_end'
  | 'rear_end'
  | 'driver_side'
  | 'passenger_side'
  | 'roof'
  | 'interior'
  | 'windshield'
  | 'tires'
  | 'other';

export interface ClaimEvent {
  id: string;
  type: ClaimEventType;
  description: string;
  timestamp: Date;
  actor: string; // User or system who performed the action
  metadata?: Record<string, any>;
}

export type ClaimEventType =
  | 'created'
  | 'submitted'
  | 'status_changed'
  | 'document_uploaded'
  | 'adjuster_assigned'
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'estimate_received'
  | 'approved'
  | 'rejected'
  | 'payment_processed'
  | 'closed'
  | 'reopened'
  | 'note_added';

export interface Adjuster {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specializations: ClaimType[];
  rating: number;
  responseTime: number; // Average response time in hours
}

export interface AIAssessment {
  id: string;
  overallScore: number; // 0-100 confidence score
  estimatedDamage: number;
  repairTime: number; // Estimated repair time in days
  riskFactors: RiskFactor[];
  damageAnalysis: DamageAnalysis[];
  recommendations: string[];
  processedAt: Date;
  modelVersion: string;
}

export interface RiskFactor {
  type: 'fraud_risk' | 'complexity' | 'cost_escalation' | 'timeline_risk';
  level: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
}

export interface DamageAnalysis {
  area: DamageArea;
  severity: 'minor' | 'moderate' | 'major' | 'total_loss';
  confidence: number;
  estimatedCost: number;
  repairComplexity: 'simple' | 'moderate' | 'complex';
  partsNeeded: string[];
}

export interface PhotoAIAnalysis {
  damageDetected: boolean;
  confidence: number;
  damageAreas: DamageArea[];
  severity: 'minor' | 'moderate' | 'major' | 'total_loss';
  estimatedCost: number;
  qualityScore: number; // Photo quality for analysis
  recommendations: string[];
}

// Form interfaces for claim creation
export interface ClaimInitiationForm {
  incidentDate: Date;
  incidentTime: string;
  location: Partial<Location>;
  claimType: ClaimType;
  description: string;
  policeReportFiled: boolean;
  policeReportNumber?: string;
  emergencyServices: boolean;
  injuries: boolean;
  injuryDescription?: string;
  otherVehiclesInvolved: boolean;
  otherDriverInfo?: OtherDriverInfo[];
  witnessInfo?: WitnessInfo[];
}

export interface OtherDriverInfo {
  name: string;
  phone?: string;
  email?: string;
  insuranceCompany?: string;
  policyNumber?: string;
  licenseNumber?: string;
  vehicleInfo?: VehicleInfo;
}

export interface WitnessInfo {
  name: string;
  phone?: string;
  email?: string;
  statement?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
}

// API Response interfaces
export interface ClaimsResponse {
  claims: Claim[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ClaimSubmissionResponse {
  success: boolean;
  claimId: string;
  claimNumber: string;
  message: string;
  nextSteps: string[];
}

// Filter and search interfaces
export interface ClaimFilters {
  status?: ClaimStatus[];
  type?: ClaimType[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
  sortBy?: 'dateReported' | 'dateOfIncident' | 'estimatedDamage' | 'status';
  sortOrder?: 'asc' | 'desc';
}
