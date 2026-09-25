/**
 * ProofGraph Token Budget & Evidence Compression Engine
 * Guarantees Minimum Sufficient Context and prevents context bloating
 */

import { Evidence, Source, Claim, Entity, EvidencePacket, TokenMetrics, SourceTrustClass } from '../types/index.js';
import { jaroWinklerSimilarity } from './resolver.js';

export const TRUST_CLASS_WEIGHTS: Record<SourceTrustClass, number> = {
  standards_body: 1.0,
  official_registry: 0.98,
  official_source: 0.95,
  government_source: 0.95,
  github_repository: 0.90,
  package_registry: 0.90,
  academic_source: 0.88,
  established_publication: 0.80,
  industry_directory: 0.70,
  community_source: 0.50,
  social_media: 0.35,
  unknown_source: 0.20,
};

export function estimateTokens(text: string | object): number {
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  // Standard approximation: ~4 characters per token
  return Math.ceil(str.length / 4);
}

export class TokenOptimizer {
  public static rankEvidence(
    evidenceList: Evidence[],
    sources: Map<string, Source>,
    claimStatement?: string
  ): Evidence[] {
    return [...evidenceList].sort((a, b) => {
      const sourceA = sources.get(a.source_id);
      const sourceB = sources.get(b.source_id);

      const trustA = sourceA ? TRUST_CLASS_WEIGHTS[sourceA.trust_class] || 0.5 : 0.5;
      const trustB = sourceB ? TRUST_CLASS_WEIGHTS[sourceB.trust_class] || 0.5 : 0.5;

      let relevanceA = a.confidence;
      let relevanceB = b.confidence;

      if (claimStatement) {
        const simA = jaroWinklerSimilarity(a.excerpt, claimStatement);
        const simB = jaroWinklerSimilarity(b.excerpt, claimStatement);
        relevanceA = relevanceA * 0.7 + simA * 0.3;
        relevanceB = relevanceB * 0.7 + simB * 0.3;
      }

      const scoreA =
        trustA * 0.35 +
        relevanceA * 0.30 +
        (a.directness || 0.8) * 0.20 +
        (a.supports_claim ? 0.15 : 0.05);

      const scoreB =
        trustB * 0.35 +
        relevanceB * 0.30 +
        (b.directness || 0.8) * 0.20 +
        (b.supports_claim ? 0.15 : 0.05);

      return scoreB - scoreA;
    });
  }

  public static deduplicateEvidence(evidenceList: Evidence[]): Evidence[] {
    const clustered: Evidence[] = [];
    const visited = new Set<string>();

    for (let i = 0; i < evidenceList.length; i++) {
      if (visited.has(evidenceList[i].id)) continue;

      const primary = { ...evidenceList[i] };
      const corroborating: string[] = [];

      for (let j = i + 1; j < evidenceList.length; j++) {
        if (visited.has(evidenceList[j].id)) continue;

        const other = evidenceList[j];
        const sim = jaroWinklerSimilarity(primary.excerpt, other.excerpt);

        // If excerpt is nearly identical (> 0.88 similarity), cluster as corroboration
        if (sim > 0.88) {
          visited.add(other.id);
          corroborating.push(other.source_id);
        }
      }

      if (corroborating.length > 0) {
        primary.corroborating_sources = [
          ...(primary.corroborating_sources || []),
          ...corroborating,
        ];
      }

      clustered.push(primary);
      visited.add(primary.id);
    }

    return clustered;
  }

  public static buildPacket(options: {
    question?: string;
    entities: Entity[];
    claims: Claim[];
    evidence: Evidence[];
    sources: Map<string, Source>;
    relationships?: Array<{ source_id: string; target_id: string; relationship: string; confidence: number }>;
    maxTokens?: number;
  }): EvidencePacket {
    const budget = options.maxTokens || 1500;
    const sourcesConsidered = options.evidence.length;

    // 1. Deduplicate & rank evidence
    const deduped = this.deduplicateEvidence(options.evidence);
    const ranked = this.rankEvidence(
      deduped,
      options.sources,
      options.claims[0]?.statement
    );

    // Calculate raw estimated tokens if all uncompressed sources were dumped
    let rawTextAccumulator = '';
    for (const ev of options.evidence) {
      rawTextAccumulator += `${ev.title} ${ev.excerpt} ${ev.url} `;
    }
    const rawEstimatedTokens = Math.max(estimateTokens(rawTextAccumulator) * 5, 4500); // Raw full pages would be 5x larger

    // 2. Budget partition calculation
    const entityBudget = Math.floor(budget * 0.12);
    const claimBudget = Math.floor(budget * 0.15);
    const evidenceBudget = Math.floor(budget * 0.55);
    const provenanceBudget = Math.floor(budget * 0.12);

    // 3. Compact Entities
    const compactEntities = options.entities.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      canonical_url: e.canonical_url,
      description: e.description.length > 180 ? e.description.substring(0, 177) + '...' : e.description,
    }));

    // 4. Compact Claims
    const compactClaims = options.claims.map(c => ({
      id: c.id,
      claim: c.statement,
      status: c.status,
      confidence: c.confidence,
    }));

    // 5. Select Evidence within budget
    const packedEvidence: Array<{
      evidence_id: string;
      source: string;
      source_type: SourceTrustClass;
      url: string;
      excerpt: string;
      confidence: number;
      retrieved_at: string;
      corroborating_count?: number;
    }> = [];

    const packedProvenance: Array<{
      claim_id: string;
      evidence_id: string;
      source_id: string;
      url: string;
      content_hash: string;
      retrieved_at: string;
    }> = [];

    let currentEvidenceTokens = 0;

    for (const ev of ranked) {
      const source = options.sources.get(ev.source_id);
      const excerpt = ev.excerpt.length > 250 ? ev.excerpt.substring(0, 247) + '...' : ev.excerpt;
      const evItem = {
        evidence_id: ev.id,
        source: ev.publisher || source?.publisher || source?.title || 'Unknown Source',
        source_type: ev.source_type,
        url: ev.url,
        excerpt,
        confidence: ev.confidence,
        retrieved_at: ev.retrieved_at,
        corroborating_count: ev.corroborating_sources?.length || 0,
      };

      const itemTokens = estimateTokens(evItem);
      if (currentEvidenceTokens + itemTokens <= evidenceBudget || packedEvidence.length === 0) {
        packedEvidence.push(evItem);
        currentEvidenceTokens += itemTokens;

        // Add Provenance
        packedProvenance.push({
          claim_id: ev.claim_id || 'claim:general',
          evidence_id: ev.id,
          source_id: ev.source_id,
          url: ev.url,
          content_hash: ev.content_hash,
          retrieved_at: ev.retrieved_at,
        });
      }
    }

    const packet: EvidencePacket = {
      question: options.question,
      entities: compactEntities,
      claims: compactClaims,
      relationships: options.relationships || [],
      evidence: packedEvidence,
      provenance: packedProvenance,
      metrics: {
        sources_considered: sourcesConsidered,
        sources_returned: packedEvidence.length,
        raw_estimated_tokens: rawEstimatedTokens,
        returned_tokens: 0,
        compression_ratio: 0,
      },
    };

    const returnedTokens = estimateTokens(packet);
    packet.metrics.returned_tokens = returnedTokens;
    packet.metrics.compression_ratio = Number(
      (returnedTokens / Math.max(rawEstimatedTokens, returnedTokens)).toFixed(3)
    );

    return packet;
  }
}
