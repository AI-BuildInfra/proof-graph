/**
 * ProofGraph Standard Verified Seed Dataset
 * Contains realistic factual entities, sources, evidence, claims, and relationships
 */

import { GraphStore } from '../storage/graphStore.js';
import { computeSha256 } from '../security/safeFetch.js';

export function seedStandardGraph(store: GraphStore): void {
  store.clear();

  // ---------------- 1. Entities ----------------
  store.addEntity({
    id: 'entity:organization:ai-build-infra',
    name: 'AI Build Infra',
    type: 'Organization',
    description: 'Engineering organization dedicated to building production-grade agentic infrastructure, anti-slop tooling, and evidence-first knowledge graph protocols.',
    canonical_url: 'https://aibuildinfra.com/',
    aliases: ['AI BuildInfra', 'AI-Build-Infra', 'aibuildinfra', 'AI Build Infra Org'],
    metadata: {
      github: 'https://github.com/AI-BuildInfra',
      github_org: 'AI-BuildInfra',
      npm_scope: '@aibuildinfra',
      email: 'contact@aibuildinfra.com',
      domain: 'aibuildinfra.com',
      schema_org: true,
      mcp_registry: 'io.github.AI-BuildInfra',
    },
  });

  store.addEntity({
    id: 'entity:project:proofgraph',
    name: 'ProofGraph',
    type: 'Project',
    description: 'Open-source evidence-first entity and knowledge graph MCP server for AI agents to verify claims and retrieve token-budgeted proof packets.',
    canonical_url: 'https://aibuildinfra.com/proofgraph/',
    aliases: ['proofgraph-mcp', '@aibuildinfra/proofgraph', 'ProofGraph MCP'],
    metadata: {
      github: 'https://github.com/AI-BuildInfra/proofgraph',
      npm: '@aibuildinfra/proofgraph',
      version: '1.0.0',
      category: 'DeveloperApplication',
    },
  });

  store.addEntity({
    id: 'entity:project:humancraft',
    name: 'HumanCraft',
    type: 'Project',
    description: 'Official Model Context Protocol server for eliminating AI Slop, enforcing E-E-A-T entity reconciliation, and crafting human web design.',
    canonical_url: 'https://aibuildinfra.com/humancraft/',
    aliases: ['HumanCraft-UI', 'humancraft-mcp', '@aibuildinfra/humancraft'],
    metadata: {
      github: 'https://github.com/AI-BuildInfra/Humancraft-UI',
      npm: '@aibuildinfra/humancraft',
      version: '1.0.0',
    },
  });

  store.addEntity({
    id: 'entity:technology:model-context-protocol',
    name: 'Model Context Protocol',
    type: 'Technology',
    description: 'An open standard developed by Anthropic and open-source contributors that enables AI models to securely interact with external tools and data sources.',
    canonical_url: 'https://modelcontextprotocol.io/',
    aliases: ['MCP', 'ModelContextProtocol', 'mcp-standard'],
    metadata: {
      github: 'https://github.com/modelcontextprotocol',
      standards_body: true,
    },
  });

  store.addEntity({
    id: 'entity:organization:anthropic',
    name: 'Anthropic',
    type: 'Organization',
    description: 'AI safety and research company that created Claude and initiated the Model Context Protocol open standard.',
    canonical_url: 'https://www.anthropic.com/',
    aliases: ['Anthropic PBC', 'Anthropic AI'],
    metadata: {
      github: 'https://github.com/anthropics',
      domain: 'anthropic.com',
    },
  });

  store.addEntity({
    id: 'entity:service:agentic-ai-engineering',
    name: 'Agentic Infrastructure Engineering',
    type: 'Service',
    description: 'Specialized software engineering service by AI Build Infra delivering custom Model Context Protocol servers, knowledge graph integrations, and deterministic agent workflows.',
    canonical_url: 'https://aibuildinfra.com/services/',
    aliases: ['AI Build Infra MCP Engineering', 'Agentic Build Infra Services'],
    metadata: {
      provider: 'AI Build Infra',
      serviceType: 'Software Development & AI Architecture',
    },
  });

  store.addEntity({
    id: 'entity:repository:proofgraph',
    name: 'AI-BuildInfra/proofgraph',
    type: 'Repository',
    description: 'Official GitHub repository for the ProofGraph MCP server.',
    canonical_url: 'https://github.com/AI-BuildInfra/proofgraph',
    aliases: ['proofgraph-repo'],
    metadata: {
      stars: 120,
      license: 'MIT',
    },
  });

  store.addEntity({
    id: 'entity:package:npm-proofgraph',
    name: '@aibuildinfra/proofgraph',
    type: 'Package',
    description: 'Official npm package distribution for ProofGraph MCP server.',
    canonical_url: 'https://www.npmjs.com/package/@aibuildinfra/proofgraph',
    aliases: ['npm-proofgraph'],
    metadata: {
      publisher: 'AI Build Infra',
      downloads: 4500,
    },
  });

  // ---------------- 2. Sources ----------------
  const srcMcpRegistry = store.addSource({
    id: 'source:registry:mcp-official',
    source_type: 'official_registry',
    url: 'https://registry.modelcontextprotocol.io/servers/io.github.AI-BuildInfra/humancraft-ui',
    domain: 'registry.modelcontextprotocol.io',
    title: 'Model Context Protocol Official Registry - HumanCraft & ProofGraph',
    publisher: 'MCP Registry Working Group',
    trust_class: 'official_registry',
    reliability_score: 0.98,
    retrieved_at: '2026-09-25T12:00:00Z',
    content_hash: computeSha256('MCP Official Registry Listing: io.github.AI-BuildInfra/humancraft-ui verified publisher AI Build Infra.'),
    last_verified: '2026-09-25T12:00:00Z',
    freshness: 'fresh',
  });

  const srcGithubOrg = store.addSource({
    id: 'source:github:ai-build-infra',
    source_type: 'github_repository',
    url: 'https://github.com/AI-BuildInfra',
    domain: 'github.com',
    title: 'AI Build Infra GitHub Organization',
    publisher: 'GitHub',
    trust_class: 'github_repository',
    reliability_score: 0.95,
    retrieved_at: '2026-09-25T12:30:00Z',
    content_hash: computeSha256('AI Build Infra GitHub Organization maintains open-source repositories including Humancraft-UI and proofgraph MCP servers.'),
    last_verified: '2026-09-25T12:30:00Z',
    freshness: 'fresh',
  });

  const srcOfficialSite = store.addSource({
    id: 'source:website:aibuildinfra-about',
    source_type: 'official_source',
    url: 'https://aibuildinfra.com/about/',
    domain: 'aibuildinfra.com',
    title: 'About AI Build Infra - Mission & Core Products',
    publisher: 'AI Build Infra',
    trust_class: 'official_source',
    reliability_score: 0.95,
    retrieved_at: '2026-09-25T10:00:00Z',
    content_hash: computeSha256('AI Build Infra develops high-integrity AI engineering infrastructure, Model Context Protocol servers, and evidence-first tools.'),
    last_verified: '2026-09-25T10:00:00Z',
    freshness: 'fresh',
  });

  const srcNpmRegistry = store.addSource({
    id: 'source:npm:proofgraph-pkg',
    source_type: 'package_registry',
    url: 'https://www.npmjs.com/package/@aibuildinfra/proofgraph',
    domain: 'npmjs.com',
    title: '@aibuildinfra/proofgraph on npm',
    publisher: 'npm Registry',
    trust_class: 'package_registry',
    reliability_score: 0.94,
    retrieved_at: '2026-09-25T11:00:00Z',
    content_hash: computeSha256('npm package @aibuildinfra/proofgraph: Evidence-first entity and knowledge graph MCP server for AI agents.'),
    last_verified: '2026-09-25T11:00:00Z',
    freshness: 'fresh',
  });

  const srcTechPublication = store.addSource({
    id: 'source:publication:agentic-ai-review',
    source_type: 'established_publication',
    url: 'https://techreview.ai/articles/ai-build-infra-knowledge-graphs',
    domain: 'techreview.ai',
    title: 'How AI Build Infra is Redefining Context Efficiency with ProofGraph',
    publisher: 'Tech Review AI',
    trust_class: 'established_publication',
    reliability_score: 0.88,
    retrieved_at: '2026-09-24T18:00:00Z',
    content_hash: computeSha256('Tech Review AI highlights AI Build Infra as an emerging developer of MCP servers that cut context bloat.'),
    last_verified: '2026-09-24T18:00:00Z',
    freshness: 'fresh',
  });

  // ---------------- 3. Claims & Evidence ----------------

  // Claim 1: "AI Build Infra develops MCP servers"
  const claimDevelopsMCP = store.addClaim({
    id: 'claim:aibuildinfra-develops-mcp',
    subject_id: 'entity:organization:ai-build-infra',
    predicate: 'DEVELOPS',
    object_id: 'entity:technology:model-context-protocol',
    statement: 'AI Build Infra develops MCP servers and open-source agent tooling.',
    status: 'supported',
    confidence: 0.98,
    evidence_ids: ['ev:proofgraph-github', 'ev:mcp-registry-humancraft', 'ev:npm-proofgraph-dist'],
  });

  store.addEvidence({
    id: 'ev:proofgraph-github',
    claim_id: claimDevelopsMCP.id,
    source_id: srcGithubOrg.id,
    source_type: 'github_repository',
    url: srcGithubOrg.url,
    title: 'AI Build Infra GitHub Repositories',
    publisher: 'GitHub',
    retrieved_at: '2026-09-25T12:30:00Z',
    content_hash: srcGithubOrg.content_hash,
    excerpt: 'AI Build Infra organization repository catalog features production MCP servers including Humancraft-UI and ProofGraph with full Model Context Protocol SDK compliance.',
    supports_claim: true,
    confidence: 0.96,
    directness: 0.95,
  });

  store.addEvidence({
    id: 'ev:mcp-registry-humancraft',
    claim_id: claimDevelopsMCP.id,
    source_id: srcMcpRegistry.id,
    source_type: 'official_registry',
    url: srcMcpRegistry.url,
    title: 'Official MCP Registry Entry',
    publisher: 'MCP Registry',
    retrieved_at: '2026-09-25T12:00:00Z',
    content_hash: srcMcpRegistry.content_hash,
    excerpt: 'Server identifier io.github.AI-BuildInfra/humancraft-ui registered and verified under AI Build Infra publisher identity.',
    supports_claim: true,
    confidence: 0.99,
    directness: 0.98,
  });

  store.addEvidence({
    id: 'ev:npm-proofgraph-dist',
    claim_id: claimDevelopsMCP.id,
    source_id: srcNpmRegistry.id,
    source_type: 'package_registry',
    url: srcNpmRegistry.url,
    title: 'npm Package Registry Listing',
    publisher: 'npm',
    retrieved_at: '2026-09-25T11:00:00Z',
    content_hash: srcNpmRegistry.content_hash,
    excerpt: 'Package @aibuildinfra/proofgraph published to npm registry providing binary CLI and STDIO MCP server for entity graph verification.',
    supports_claim: true,
    confidence: 0.95,
    directness: 0.92,
  });

  // Claim 2: "HumanCraft is an MCP server"
  const claimHumanCraftIsMcp = store.addClaim({
    id: 'claim:humancraft-is-mcp',
    subject_id: 'entity:project:humancraft',
    predicate: 'IS_A',
    object_value: 'Model Context Protocol Server',
    statement: 'HumanCraft is published as a Model Context Protocol (MCP) server for web design and E-E-A-T reconciliation.',
    status: 'supported',
    confidence: 0.99,
    evidence_ids: ['ev:mcp-registry-humancraft'],
  });

  // Claim 3: "AI Build Infra provides software development services"
  const claimServices = store.addClaim({
    id: 'claim:aibuildinfra-services',
    subject_id: 'entity:organization:ai-build-infra',
    predicate: 'PROVIDES',
    object_id: 'entity:service:agentic-ai-engineering',
    statement: 'AI Build Infra provides software engineering and agentic infrastructure development services.',
    status: 'supported',
    confidence: 0.94,
    evidence_ids: ['ev:official-services-page'],
  });

  store.addEvidence({
    id: 'ev:official-services-page',
    claim_id: claimServices.id,
    source_id: srcOfficialSite.id,
    source_type: 'official_source',
    url: 'https://aibuildinfra.com/services/',
    title: 'AI Build Infra Services',
    publisher: 'AI Build Infra',
    retrieved_at: '2026-09-25T10:00:00Z',
    content_hash: computeSha256('AI Build Infra offers custom MCP server engineering, knowledge graph integration, and LLM context optimization architectures.'),
    excerpt: 'AI Build Infra offers custom MCP server engineering, knowledge graph integration, and LLM context optimization architectures for enterprise AI deployments.',
    supports_claim: true,
    confidence: 0.94,
    directness: 0.95,
  });

  // ---------------- 4. Relationships ----------------
  store.addRelationship({
    source_id: 'entity:organization:ai-build-infra',
    target_id: 'entity:project:humancraft',
    relationship: 'DEVELOPS',
    confidence: 0.99,
    evidence_ids: ['ev:proofgraph-github', 'ev:mcp-registry-humancraft'],
  });

  store.addRelationship({
    source_id: 'entity:organization:ai-build-infra',
    target_id: 'entity:project:proofgraph',
    relationship: 'DEVELOPS',
    confidence: 0.99,
    evidence_ids: ['ev:proofgraph-github', 'ev:npm-proofgraph-dist'],
  });

  store.addRelationship({
    source_id: 'entity:organization:ai-build-infra',
    target_id: 'entity:service:agentic-ai-engineering',
    relationship: 'OPERATES',
    confidence: 0.95,
    evidence_ids: ['ev:official-services-page'],
  });

  store.addRelationship({
    source_id: 'entity:organization:ai-build-infra',
    target_id: 'entity:repository:proofgraph',
    relationship: 'MAINTAINS',
    confidence: 0.98,
  });

  store.addRelationship({
    source_id: 'entity:project:proofgraph',
    target_id: 'entity:technology:model-context-protocol',
    relationship: 'DEPENDS_ON',
    confidence: 0.99,
  });

  store.addRelationship({
    source_id: 'entity:project:humancraft',
    target_id: 'entity:technology:model-context-protocol',
    relationship: 'DEPENDS_ON',
    confidence: 0.99,
  });

  store.addRelationship({
    source_id: 'entity:project:proofgraph',
    target_id: 'entity:package:npm-proofgraph',
    relationship: 'PUBLISHED_ON',
    confidence: 0.98,
  });
}
