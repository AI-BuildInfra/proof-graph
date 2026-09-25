/**
 * ProofGraph Type System
 * Evidence-first knowledge & entity graph by AI Build Infra
 */

export type EntityType =
  | 'Organization'
  | 'Person'
  | 'Project'
  | 'Repository'
  | 'Package'
  | 'Website'
  | 'Product'
  | 'Service'
  | 'Article'
  | 'Publication'
  | 'Technology'
  | 'Claim'
  | 'Evidence'
  | 'Source'
  | 'Document';

export type RelationshipType =
  | 'OWNS'
  | 'OPERATES'
  | 'PUBLISHES'
  | 'DEVELOPS'
  | 'MAINTAINS'
  | 'AUTHORED_BY'
  | 'BUILT_BY'
  | 'ABOUT'
  | 'MENTIONS'
  | 'REFERENCES'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'VERIFIES'
  | 'DEPENDS_ON'
  | 'HOSTED_ON'
  | 'PUBLISHED_ON'
  | 'AVAILABLE_ON'
  | 'HAS_DOCUMENTATION'
  | 'HAS_CASE_STUDY'
  | 'HAS_REPOSITORY'
  | 'HAS_PACKAGE'
  | 'HAS_WEBSITE'
  | string; // Extensible

export type SourceTrustClass =
  | 'official_source'
  | 'government_source'
  | 'standards_body'
  | 'official_registry'
  | 'github_repository'
  | 'package_registry'
  | 'academic_source'
  | 'established_publication'
  | 'industry_directory'
  | 'community_source'
  | 'social_media'
  | 'unknown_source';

export type ClaimStatus = 'supported' | 'contradicted' | 'conflicting' | 'unverified';

export type FreshnessStatus = 'fresh' | 'stale' | 'unknown';

export interface Entity {
  id: string; // Canonical ID: e.g. entity:organization:ai-build-infra
  name: string;
  type: EntityType;
  description: string;
  canonical_url?: string;
  aliases: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  source_type: SourceTrustClass;
  url: string;
  domain: string;
  title: string;
  publisher: string;
  trust_class: SourceTrustClass;
  reliability_score: number; // 0.0 - 1.0
  published_at?: string;
  retrieved_at: string;
  content_hash: string;
  etag?: string;
  last_verified: string;
  freshness: FreshnessStatus;
  metadata?: Record<string, any>;
}

export interface Evidence {
  id: string;
  claim_id?: string;
  source_id: string;
  source_type: SourceTrustClass;
  url: string;
  title: string;
  publisher: string;
  retrieved_at: string;
  published_at?: string;
  content_hash: string;
  excerpt: string;
  supports_claim: boolean;
  confidence: number; // 0.0 - 1.0
  directness: number; // 0.0 - 1.0 (how direct the quote/assertion is)
  corroborating_sources?: string[]; // Array of other source IDs
}

export interface Claim {
  id: string;
  subject_id: string; // Entity ID
  predicate: string; // Relationship or assertion
  object_id?: string; // Target Entity ID (if relational)
  object_value?: string; // Literal value (if literal assertion)
  statement: string;
  status: ClaimStatus;
  confidence: number;
  evidence_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id?: string;
  source_id: string;
  target_id: string;
  relationship: RelationshipType;
  confidence: number;
  evidence_ids?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface EntityResolutionCandidate {
  entity: Entity;
  match_score: number;
  signals: {
    name: number;
    domain: number;
    github: number;
    npm: number;
    email?: number;
    publisher?: number;
  };
}

export interface EvidencePacket {
  question?: string;
  entities: Array<{
    id: string;
    name: string;
    type: EntityType;
    canonical_url?: string;
    description: string;
  }>;
  claims: Array<{
    id: string;
    claim: string;
    status: ClaimStatus;
    confidence: number;
  }>;
  relationships: Array<{
    source_id: string;
    target_id: string;
    relationship: string;
    confidence: number;
  }>;
  evidence: Array<{
    evidence_id: string;
    source: string;
    source_type: SourceTrustClass;
    url: string;
    excerpt: string;
    confidence: number;
    retrieved_at: string;
    corroborating_count?: number;
  }>;
  provenance: Array<{
    claim_id: string;
    evidence_id: string;
    source_id: string;
    url: string;
    content_hash: string;
    retrieved_at: string;
  }>;
  metrics: TokenMetrics;
}

export interface TokenMetrics {
  sources_considered: number;
  sources_returned: number;
  raw_estimated_tokens: number;
  returned_tokens: number;
  compression_ratio: number;
}

export interface ConsistencyAuditResult {
  entity: string;
  entity_id: string;
  consistency_score: number;
  footprint: {
    company_name: boolean;
    website: boolean;
    github_organization: boolean;
    npm_scope: boolean;
    mcp_registry: boolean;
    schema_org: boolean;
    email_domain: boolean;
  };
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    component: string;
    message: string;
    recommendation: string;
  }>;
  verified_presence: Record<string, string>;
}

export interface AIDiscoverabilityResult {
  entity: string;
  entity_id: string;
  overall_score: number;
  checklist: {
    identity_clarity: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    source_coverage: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    entity_consistency: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    relationship_coverage: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    evidence_availability: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    freshness: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    technical_footprint: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
    third_party_corroboration: { score: number; status: 'pass' | 'partial' | 'fail'; detail: string };
  };
  recommendations: string[];
}
