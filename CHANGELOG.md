# Changelog — ProofGraph

All notable changes to ProofGraph are documented in this file.

## [1.0.0] - 2026-09-25

### Initial Release
- **Core Knowledge Graph**: High-performance in-memory and SQLite-backed entity graph engine with canonical ID indexing (`entity:<type>:<slug>`).
- **Deterministic Multi-Signal Entity Resolver**: Normalized Jaro-Winkler string similarity, domain matching, GitHub org matching, and npm scope verification.
- **Evidence & Claim Verifier**: Grounded verification status (`supported`, `contradicted`, `conflicting`, `unverified`) with contradiction detection.
- **Token Budget & Compression Engine**: Context packing (500–5000 tokens), excerpt deduplication, and evidence ranking.
- **Full Model Context Protocol (MCP) Support**:
  - 12 Tools: `search_entities`, `get_entity`, `verify_claim`, `find_evidence`, `find_relationships`, `explain_entity`, `trace_claim`, `compare_claims`, `get_evidence_packet`, `analyze_web_presence`, `audit_entity_consistency`, `export_graph`.
  - Resources: `proofgraph://entities/{id}`, `proofgraph://claims/{id}`, `proofgraph://sources/{id}`, `proofgraph://relationships/{id}`.
  - Prompts: `verify-answer`, `research-entity`, `trace-claim`, `build-evidence-summary`, `detect-conflicts`.
- **Security & SSRF Guardrails**: Strict private IP blocking (RFC 1918, cloud metadata endpoints, loopback) and robots.txt parsing.
- **Developer CLI & Dashboard**: Native `proofgraph` command line interface and local developer dashboard.
- **Interoperability**: JSON-LD Schema.org generators, CSV, and GraphML export capabilities.
