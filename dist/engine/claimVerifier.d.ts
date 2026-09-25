/**
 * ProofGraph Claim Verification & Contradiction Detection Engine
 */
import { Evidence, Source, ClaimStatus } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export interface ClaimVerificationResult {
    claim: string;
    entity_id?: string;
    status: ClaimStatus;
    confidence: number;
    explanation: string;
    supporting_evidence: Evidence[];
    contradicting_evidence: Evidence[];
    sources_used: Source[];
    has_conflicts: boolean;
}
export declare class ClaimVerifier {
    private store;
    constructor(store: GraphStore);
    verify(claimStatement: string, entityId?: string): ClaimVerificationResult;
    compareClaims(claims: string[]): {
        comparisons: ClaimVerificationResult[];
        consensus_summary: string;
        discrepancies: string[];
    };
}
