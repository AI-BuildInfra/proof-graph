/**
 * ProofGraph Claim Verification & Contradiction Detection Engine
 */

import { Claim, Evidence, Source, ClaimStatus } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
import { TokenOptimizer } from './tokenOptimizer.js';
import { jaroWinklerSimilarity } from './resolver.js';

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

export class ClaimVerifier {
  constructor(private store: GraphStore) {}

  public verify(claimStatement: string, entityId?: string): ClaimVerificationResult {
    const allClaims = this.store.getAllClaims();
    const allEvidence = this.store.getAllEvidence();
    const sourcesMap = new Map<string, Source>(
      this.store.getAllSources().map(s => [s.id, s])
    );

    // 1. Find closest existing claim using token-based Jaccard similarity and semantic overlap
    let matchedClaim: Claim | undefined;
    const normStatement = claimStatement.toLowerCase().trim();
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'with', 'by', 'that', 'this', 'does', 'do', 'as', 'it']);

    const queryWords = normStatement
      .split(/[^\w]+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    let bestScore = 0;
    for (const c of allClaims) {
      if (entityId && c.subject_id !== entityId && c.object_id !== entityId) continue;
      const claimLower = c.statement.toLowerCase();

      if (claimLower === normStatement) {
        matchedClaim = c;
        break;
      }

      const claimWords = claimLower
        .split(/[^\w]+/)
        .filter(w => w.length > 1 && !stopWords.has(w));

      // Calculate Jaccard similarity of non-stop words
      const intersection = queryWords.filter(w => claimWords.includes(w)).length;
      const union = new Set([...queryWords, ...claimWords]).size;
      const jaccard = union > 0 ? intersection / union : 0;

      // Ensure key distinguishing non-entity words are matched
      if (jaccard >= 0.50 && jaccard > bestScore) {
        bestScore = jaccard;
        matchedClaim = c;
      }
    }

    const relevantEvidence: Evidence[] = [];
    if (matchedClaim) {
      for (const evId of matchedClaim.evidence_ids) {
        const ev = this.store.getEvidence(evId);
        if (ev) relevantEvidence.push(ev);
      }
    } else {
      // Lexical search across evidence excerpts requiring majority of query terms to be present
      if (queryWords.length >= 2) {
        for (const ev of allEvidence) {
          const excerptLower = ev.excerpt.toLowerCase();
          const matchCount = queryWords.filter(term => excerptLower.includes(term)).length;
          if (matchCount / queryWords.length >= 0.70) {
            relevantEvidence.push(ev);
          }
        }
      }
    }

    const supporting = relevantEvidence.filter(e => e.supports_claim);
    const contradicting = relevantEvidence.filter(e => !e.supports_claim);

    let status: ClaimStatus = 'unverified';
    let confidence = 0.0;
    let explanation = '';
    const hasConflicts = supporting.length > 0 && contradicting.length > 0;

    if (hasConflicts) {
      status = 'conflicting';
      confidence = 0.5;
      explanation = `Conflicting evidence detected. ${supporting.length} sources support this assertion while ${contradicting.length} sources contradict it.`;
    } else if (supporting.length > 0) {
      status = 'supported';
      const maxConf = Math.max(...supporting.map(s => s.confidence));
      confidence = Math.min(maxConf + (supporting.length > 1 ? 0.05 : 0), 0.99);
      explanation = `Claim is directly supported by ${supporting.length} verified evidence source(s).`;
    } else if (contradicting.length > 0) {
      status = 'contradicted';
      const maxConf = Math.max(...contradicting.map(c => c.confidence));
      confidence = maxConf;
      explanation = `Claim is refuted by ${contradicting.length} verified evidence source(s).`;
    } else {
      status = 'unverified';
      confidence = 0.0;
      explanation = 'No verifiable evidence currently exists in the graph to substantiate or refute this claim.';
    }

    const usedSources: Source[] = [];
    for (const ev of [...supporting, ...contradicting]) {
      const src = sourcesMap.get(ev.source_id);
      if (src && !usedSources.some(s => s.id === src.id)) {
        usedSources.push(src);
      }
    }

    return {
      claim: claimStatement,
      entity_id: entityId,
      status,
      confidence: Number(confidence.toFixed(2)),
      explanation,
      supporting_evidence: supporting,
      contradicting_evidence: contradicting,
      sources_used: usedSources,
      has_conflicts: hasConflicts,
    };
  }

  public compareClaims(claims: string[]): {
    comparisons: ClaimVerificationResult[];
    consensus_summary: string;
    discrepancies: string[];
  } {
    const results = claims.map(c => this.verify(c));
    const discrepancies: string[] = [];

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        if (results[i].status !== results[j].status && results[i].status !== 'unverified' && results[j].status !== 'unverified') {
          discrepancies.push(
            `Divergence detected: "${results[i].claim}" is [${results[i].status}] whereas "${results[j].claim}" is [${results[j].status}].`
          );
        }
      }
    }

    let consensusSummary = 'All claims evaluated independently based on grounded evidence.';
    if (discrepancies.length > 0) {
      consensusSummary = `Found ${discrepancies.length} discrepancy points between evaluated statements.`;
    }

    return {
      comparisons: results,
      consensus_summary: consensusSummary,
      discrepancies,
    };
  }
}
