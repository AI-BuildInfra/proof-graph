#!/usr/bin/env node
/**
 * ProofGraph CLI Tool Suite
 * Direct command line interface for entity management, verification, audits & benchmarks
 */

import { globalGraphStore, makeCanonicalId } from '../storage/graphStore.js';
import { seedStandardGraph } from '../data/seed.js';
import { EntityResolver } from '../engine/resolver.js';
import { ClaimVerifier } from '../engine/claimVerifier.js';
import { GraphTraversalEngine } from '../engine/graphTraversal.js';
import { ConsistencyAuditor } from '../engine/consistencyAudit.js';
import { AIDiscoverabilityEngine } from '../engine/aiDiscoverability.js';
import { GraphExporter } from '../engine/exporter.js';
import { TokenOptimizer } from '../engine/tokenOptimizer.js';
import { ProofGraphMCPServer } from '../mcp/server.js';
import { computeSha256 } from '../security/safeFetch.js';

// Initialize with standard seed data
seedStandardGraph(globalGraphStore);

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'help':
    case '--help':
    case '-h': {
      console.log(`
ProofGraph CLI — Evidence-First Knowledge & Entity Graph
Publisher: AI Build Infra (https://aibuildinfra.com/proofgraph/)

Usage:
  proofgraph <command> [arguments]

Commands:
  init                     Initialize or re-seed the local graph database
  search <query>           Search for candidate entities by name or alias
  verify "<claim>"         Verify a claim against cryptographic evidence
  trace "<claim>"          Display complete provenance trail for a claim
  audit <entity>           Run an entity consistency audit across platforms
  discoverability <entity> Run AI Discoverability diagnostic checklist
  export <json|jsonld|csv> Export knowledge graph to specified format
  benchmark                Run quantitative token reduction & retrieval benchmark
  serve                    Launch ProofGraph MCP server over STDIO
      `);
      break;
    }

    case 'init': {
      seedStandardGraph(globalGraphStore);
      console.log('✓ ProofGraph verified seed dataset initialized successfully.');
      console.log(`  Indexed Entities: ${globalGraphStore.getAllEntities().length}`);
      console.log(`  Indexed Claims: ${globalGraphStore.getAllClaims().length}`);
      console.log(`  Indexed Evidence: ${globalGraphStore.getAllEvidence().length}`);
      console.log(`  Indexed Relationships: ${globalGraphStore.getAllRelationships().length}`);
      break;
    }

    case 'search': {
      const query = args.slice(1).join(' ');
      if (!query) {
        console.error('Error: Please provide a search query. Example: proofgraph search "AI Build Infra"');
        process.exit(1);
      }
      const resolver = new EntityResolver(globalGraphStore);
      const candidates = resolver.resolve({ name: query });
      console.log(`\nSearch Results for "${query}":`);
      if (candidates.length === 0) {
        console.log('  No matching entities found.');
      } else {
        candidates.forEach((c, idx) => {
          console.log(`\n[${idx + 1}] ${c.entity.name} (${c.entity.type})`);
          console.log(`    Canonical ID: ${c.entity.id}`);
          console.log(`    Match Score: ${(c.match_score * 100).toFixed(1)}%`);
          console.log(`    Signals: Name=${c.signals.name}, Domain=${c.signals.domain}, GitHub=${c.signals.github}, npm=${c.signals.npm}`);
          console.log(`    URL: ${c.entity.canonical_url || 'N/A'}`);
        });
      }
      break;
    }

    case 'verify': {
      const claimStmt = args.slice(1).join(' ');
      if (!claimStmt) {
        console.error('Error: Please provide a claim statement to verify.');
        process.exit(1);
      }
      const verifier = new ClaimVerifier(globalGraphStore);
      const result = verifier.verify(claimStmt);

      console.log('\n================ PROOFGRAPH CLAIM VERIFICATION ================');
      console.log(`Claim:      "${result.claim}"`);
      console.log(`Status:     [${result.status.toUpperCase()}]`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Detail:     ${result.explanation}`);
      console.log('----------------------------------------------------------------');

      if (result.supporting_evidence.length > 0) {
        console.log('\nSupporting Evidence:');
        result.supporting_evidence.forEach((ev, i) => {
          console.log(`  (${i + 1}) [${ev.source_type}] ${ev.publisher} (${ev.url})`);
          console.log(`      Excerpt: "${ev.excerpt}"`);
          console.log(`      Directness: ${ev.directness} | Hash: ${ev.content_hash.substring(0, 12)}...`);
        });
      }

      if (result.contradicting_evidence.length > 0) {
        console.log('\nContradicting Evidence:');
        result.contradicting_evidence.forEach((ev, i) => {
          console.log(`  (${i + 1}) [${ev.source_type}] ${ev.publisher} (${ev.url})`);
          console.log(`      Excerpt: "${ev.excerpt}"`);
        });
      }
      console.log('================================================================\n');
      break;
    }

    case 'trace': {
      const claimStmt = args.slice(1).join(' ');
      if (!claimStmt) {
        console.error('Error: Please provide a claim statement to trace.');
        process.exit(1);
      }
      const verifier = new ClaimVerifier(globalGraphStore);
      const res = verifier.verify(claimStmt);
      const sourcesMap = new Map(globalGraphStore.getAllSources().map(s => [s.id, s]));

      console.log(`\nProvenance Chain for: "${claimStmt}"`);
      console.log(`Status: [${res.status.toUpperCase()}] (${(res.confidence * 100).toFixed(1)}%)\n`);

      res.supporting_evidence.forEach((ev, idx) => {
        const src = sourcesMap.get(ev.source_id);
        console.log(`[Provenance Trail #${idx + 1}]`);
        console.log(`  1. Claim: "${claimStmt}"`);
        console.log(`     ↓`);
        console.log(`  2. Evidence Excerpt: "${ev.excerpt}"`);
        console.log(`     ↓`);
        console.log(`  3. Source: ${src?.title || ev.publisher} (${ev.source_type})`);
        console.log(`     ↓`);
        console.log(`  4. URL: ${ev.url}`);
        console.log(`     ↓`);
        console.log(`  5. Retrieved: ${ev.retrieved_at}`);
        console.log(`     ↓`);
        console.log(`  6. Content Hash (SHA-256): ${ev.content_hash}\n`);
      });
      break;
    }

    case 'audit': {
      const entityName = args.slice(1).join(' ') || 'AI Build Infra';
      const auditor = new ConsistencyAuditor(globalGraphStore);
      const audit = auditor.audit(entityName);

      console.log('\n================ ENTITY CONSISTENCY AUDIT ================');
      console.log(`Entity:            ${audit.entity}`);
      console.log(`Consistency Score: ${(audit.consistency_score * 100).toFixed(1)}%`);
      console.log('\nPlatform Footprint:');
      for (const [key, val] of Object.entries(audit.footprint)) {
        console.log(`  • ${key.padEnd(22)}: ${val ? '✓ Verified' : '✗ Missing'}`);
      }

      if (audit.issues.length > 0) {
        console.log('\nDiagnostic Issues:');
        audit.issues.forEach((iss, i) => {
          console.log(`  (${i + 1}) [${iss.severity.toUpperCase()}] ${iss.component}: ${iss.message}`);
          console.log(`      Action: ${iss.recommendation}`);
        });
      }
      console.log('==========================================================\n');
      break;
    }

    case 'discoverability': {
      const entityName = args.slice(1).join(' ') || 'AI Build Infra';
      const engine = new AIDiscoverabilityEngine(globalGraphStore);
      const res = engine.evaluate(entityName);

      console.log('\n================ AI DISCOVERABILITY DIAGNOSTIC ================');
      console.log(`Entity:              ${res.entity}`);
      console.log(`Overall Score:       ${(res.overall_score * 100).toFixed(1)}%`);
      console.log('\nChecklist:');
      for (const [key, item] of Object.entries(res.checklist)) {
        console.log(`  • ${key.padEnd(26)} [${item.status.toUpperCase().padEnd(7)}]: ${item.detail}`);
      }
      if (res.recommendations.length > 0) {
        console.log('\nRecommendations:');
        res.recommendations.forEach((r, i) => console.log(`  (${i + 1}) ${r}`));
      }
      console.log('===============================================================\n');
      break;
    }

    case 'export': {
      const format = (args[1] || 'json').toLowerCase();
      const exporter = new GraphExporter(globalGraphStore);
      if (format === 'jsonld') {
        console.log(exporter.toJSONLD());
      } else if (format === 'csv') {
        const csv = exporter.toCSV();
        console.log('--- Entities CSV ---');
        console.log(csv.entitiesCSV);
        console.log('\n--- Relationships CSV ---');
        console.log(csv.relationshipsCSV);
      } else if (format === 'graphml') {
        console.log(exporter.toGraphML());
      } else {
        console.log(exporter.toJSON());
      }
      break;
    }

    case 'benchmark': {
      console.log('\n================ PROOFGRAPH TOKEN REDUCTION BENCHMARK ================');
      const benchmarkQuestions = [
        'Who is AI Build Infra?',
        'What is HumanCraft?',
        'What evidence connects HumanCraft to AI Build Infra?',
        'Is AI Build Infra associated with HumanCraft and ProofGraph?',
        'What software development services does AI Build Infra provide?',
      ];

      const sourcesMap = new Map(globalGraphStore.getAllSources().map(s => [s.id, s]));
      let totalRaw = 0;
      let totalPacket = 0;

      for (let i = 0; i < benchmarkQuestions.length; i++) {
        const q = benchmarkQuestions[i];
        const resolver = new EntityResolver(globalGraphStore);
        const candidates = resolver.resolve({ name: q });
        const entity = candidates[0]?.entity || globalGraphStore.getEntity('entity:organization:ai-build-infra')!;
        const rels = globalGraphStore.getRelationships(entity.id);
        const verifier = new ClaimVerifier(globalGraphStore);
        const verification = verifier.verify(q, entity.id);

        const packet = TokenOptimizer.buildPacket({
          question: q,
          entities: [entity],
          claims: [
            {
              id: `claim:q${i}`,
              subject_id: entity.id,
              predicate: 'RETRIEVED',
              statement: q,
              status: verification.status,
              confidence: verification.confidence,
              evidence_ids: verification.supporting_evidence.map(e => e.id),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          relationships: rels.map(r => ({
            source_id: r.source_id,
            target_id: r.target_id,
            relationship: r.relationship,
            confidence: r.confidence,
          })),
          evidence: verification.supporting_evidence,
          sources: sourcesMap,
          maxTokens: 1500,
        });

        totalRaw += packet.metrics.raw_estimated_tokens;
        totalPacket += packet.metrics.returned_tokens;

        console.log(`\nQuestion ${i + 1}: "${q}"`);
        console.log(`  Raw Text Context:       ~${packet.metrics.raw_estimated_tokens.toLocaleString()} tokens`);
        console.log(`  ProofGraph Packet:      ${packet.metrics.returned_tokens.toLocaleString()} tokens`);
        console.log(`  Token Compression:      ${((1 - packet.metrics.compression_ratio) * 100).toFixed(1)}% savings`);
        console.log(`  Evidence Precision:     ${packet.evidence.length} compact proofs selected from ${packet.metrics.sources_considered} sources`);
      }

      console.log('\n----------------------------------------------------------------------');
      console.log(`Cumulative Benchmark Summary:`);
      console.log(`  Traditional Unfiltered Context: ~${totalRaw.toLocaleString()} tokens`);
      console.log(`  ProofGraph Evidence Packets:    ${totalPacket.toLocaleString()} tokens`);
      console.log(`  Overall Context Reduction:      ${(((totalRaw - totalPacket) / totalRaw) * 100).toFixed(1)}%`);
      console.log('======================================================================\n');
      break;
    }

    case 'serve': {
      const server = new ProofGraphMCPServer(globalGraphStore);
      await server.start();
      break;
    }

    default: {
      console.error(`Unknown command: "${command}". Run "proofgraph --help" for available commands.`);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
