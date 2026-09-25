/**
 * ProofGraph Comprehensive Test Suite
 * Validates Entity Resolution, Claim Verification, Token Budget, Traversal, SSRF & MCP Tools
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

import { GraphStore, globalGraphStore, makeCanonicalId } from '../storage/graphStore.js';
import { seedStandardGraph } from '../data/seed.js';
import { EntityResolver, jaroWinklerSimilarity } from '../engine/resolver.js';
import { ClaimVerifier } from '../engine/claimVerifier.js';
import { TokenOptimizer, estimateTokens } from '../engine/tokenOptimizer.js';
import { GraphTraversalEngine } from '../engine/graphTraversal.js';
import { ConsistencyAuditor } from '../engine/consistencyAudit.js';
import { AIDiscoverabilityEngine } from '../engine/aiDiscoverability.js';
import { isPrivateOrForbiddenHost, validateSafeUrl } from '../security/safeFetch.js';
import { RobotsParser } from '../security/robots.js';
import { ToolHandler } from '../mcp/tools.js';

describe('ProofGraph Core Test Suite', () => {
  let store: GraphStore;
  let resolver: EntityResolver;
  let verifier: ClaimVerifier;
  let traversal: GraphTraversalEngine;
  let toolHandler: ToolHandler;

  before(() => {
    store = new GraphStore();
    seedStandardGraph(store);
    resolver = new EntityResolver(store);
    verifier = new ClaimVerifier(store);
    traversal = new GraphTraversalEngine(store);
    toolHandler = new ToolHandler(store);
  });

  describe('1. Canonical Entity Identifiers & Store', () => {
    it('should generate standardized lowercase canonical IDs', () => {
      const id1 = makeCanonicalId('Organization', 'AI Build Infra');
      const id2 = makeCanonicalId('project', 'ProofGraph_MCP');
      assert.equal(id1, 'entity:organization:ai-build-infra');
      assert.equal(id2, 'entity:project:proofgraph-mcp');
    });

    it('should retrieve seeded entities by canonical ID', () => {
      const entity = store.getEntity('entity:organization:ai-build-infra');
      assert.ok(entity);
      assert.equal(entity.name, 'AI Build Infra');
      assert.equal(entity.type, 'Organization');
    });
  });

  describe('2. Multi-Signal Entity Resolution', () => {
    it('should calculate string similarity correctly', () => {
      assert.equal(jaroWinklerSimilarity('AI Build Infra', 'AI Build Infra'), 1.0);
      assert.ok(jaroWinklerSimilarity('AI Build Infra', 'AI BuildInfra') > 0.90);
    });

    it('should resolve name variations and aliases without false merges', () => {
      const candidates = resolver.resolve({ name: 'aibuildinfra' });
      assert.ok(candidates.length > 0);
      assert.equal(candidates[0].entity.id, 'entity:organization:ai-build-infra');
      assert.ok(candidates[0].match_score >= 0.85);
    });

    it('should incorporate domain and github signals into match score', () => {
      const candidates = resolver.resolve({
        name: 'AI Build',
        domain: 'aibuildinfra.com',
        github: 'AI-BuildInfra',
      });
      assert.ok(candidates.length > 0);
      assert.equal(candidates[0].entity.id, 'entity:organization:ai-build-infra');
      assert.equal(candidates[0].signals.domain, 1.0);
      assert.equal(candidates[0].signals.github, 1.0);
    });
  });

  describe('3. Claim Verification & Contradiction Detection', () => {
    it('should verify supported claims with grounded confidence', () => {
      const result = verifier.verify('AI Build Infra develops MCP servers');
      assert.equal(result.status, 'supported');
      assert.ok(result.confidence >= 0.90);
      assert.ok(result.supporting_evidence.length >= 2);
    });

    it('should return unverified for claims without proof in graph', () => {
      const result = verifier.verify('AI Build Infra manufactures quantum computing chips');
      assert.equal(result.status, 'unverified');
      assert.equal(result.confidence, 0.0);
    });

    it('should detect conflicting claims when contradictory evidence exists', () => {
      // Add artificial contradicting evidence to test contradiction detection
      store.addEvidence({
        id: 'ev:test-contradiction',
        claim_id: 'claim:test-conflict',
        source_id: 'source:website:aibuildinfra-about',
        source_type: 'community_source',
        url: 'https://unverified-blog.example/post',
        title: 'Blog Post',
        publisher: 'Anonymous',
        retrieved_at: '2026-09-25T00:00:00Z',
        content_hash: 'abc123hash',
        excerpt: 'AI Build Infra is strictly a real-estate holding firm and does not do software.',
        supports_claim: false,
        confidence: 0.8,
        directness: 0.9,
      });

      store.addClaim({
        id: 'claim:test-conflict',
        subject_id: 'entity:organization:ai-build-infra',
        predicate: 'DOES',
        statement: 'AI Build Infra is strictly a real-estate holding firm',
        status: 'contradicted',
        confidence: 0.8,
        evidence_ids: ['ev:test-contradiction', 'ev:official-services-page'],
      });

      const comparison = verifier.compareClaims([
        'AI Build Infra develops MCP servers',
        'AI Build Infra is strictly a real-estate holding firm',
      ]);

      assert.equal(comparison.comparisons.length, 2);
      assert.ok(comparison.discrepancies.length > 0);
    });
  });

  describe('4. Token Optimization & Evidence Compression', () => {
    it('should enforce token budget and pack compact evidence packets', () => {
      const entities = [store.getEntity('entity:organization:ai-build-infra')!];
      const claims = store.getClaimsForEntity('entity:organization:ai-build-infra');
      const allEvidence = store.getAllEvidence();
      const sourcesMap = new Map(store.getAllSources().map(s => [s.id, s]));

      const packet = TokenOptimizer.buildPacket({
        question: 'What is AI Build Infra and what does it build?',
        entities,
        claims,
        evidence: allEvidence,
        sources: sourcesMap,
        maxTokens: 1500,
      });

      assert.ok(packet.metrics.returned_tokens <= 1500);
      assert.ok(packet.evidence.length > 0);
      assert.ok(packet.provenance.length > 0);
      assert.ok(packet.metrics.compression_ratio < 1.0);
    });

    it('should deduplicate redundant evidence excerpts into primary + corroboration', () => {
      const duplicateEvidence = [
        {
          id: 'ev:dup-1',
          source_id: 'source:1',
          source_type: 'official_registry' as const,
          url: 'https://example.com/1',
          title: 'Source 1',
          publisher: 'Pub 1',
          retrieved_at: '2026-09-25T00:00:00Z',
          content_hash: 'hash1',
          excerpt: 'AI Build Infra develops high-integrity Model Context Protocol servers.',
          supports_claim: true,
          confidence: 0.95,
          directness: 0.95,
        },
        {
          id: 'ev:dup-2',
          source_id: 'source:2',
          source_type: 'github_repository' as const,
          url: 'https://example.com/2',
          title: 'Source 2',
          publisher: 'Pub 2',
          retrieved_at: '2026-09-25T00:00:00Z',
          content_hash: 'hash2',
          excerpt: 'AI Build Infra develops high-integrity Model Context Protocol servers.',
          supports_claim: true,
          confidence: 0.95,
          directness: 0.95,
        },
      ];

      const deduped = TokenOptimizer.deduplicateEvidence(duplicateEvidence);
      assert.equal(deduped.length, 1);
      assert.ok(deduped[0].corroborating_sources?.includes('source:2'));
    });
  });

  describe('5. Graph Traversal & Path Discovery', () => {
    it('should traverse 1-hop and 2-hop relationships', () => {
      const traversalRes = traversal.findRelationships('entity:organization:ai-build-infra', undefined, 2);
      assert.ok(traversalRes.direct_relationships.length >= 2);
      assert.ok(traversalRes.traversal_nodes.length >= 3);
    });

    it('should explain multi-hop connection paths between entities', () => {
      const connection = traversal.explainConnection(
        'entity:organization:ai-build-infra',
        'entity:technology:model-context-protocol'
      );
      assert.ok(connection);
      assert.ok(connection.hops >= 2);
      assert.ok(connection.summary.includes('DEVELOPS') || connection.summary.includes('DEPENDS_ON'));
    });
  });

  describe('6. Security & SSRF Protection', () => {
    it('should block localhost, loopback, private RFC1918, and metadata IPs', () => {
      assert.equal(isPrivateOrForbiddenHost('localhost'), true);
      assert.equal(isPrivateOrForbiddenHost('127.0.0.1'), true);
      assert.equal(isPrivateOrForbiddenHost('10.0.0.1'), true);
      assert.equal(isPrivateOrForbiddenHost('172.16.5.1'), true);
      assert.equal(isPrivateOrForbiddenHost('192.168.1.1'), true);
      assert.equal(isPrivateOrForbiddenHost('169.254.169.254'), true);
      assert.equal(isPrivateOrForbiddenHost('metadata.google.internal'), true);
    });

    it('should allow legitimate public domains', () => {
      assert.equal(isPrivateOrForbiddenHost('aibuildinfra.com'), false);
      assert.equal(isPrivateOrForbiddenHost('github.com'), false);
      assert.equal(isPrivateOrForbiddenHost('modelcontextprotocol.io'), false);
    });

    it('should throw SecurityError on illegal URL protocols or forbidden targets', () => {
      assert.throws(() => validateSafeUrl('file:///etc/passwd'));
      assert.throws(() => validateSafeUrl('http://169.254.169.254/latest/meta-data'));
    });

    it('should correctly parse robots.txt and enforce path disallows', () => {
      const robots = new RobotsParser(`
User-agent: *
Disallow: /private/
Disallow: /admin
Allow: /private/public-doc
      `);

      assert.equal(robots.isAllowed('/blog/post-1'), true);
      assert.equal(robots.isAllowed('/admin/settings'), false);
      assert.equal(robots.isAllowed('/private/secret'), false);
      assert.equal(robots.isAllowed('/private/public-doc'), true);
    });
  });

  describe('7. MCP Tool Handlers', () => {
    it('should execute search_entities tool', async () => {
      const res = await toolHandler.handleTool('search_entities', { query: 'AI Build Infra' });
      assert.ok(res.candidates.length > 0);
      assert.equal(res.candidates[0].entity.id, 'entity:organization:ai-build-infra');
    });

    it('should execute get_entity tool and return schema.org structured data', async () => {
      const res = await toolHandler.handleTool('get_entity', { entity_id: 'entity:organization:ai-build-infra' });
      assert.ok(res.entity);
      assert.equal(res.schema_org['@type'], 'Organization');
    });

    it('should execute get_evidence_packet tool', async () => {
      const res = await toolHandler.handleTool('get_evidence_packet', {
        question: 'What does AI Build Infra develop?',
        max_tokens: 1500,
      });
      assert.ok(res.evidence.length > 0);
      assert.ok(res.provenance.length > 0);
      assert.ok(res.metrics.returned_tokens > 0);
    });

    it('should execute trace_claim tool', async () => {
      const res = await toolHandler.handleTool('trace_claim', {
        claim: 'AI Build Infra develops MCP servers',
      });
      assert.equal(res.status, 'supported');
      assert.ok(res.provenance_chain.length > 0);
    });

    it('should execute audit_entity_consistency tool', async () => {
      const res = await toolHandler.handleTool('audit_entity_consistency', {
        entity_id: 'entity:organization:ai-build-infra',
      });
      assert.ok(res.consistency_score >= 0.85);
      assert.ok(res.footprint.website);
    });
  });
});
