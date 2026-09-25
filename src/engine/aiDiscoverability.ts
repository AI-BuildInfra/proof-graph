/**
 * ProofGraph AI Discoverability Diagnostic Engine
 * Assesses knowledge completeness for AI agents to accurately synthesize entity information
 */

import { Entity, AIDiscoverabilityResult } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';

export class AIDiscoverabilityEngine {
  constructor(private store: GraphStore) {}

  public evaluate(entityIdOrName: string): AIDiscoverabilityResult {
    let entity = this.store.getEntity(entityIdOrName);
    if (!entity) {
      const candidates = this.store.searchEntitiesByName(entityIdOrName, 1);
      if (candidates.length > 0) entity = candidates[0];
    }

    if (!entity) {
      return {
        entity: entityIdOrName,
        entity_id: 'unknown',
        overall_score: 0,
        checklist: {
          identity_clarity: { score: 0, status: 'fail', detail: 'Entity unindexed.' },
          source_coverage: { score: 0, status: 'fail', detail: 'No sources found.' },
          entity_consistency: { score: 0, status: 'fail', detail: 'No canonical records.' },
          relationship_coverage: { score: 0, status: 'fail', detail: 'No relationships.' },
          evidence_availability: { score: 0, status: 'fail', detail: 'No evidence excerpts.' },
          freshness: { score: 0, status: 'fail', detail: 'No timestamp data.' },
          technical_footprint: { score: 0, status: 'fail', detail: 'No technical repositories.' },
          third_party_corroboration: { score: 0, status: 'fail', detail: 'No third-party citations.' },
        },
        recommendations: ['Register canonical entity and attach verified sources and claims.'],
      };
    }

    const claims = this.store.getClaimsForEntity(entity.id);
    const relationships = this.store.getRelationships(entity.id);
    const allEvidence = this.store.getAllEvidence();
    const entityEvidence = allEvidence.filter(e => claims.some(c => c.id === e.claim_id));
    const allSources = this.store.getAllSources();
    const entitySources = allSources.filter(s => entityEvidence.some(e => e.source_id === s.id));

    // 1. Identity Clarity
    const idClarityScore = entity.name && entity.description && entity.description.length > 40 ? 1.0 : 0.5;

    // 2. Source Coverage
    const sourceScore = entitySources.length >= 3 ? 1.0 : entitySources.length > 0 ? 0.6 : 0.2;

    // 3. Entity Consistency
    const consistencyScore = entity.canonical_url && entity.aliases.length >= 1 ? 1.0 : entity.canonical_url ? 0.75 : 0.3;

    // 4. Relationship Coverage
    const relScore = relationships.length >= 3 ? 1.0 : relationships.length > 0 ? 0.6 : 0.2;

    // 5. Evidence Availability
    const evScore = entityEvidence.length >= 3 ? 1.0 : entityEvidence.length > 0 ? 0.5 : 0.1;

    // 6. Freshness
    const hasRecent = entitySources.some(s => {
      const year = new Date(s.last_verified || s.retrieved_at).getFullYear();
      return year >= 2025;
    });
    const freshnessScore = hasRecent ? 1.0 : 0.6;

    // 7. Technical Footprint
    const hasTech = relationships.some(r =>
      ['DEVELOPS', 'MAINTAINS', 'PUBLISHES', 'HAS_REPOSITORY', 'HAS_PACKAGE'].includes(r.relationship.toUpperCase())
    );
    const techScore = hasTech ? 1.0 : 0.4;

    // 8. Third Party Corroboration
    const hasThirdParty = entitySources.some(s =>
      ['established_publication', 'industry_directory', 'official_registry', 'academic_source'].includes(s.trust_class)
    );
    const thirdPartyScore = hasThirdParty ? 1.0 : 0.3;

    const scores = [
      idClarityScore,
      sourceScore,
      consistencyScore,
      relScore,
      evScore,
      freshnessScore,
      techScore,
      thirdPartyScore,
    ];

    const overallScore = Number(
      (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    );

    const recommendations: string[] = [];
    if (idClarityScore < 0.8) recommendations.push('Provide a rich, factual description of core entity capabilities and origin.');
    if (sourceScore < 0.8) recommendations.push('Attach additional authoritative source URLs across varied domains.');
    if (relScore < 0.8) recommendations.push('Map explicit relational edges (e.g. DEVELOPS, OWNS, PUBLISHES) to associated projects.');
    if (thirdPartyScore < 0.8) recommendations.push('Include third-party registry listings or independent publication citations.');
    if (evScore < 0.8) recommendations.push('Extract specific supporting text excerpts verifying core claims.');

    return {
      entity: entity.name,
      entity_id: entity.id,
      overall_score: overallScore,
      checklist: {
        identity_clarity: {
          score: idClarityScore,
          status: idClarityScore >= 0.8 ? 'pass' : idClarityScore >= 0.5 ? 'partial' : 'fail',
          detail: 'Entity has comprehensive canonical name and unambiguous description.',
        },
        source_coverage: {
          score: sourceScore,
          status: sourceScore >= 0.8 ? 'pass' : sourceScore >= 0.5 ? 'partial' : 'fail',
          detail: `Verified across ${entitySources.length} distinct source records.`,
        },
        entity_consistency: {
          score: consistencyScore,
          status: consistencyScore >= 0.8 ? 'pass' : 'partial',
          detail: `Canonical URL defined with ${entity.aliases.length} recorded aliases.`,
        },
        relationship_coverage: {
          score: relScore,
          status: relScore >= 0.8 ? 'pass' : relScore >= 0.5 ? 'partial' : 'fail',
          detail: `${relationships.length} structured relational graph edges connected.`,
        },
        evidence_availability: {
          score: evScore,
          status: evScore >= 0.8 ? 'pass' : evScore >= 0.5 ? 'partial' : 'fail',
          detail: `${entityEvidence.length} granular proof excerpts verified.`,
        },
        freshness: {
          score: freshnessScore,
          status: freshnessScore >= 0.8 ? 'pass' : 'partial',
          detail: hasRecent ? 'Sources verified within active recency window.' : 'Sources need re-verification.',
        },
        technical_footprint: {
          score: techScore,
          status: techScore >= 0.8 ? 'pass' : 'partial',
          detail: hasTech ? 'Software repositories, packages, or developer artifacts verified.' : 'No technical repository linkage.',
        },
        third_party_corroboration: {
          score: thirdPartyScore,
          status: thirdPartyScore >= 0.8 ? 'pass' : 'fail',
          detail: hasThirdParty ? 'Independent registries or third-party publications corroborate identity.' : 'Lacks third-party corroboration.',
        },
      },
      recommendations,
    };
  }
}
