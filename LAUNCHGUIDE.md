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

## Category
AI & ML

## Features
- Evidence-first claim verification with cryptographic SHA-256 provenance
- Token budget optimizer achieving up to 90.7% context reduction
- Deterministic multi-signal entity and alias resolution
- Objective contradiction and discrepancy detection across conflicting sources
- Multi-hop graph traversal for 1-hop, 2-hop, and 3-hop relationship paths
- Structured data export to Schema.org JSON-LD, GraphML, and CSV

## Getting Started
- "What does AI Build Infra develop, and what verified evidence supports this?"
- "Verify the claim: HumanCraft is published as a Model Context Protocol server."
- Tool: `get_evidence_packet` — Returns the smallest verified proof packet sufficient to answer a prompt.
- Tool: `verify_claim` — Evaluates factual claims against evidence sources.

## Tags
mcp, mcp-server, model-context-protocol, knowledge-graph, entity-graph, claim-verification, provenance, context-optimization, token-budget, antigravity

## Documentation URL
https://aibuildinfra.com/proofgraph

## Health Check URL
