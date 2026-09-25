# ProofGraph — Evidence & Provenance Model

## 1. Grounded Verification Principles

1. **No Artificial Authority**: A claim is never marked as supported unless an authoritative source explicitly contains verified corroborating text.
2. **Cryptographic Content Hashes**: Every evidence excerpt is pinned to a SHA-256 hash computed directly from the source body.
3. **Temporal Validity & Freshness**: All evidence records track `retrieved_at` and `last_verified` timestamps to prevent stale assertions.

---

## 2. Evidence Record Schema

```typescript
interface Evidence {
  id: string;                      // ev:proofgraph-github
  claim_id?: string;               // claim:aibuildinfra-develops-mcp
  source_id: string;               // source:github:ai-build-infra
  source_type: SourceTrustClass;   // github_repository | official_registry | ...
  url: string;                     // https://github.com/AI-BuildInfra/proofgraph
  title: string;                   // Official Repository
  publisher: string;               // GitHub / AI Build Infra
  retrieved_at: string;            // ISO-8601 Timestamp
  content_hash: string;            // SHA-256 digest
  excerpt: string;                 // Verbatim corroborating excerpt
  supports_claim: boolean;         // True if supporting, False if contradicting
  confidence: number;              // 0.0 - 1.0
  directness: number;              // 0.0 - 1.0
  corroborating_sources?: string[];// Secondary source IDs
}
```

---

## 3. Provenance Chain Architecture

When an AI agent or auditor asks *"Why does ProofGraph believe this?"*, ProofGraph provides an unbroken, verifiable audit trail:

$$\text{Claim Statement} \longrightarrow \text{Evidence Excerpt} \longrightarrow \text{Source Identity} \longrightarrow \text{Canonical URL} \longrightarrow \text{Timestamp} \longrightarrow \text{SHA-256}$$
