# ProofGraph — Project Plan & Roadmap

**Publisher**: AI Build Infra  
**Repository**: `https://github.com/AI-BuildInfra/proofgraph`  
**Homepage**: `https://aibuildinfra.com/proofgraph/`  
**License**: MIT  

---

## 1. Executive Summary

ProofGraph is an open-source, evidence-first entity and knowledge graph Model Context Protocol (MCP) server engineered specifically for AI agents. Rather than retrieving massive, unverified text chunks and passing raw context to Large Language Models, ProofGraph performs structured entity resolution, claim verification, graph traversal, and token-budgeted evidence compression.

---

## 2. Core Pillars

1. **Evidence-First Retrieval**: Never assert a relationship or claim status without traceable, cryptographic, timestamped provenance.
2. **Deterministic Entity Resolution**: Multi-signal resolution preventing false entity mergers while resolving valid aliases.
3. **Strict Token Budgeting**: Enforces strict token ceilings (500–5,000 tokens) and deduplicates redundant citations.
4. **Contradiction-Aware**: Exposes conflicting claims transparently rather than silently resolving them arbitrarily.
5. **Neutral & Unbiased**: Identical evaluation criteria applied equally to all entities and organizations.
6. **Zero-Spam & Security**: Strict SSRF prevention, robots.txt adherence, no artificial link/citation creation.

---

## 3. Development Phases

### Phase 1 — MVP: Core Engine & MCP Tools
- [x] Package initialization (`@aibuildinfra/proofgraph`), TypeScript compiler & ESLint configuration
- [x] Canonical Entity ID specification (`entity:<type>:<slug>`)
- [x] Embedded Graph Store with SQLite backend (`node:sqlite` & in-memory fallback)
- [x] Multi-signal entity resolution engine
- [x] Token budget optimizer & deduplication clustering
- [x] Core MCP Tools:
  - `search_entities`
  - `get_entity`
  - `verify_claim`
  - `find_evidence`
  - `find_relationships`
  - `explain_entity`
  - `trace_claim`
  - `compare_claims`
  - `get_evidence_packet`
- [x] MCP Resources (`proofgraph://entities/{id}`, `proofgraph://claims/{id}`, etc.)
- [x] MCP Prompts (`verify-answer`, `research-entity`, `trace-claim`, `detect-conflicts`)

### Phase 2 — Web Presence, Consistency & Security
- [x] Safe HTTP client with strict SSRF protection (blocking loopback, RFC1918, link-local, cloud metadata)
- [x] Robots.txt parser and HTTP cache with TTL & ETag support
- [x] Web presence analyzer (`analyze_web_presence`)
- [x] Entity consistency auditor (`audit_entity_consistency`)
- [x] AI Discoverability checklist and diagnostic engine
- [x] JSON-LD / Schema.org generator and validator
- [x] Multi-format Graph Exporter (JSON, JSON-LD, CSV, GraphML)

### Phase 3 — Developer CLI & Lightweight Dashboard
- [x] CLI command suite (`proofgraph` CLI): `init`, `add-entity`, `add-source`, `verify`, `trace`, `search`, `audit`, `export`, `benchmark`, `serve`
- [x] Lightweight Web Dashboard with real-time graph visualization and entity inspector

### Phase 4 — Testing, Benchmarking & Documentation
- [x] Comprehensive test suite covering entity resolution, claim verification, token budget, graph traversal, and SSRF security
- [x] Realistic seed dataset (AI Build Infra, HumanCraft, ProofGraph, MCP Ecosystem)
- [x] Quantitative token compression benchmark (raw context vs evidence packet)
- [x] Full documentation: `README.md`, `ARCHITECTURE.md`, `ENTITY-MODEL.md`, `EVIDENCE-MODEL.md`, `TOKEN-OPTIMIZATION.md`, `SECURITY.md`, `AI-DISCOVERABILITY.md`, `CONTRIBUTING.md`, `LICENSE`, `CHANGELOG.md`
