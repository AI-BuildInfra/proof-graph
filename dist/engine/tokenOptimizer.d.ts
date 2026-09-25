/**
 * ProofGraph Token Budget & Evidence Compression Engine
 * Guarantees Minimum Sufficient Context and prevents context bloating
 */
import { Evidence, Source, Claim, Entity, EvidencePacket, SourceTrustClass } from '../types/index.js';
export declare const TRUST_CLASS_WEIGHTS: Record<SourceTrustClass, number>;
export declare function estimateTokens(text: string | object): number;
export declare class TokenOptimizer {
    static rankEvidence(evidenceList: Evidence[], sources: Map<string, Source>, claimStatement?: string): Evidence[];
    static deduplicateEvidence(evidenceList: Evidence[]): Evidence[];
    static buildPacket(options: {
        question?: string;
        entities: Entity[];
        claims: Claim[];
        evidence: Evidence[];
        sources: Map<string, Source>;
        relationships?: Array<{
            source_id: string;
            target_id: string;
            relationship: string;
            confidence: number;
        }>;
        maxTokens?: number;
    }): EvidencePacket;
}
