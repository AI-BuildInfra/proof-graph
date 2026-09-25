/**
 * ProofGraph MCP Tools Implementation
 * Provides standard Model Context Protocol tool declarations and execution handlers
 */

import { GraphStore } from '../storage/graphStore.js';
import { EntityResolver } from '../engine/resolver.js';
import { ClaimVerifier } from '../engine/claimVerifier.js';
import { TokenOptimizer } from '../engine/tokenOptimizer.js';
import { GraphTraversalEngine } from '../engine/graphTraversal.js';
import { ConsistencyAuditor } from '../engine/consistencyAudit.js';
import { WebPresenceAnalyzer } from '../engine/webPresence.js';
import { AIDiscoverabilityEngine } from '../engine/aiDiscoverability.js';
import { GraphExporter } from '../engine/exporter.js';
import { SchemaOrgGenerator } from '../engine/schemaOrg.js';

export const TOOL_DEFINITIONS = [
  {
    name: 'search_entities',
    description: 'Search for candidate entities by name, alias, or keyword using multi-signal matching.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Entity name, alias, or keyword to search' },
        limit: { type: 'number', description: 'Maximum candidate entities to return (default 10)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_entity',
    description: 'Retrieve canonical information, aliases, metadata, and connected relationships for a specific entity ID.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Canonical entity ID (e.g. entity:organization:ai-build-infra)' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'verify_claim',
    description: 'Verify an assertion or claim against cryptographic, timestamped evidence sources.',
    inputSchema: {
      type: 'object',
      properties: {
        claim: { type: 'string', description: 'The factual claim to verify' },
        entity_id: { type: 'string', description: 'Optional subject entity ID to scope the verification' },
      },
      required: ['claim'],
    },
  },
  {
    name: 'find_evidence',
    description: 'Retrieve compact, ranked supporting evidence for a claim under a strict token budget.',
    inputSchema: {
      type: 'object',
      properties: {
        claim: { type: 'string', description: 'The claim or subject to find evidence for' },
        max_tokens: { type: 'number', description: 'Maximum token budget (default 1500; allows 500, 1000, 1500, 3000, 5000)' },
      },
      required: ['claim'],
    },
  },
  {
    name: 'find_relationships',
    description: 'Discover 1-hop, 2-hop, or 3-hop relationships and connecting graph paths starting from an entity.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Starting entity ID' },
        relationship: { type: 'string', description: 'Optional relationship filter (e.g. DEVELOPS, OWNS, DEPENDS_ON)' },
        depth: { type: 'number', description: 'Graph traversal depth (1, 2, or 3; default 2)' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'explain_entity',
    description: 'Return a concise, factual entity profile backed by verified sources and structured relationships.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Canonical entity ID or recognized name' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'trace_claim',
    description: 'Trace the complete provenance chain for a claim (Claim -> Evidence -> Source -> URL -> Timestamp -> Hash).',
    inputSchema: {
      type: 'object',
      properties: {
        claim: { type: 'string', description: 'Claim to trace' },
        entity_id: { type: 'string', description: 'Optional entity ID' },
      },
      required: ['claim'],
    },
  },
  {
    name: 'compare_claims',
    description: 'Compare multiple potentially conflicting claims and expose discrepancies without arbitrary bias.',
    inputSchema: {
      type: 'object',
      properties: {
        claims: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of claim statements to compare',
        },
      },
      required: ['claims'],
    },
  },
  {
    name: 'get_evidence_packet',
    description: 'Primary AI agent retrieval interface: returns the smallest verified evidence packet sufficient to answer a question.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The question or prompt to retrieve evidence for' },
        entity_id: { type: 'string', description: 'Optional specific entity ID' },
        claim: { type: 'string', description: 'Optional specific claim' },
        max_tokens: { type: 'number', description: 'Token budget ceiling (default 1500)' },
      },
    },
  },
  {
    name: 'analyze_web_presence',
    description: 'Analyze an entity digital footprint across official, GitHub, package registry, documentation, and 3rd-party sources.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Canonical entity ID or name' },
        domain: { type: 'string', description: 'Optional domain hint (e.g. aibuildinfra.com)' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'audit_entity_consistency',
    description: 'Diagnostic audit to detect inconsistencies across company name, domains, GitHub orgs, npm scopes, and Schema.org markup.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Canonical entity ID or name' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'export_graph',
    description: 'Export the verified knowledge graph to standard interoperable formats (JSON, JSON-LD, CSV, GraphML).',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'jsonld', 'csv', 'graphml'],
          description: 'Export format',
        },
      },
      required: ['format'],
    },
  },
];

export class ToolHandler {
  private resolver: EntityResolver;
  private verifier: ClaimVerifier;
  private traversal: GraphTraversalEngine;
  private consistency: ConsistencyAuditor;
  private webPresence: WebPresenceAnalyzer;
  private discoverability: AIDiscoverabilityEngine;
  private exporter: GraphExporter;

  constructor(private store: GraphStore) {
    this.resolver = new EntityResolver(store);
    this.verifier = new ClaimVerifier(store);
    this.traversal = new GraphTraversalEngine(store);
    this.consistency = new ConsistencyAuditor(store);
    this.webPresence = new WebPresenceAnalyzer(store);
    this.discoverability = new AIDiscoverabilityEngine(store);
    this.exporter = new GraphExporter(store);
  }

  public async handleTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'search_entities': {
        const query = String(args.query || '');
        const limit = Number(args.limit) || 10;
        const candidates = this.resolver.resolve({ name: query });
        return {
          query,
          count: Math.min(candidates.length, limit),
          candidates: candidates.slice(0, limit),
        };
      }

      case 'get_entity': {
        const entityId = String(args.entity_id || '');
        const entity = this.store.getEntity(entityId) || this.resolver.findCanonical(entityId);
        if (!entity) {
          return { error: `Entity "${entityId}" not found in graph.` };
        }
        const relationships = this.store.getRelationships(entity.id);
        const claims = this.store.getClaimsForEntity(entity.id);
        return {
          entity,
          relationships,
          claims,
          schema_org: SchemaOrgGenerator.generateForEntity(entity),
        };
      }

      case 'verify_claim': {
        const claim = String(args.claim || '');
        const entityId = args.entity_id ? String(args.entity_id) : undefined;
        return this.verifier.verify(claim, entityId);
      }

      case 'find_evidence': {
        const claim = String(args.claim || '');
        const maxTokens = Number(args.max_tokens) || 1500;
        const verification = this.verifier.verify(claim);
        const sourcesMap = new Map(this.store.getAllSources().map(s => [s.id, s]));

        const packet = TokenOptimizer.buildPacket({
          question: claim,
          entities: verification.entity_id ? [this.store.getEntity(verification.entity_id)!].filter(Boolean) : [],
          claims: [
            {
              id: 'claim:queried',
              subject_id: verification.entity_id || 'entity:general',
              predicate: 'VERIFIES',
              statement: claim,
              status: verification.status,
              confidence: verification.confidence,
              evidence_ids: verification.supporting_evidence.map(e => e.id),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          evidence: [...verification.supporting_evidence, ...verification.contradicting_evidence],
          sources: sourcesMap,
          maxTokens,
        });

        return packet;
      }

      case 'find_relationships': {
        const entityId = String(args.entity_id || '');
        const relType = args.relationship ? String(args.relationship) : undefined;
        const depth = Number(args.depth) || 2;
        return this.traversal.findRelationships(entityId, relType, depth);
      }

      case 'explain_entity': {
        const entityId = String(args.entity_id || '');
        const entity = this.store.getEntity(entityId) || this.resolver.findCanonical(entityId);
        if (!entity) {
          return { error: `Entity "${entityId}" not found.` };
        }
        const relationships = this.store.getRelationships(entity.id);
        const claims = this.store.getClaimsForEntity(entity.id);
        const discoverability = this.discoverability.evaluate(entity.id);

        return {
          entity,
          summary: `${entity.name} is a verified ${entity.type}. ${entity.description}`,
          key_relationships: relationships.map(r => ({
            predicate: r.relationship,
            target: r.target_id === entity.id ? r.source_id : r.target_id,
            confidence: r.confidence,
          })),
          verified_claims: claims.filter(c => c.status === 'supported').map(c => c.statement),
          discoverability_score: discoverability.overall_score,
        };
      }

      case 'trace_claim': {
        const claim = String(args.claim || '');
        const entityId = args.entity_id ? String(args.entity_id) : undefined;
        const verification = this.verifier.verify(claim, entityId);
        const sourcesMap = new Map(this.store.getAllSources().map(s => [s.id, s]));

        const traces = verification.supporting_evidence.map(ev => {
          const source = sourcesMap.get(ev.source_id);
          return {
            claim: claim,
            status: verification.status,
            evidence: {
              id: ev.id,
              excerpt: ev.excerpt,
              directness: ev.directness,
              confidence: ev.confidence,
            },
            source: {
              id: source?.id || ev.source_id,
              title: source?.title,
              url: ev.url,
              publisher: ev.publisher,
              trust_class: ev.source_type,
              last_verified: source?.last_verified || ev.retrieved_at,
              content_hash: ev.content_hash,
            },
          };
        });

        return {
          claim,
          status: verification.status,
          confidence: verification.confidence,
          provenance_chain: traces,
        };
      }

      case 'compare_claims': {
        const claims = Array.isArray(args.claims) ? args.claims.map(String) : [];
        return this.verifier.compareClaims(claims);
      }

      case 'get_evidence_packet': {
        const question = args.question ? String(args.question) : undefined;
        const entityId = args.entity_id ? String(args.entity_id) : undefined;
        const claimStmt = args.claim ? String(args.claim) : question || '';
        const maxTokens = Number(args.max_tokens) || 1500;

        let entitiesToInclude = entityId ? [this.store.getEntity(entityId)!].filter(Boolean) : [];
        if (entitiesToInclude.length === 0 && question) {
          const candidates = this.resolver.resolve({ name: question });
          if (candidates.length > 0) {
            entitiesToInclude = [candidates[0].entity];
          }
        }

        const verification = this.verifier.verify(claimStmt, entitiesToInclude[0]?.id);
        const sourcesMap = new Map(this.store.getAllSources().map(s => [s.id, s]));
        const rels = entitiesToInclude[0] ? this.store.getRelationships(entitiesToInclude[0].id) : [];

        let evidenceToInclude = [...verification.supporting_evidence, ...verification.contradicting_evidence];
        let claimsToInclude = [
          {
            id: 'claim:retrieved',
            subject_id: entitiesToInclude[0]?.id || 'entity:general',
            predicate: 'RETRIEVED',
            statement: claimStmt,
            status: verification.status,
            confidence: verification.confidence,
            evidence_ids: verification.supporting_evidence.map(e => e.id),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        // If evidence is empty for an exploratory question, pull from entity's verified claims
        if (evidenceToInclude.length === 0 && entitiesToInclude.length > 0) {
          const entityClaims = this.store.getClaimsForEntity(entitiesToInclude[0].id);
          if (entityClaims.length > 0) {
            claimsToInclude = entityClaims;
            for (const c of entityClaims) {
              for (const evId of c.evidence_ids) {
                const ev = this.store.getEvidence(evId);
                if (ev && !evidenceToInclude.some(e => e.id === ev.id)) {
                  evidenceToInclude.push(ev);
                }
              }
            }
          }
        }

        return TokenOptimizer.buildPacket({
          question,
          entities: entitiesToInclude,
          claims: claimsToInclude,
          relationships: rels.map(r => ({
            source_id: r.source_id,
            target_id: r.target_id,
            relationship: r.relationship,
            confidence: r.confidence,
          })),
          evidence: evidenceToInclude,
          sources: sourcesMap,
          maxTokens,
        });
      }

      case 'analyze_web_presence': {
        const entityId = String(args.entity_id || '');
        const domain = args.domain ? String(args.domain) : undefined;
        return this.webPresence.analyze(entityId, domain);
      }

      case 'audit_entity_consistency': {
        const entityId = String(args.entity_id || '');
        return this.consistency.audit(entityId);
      }

      case 'export_graph': {
        const format = String(args.format || 'json').toLowerCase();
        if (format === 'jsonld') return { format: 'jsonld', content: this.exporter.toJSONLD() };
        if (format === 'csv') return { format: 'csv', content: this.exporter.toCSV() };
        if (format === 'graphml') return { format: 'graphml', content: this.exporter.toGraphML() };
        return { format: 'json', content: this.exporter.toJSON() };
      }

      default:
        throw new Error(`Unknown ProofGraph tool: ${name}`);
    }
  }
}
