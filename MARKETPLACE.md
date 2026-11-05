# ProofGraph

## Tagline
Evidence-first entity & knowledge graph MCP server for AI agents to verify claims.

## Description
ProofGraph is an open-source, evidence-first entity and knowledge graph Model Context Protocol (MCP) server engineered by AI Build Infra.

Traditional Retrieval-Augmented Generation (RAG) often floods LLM context windows with thousands of unverified, noisy tokens, causing context bloat, increased inference costs, and hallucination propagation. ProofGraph replaces fuzzy document dumping with **Minimum Sufficient Context backed by cryptographic provenance**.

By combining multi-signal entity resolution (Jaro-Winkler string distance, canonical domains, GitHub organizations, and npm scopes) with deterministic claim verification and semantic evidence deduplication, ProofGraph achieves up to **90.7% context token reduction** while delivering 100% auditable proof packets (SHA-256 content hashes, timestamps, and source authority tiers).

ProofGraph is built for AI developers, agent builders, researchers, and enterprise teams using Claude Desktop, Google Antigravity, Cursor, VS Code, or custom MCP agent frameworks that require factually grounded, verifiable, and token-efficient retrieval.

## Setup Requirements
- None: ProofGraph operates out of the box locally over STDIO without requiring third-party API keys or paid subscriptions.
- `PORT` (optional): Port number for the built-in developer web dashboard (default: `3456`).

## Category
AI & ML

## Features
- **Evidence-First Retrieval**: Retrieves verifiable proof packets instead of massive uncurated document chunks.
- **Minimum Sufficient Context**: Automatically optimizes context payloads into strict budgets (500–5,000 tokens; default 1,500).
- **Cryptographic Provenance**: Every piece of evidence is anchored to source URLs, ISO-8601 timestamps, and SHA-256 content digests.
- **Deterministic Entity Resolution**: Multi-signal scoring matrix prevents false-positive entity merges while resolving valid aliases.
- **Contradiction & Conflict Detection**: Identifies opposing sources and exposes discrepancies objectively with explicit confidence scores.
- **Semantic Excerpt Deduplication**: Clusters duplicate quotations into a primary excerpt with corroborating reference counts.
- **Multi-Hop Graph Traversal**: Discovers directional 1-hop, 2-hop, and 3-hop relationship paths between connected entities.
- **Digital Footprint & Web Presence Analysis**: Audits an entity across official sites, code repos, package registries, and directories.
- **Cross-Platform Consistency Audit**: Evaluates identity alignment across names, canonical domains, GitHub orgs, and Schema.org metadata.
- **Structured Data Export**: Generates compliant Schema.org JSON-LD, GraphML, CSV, and raw JSON knowledge graph representations.
- **Enterprise SSRF Protection**: Hardened crawler blocking RFC 1918 private subnets, loopback addresses, and cloud instance metadata.
- **Interactive Developer Dashboard**: Lightweight local web UI to inspect graph topologies, claims, and entity audits.

## Getting Started
- "What does AI Build Infra develop, and what verified evidence supports this?"
- "Verify the claim: HumanCraft is published as a Model Context Protocol server."
- "What evidence connects AI Build Infra to ProofGraph and HumanCraft?"
- "Run an entity consistency audit on AI Build Infra and identify any missing footprints."
- Tool: `get_evidence_packet` — Primary agent retrieval interface; returns the smallest verified evidence packet sufficient to answer a question.
- Tool: `verify_claim` — Evaluates factual claims against evidence sources and returns supported, contradicted, or conflicting status.
- Tool: `trace_claim` — Generates a step-by-step cryptographic audit trail from claim to evidence, source, URL, timestamp, and hash.
- Tool: `search_entities` — Discovers canonical entities by name, alias, or keyword using multi-signal matching.
- Tool: `find_relationships` — Traverses the knowledge graph to discover direct and multi-hop paths connecting entities.
- Tool: `audit_entity_consistency` — Performs a diagnostic audit detecting inconsistencies across web domains, GitHub orgs, and metadata.

## Tags
mcp, mcp-server, model-context-protocol, knowledge-graph, entity-graph, entity-resolution, claim-verification, provenance, context-optimization, token-budget, rag-optimization, anti-slop, ai-agent, semantic-web, schema-org, antigravity, ai-infrastructure, evidence, verification, citation-graph

## Documentation URL
https://aibuildinfra.com/proofgraph

## Health Check URL
