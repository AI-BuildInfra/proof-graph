# ProofGraph — Architecture Specification

## 1. Architectural Philosophy

ProofGraph is built on the principle of **Minimum Sufficient Context backed by Cryptographic Provenance**.
Modern LLM retrieval systems suffer from context pollution, token bloat, and hallucination amplification. ProofGraph replaces fuzzy unverified retrieval with a verified entity and evidence graph.

```
Agent Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                       MCP Layer                             │
│   (Tools: get_evidence_packet, verify_claim, trace_claim)   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Query & Retrieval Engine                   │
│   ┌───────────────────────┐     ┌───────────────────────┐   │
│   │   Entity Resolution   │     │    Graph Traversal    │   │
│   │ (Multi-Signal Match)  │     │   (1/2/3 Hop Paths)   │   │
│   └───────────┬───────────┘     └───────────┬───────────┘   │
│               │                             │               │
│               └──────────────┬──────────────┘               │
│                              ▼                              │
│                ┌───────────────────────────┐                │
│                │  Evidence Ranking Engine  │                │
│                └─────────────┬─────────────┘                │
│                              ▼                              │
│                ┌───────────────────────────┐                │
│                │  Token Budget Optimizer   │                │
│                │  (Deduplication & Pack)   │                │
│                └─────────────┬─────────────┘                │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Graph Storage Layer                      │
│             (SQLite / In-Memory Graph Index)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Storage Layer (`src/storage/`)
- **Engine**: SQLite (via Node 22 `node:sqlite` or in-memory structured stores).
- **Relational Schema**:
  - `entities`: Canonical ID, name, entity type, description, canonical URL, aliases JSON, metadata JSON, timestamps.
  - `claims`: Canonical ID, subject ID, predicate, object ID, object value, statement, status, confidence.
  - `sources`: Source ID, source type, URL, domain, title, publisher, trust class, reliability score, etag, content hash.
  - `evidence`: Evidence ID, claim ID, source ID, excerpt, directness, supports_claim, retrieval date, content hash, confidence score.
  - `relationships`: Source entity ID, target entity ID, relationship type, confidence, metadata.

### 2.2 Entity Resolution Engine (`src/engine/resolver.ts`)
Resolves freeform text or partial identifiers to canonical entities without false-positive merges.
- Signal 1: Normalized string metric (Jaro-Winkler & Levenshtein distance).
- Signal 2: Exact domain and subdomain matching.
- Signal 3: GitHub organization and repository ownership.
- Signal 4: Package registry namespaces (npm `@scope`, PyPI, Crates).
- Signal 5: Social / Registry IDs (MCP Registry, LinkedIn, Wikidata).
- Aggregate confidence score:
  $$\text{Score} = \sum w_i \cdot s_i$$
  with dynamic gate thresholds (minimum $\ge 0.75$ for candidate match, $\ge 0.90$ for auto-link).

### 2.3 Evidence Ranking & Token Optimizer (`src/engine/tokenOptimizer.ts`)
- **Ranking Formula**:
  $$\text{Rank}(E) = \alpha \cdot \text{Trust}(S) + \beta \cdot \text{Relevance}(E, C) + \gamma \cdot \text{Freshness}(S) + \delta \cdot \text{Directness}(E) + \epsilon \cdot \text{Corroboration}(E)$$
- **Token Budget Packing**:
  Given token budget $B$ (default 1500 tokens):
  - Entity summary: $\approx 10\%$
  - Claim definitions: $\approx 13\%$
  - Primary evidence excerpts: $\approx 40\%$
  - Secondary corroboration references: $\approx 23\%$
  - Provenance trails: $\approx 7\%$
  - Safety buffer: $\approx 7\%$
- **Deduplication**: Semantic excerpt clustering collapses repetitive verbatim quotes into one primary quote plus a list of corroborating source IDs.

### 2.4 Safe Crawler & SSRF Protection (`src/security/safeFetch.ts`)
- Strict IP address resolution validation.
- Deny list: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (Cloud metadata `169.254.169.254`), `::1`, `fc00::/7`, `fe80::/10`.
- Rate limiting per domain and respect for standard `robots.txt` specifications.

---

## 3. Provenance Chain Architecture

ProofGraph guarantees complete auditability:
```
Answer Statement ──► Claim (status: supported)
                          │
                          ▼
                     Evidence (excerpt, directness: 0.95)
                          │
                          ▼
                     Source (trust_class: official_registry)
                          │
                          ▼
                     URL (https://registry.modelcontextprotocol.io/...)
                          │
                          ▼
                     Verification (timestamp: 2026-09-25T16:00:00Z, sha256: 8f2c...)
```
