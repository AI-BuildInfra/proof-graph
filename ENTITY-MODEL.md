# ProofGraph — Entity & Relationship Model

## 1. Canonical Entity Identifiers

All entities in ProofGraph must possess a deterministic, stable canonical ID format:

$$\text{entity}:\langle\text{type}\rangle:\langle\text{slug}\rangle$$

Examples:
- `entity:organization:ai-build-infra`
- `entity:project:proofgraph`
- `entity:project:humancraft`
- `entity:repository:ai-build-infra-proofgraph`
- `entity:package:npm-aibuildinfra-proofgraph`
- `entity:website:aibuildinfra-com`
- `entity:standards-body:model-context-protocol`

Slugs are lowercase, alphanumeric strings with single hyphens (`a-z0-9-`).

---

## 2. Core Entity Types

| Entity Type | Description | Example |
| :--- | :--- | :--- |
| `Organization` | Companies, foundations, non-profits, or developer groups | `entity:organization:ai-build-infra` |
| `Person` | Individual authors, contributors, or founders | `entity:person:shree-varshan` |
| `Project` | Software projects, open-source initiatives | `entity:project:proofgraph` |
| `Repository` | Git or code hosting repository | `entity:repository:github-humancraft` |
| `Package` | Distributed software library or registry entry | `entity:package:npm-proofgraph` |
| `Website` | Official domain or verified digital publication | `entity:website:aibuildinfra-com` |
| `Product` | Commercial or open software product | `entity:product:humancraft-ui` |
| `Service` | Offered technical service or consultancy | `entity:service:agentic-ai-engineering` |
| `Article` | Research paper, case study, or release note | `entity:article:proofgraph-architecture` |
| `Publication` | Established technical or academic outlet | `entity:publication:acm-digital-library` |
| `Technology` | Protocol, language, specification, or runtime | `entity:technology:model-context-protocol` |

---

## 3. Standard Relationship Taxonomy

Relationships form a typed, directed multigraph:

| Relationship | Source Type | Target Type | Semantics |
| :--- | :--- | :--- | :--- |
| `OWNS` | `Organization` / `Person` | `Website`, `Product`, `Repository` | Direct legal or administrative ownership |
| `OPERATES` | `Organization` | `Website`, `Service` | Active technical or business operation |
| `PUBLISHES` | `Organization` / `Person` | `Package`, `Article`, `Project` | Releasing software or written artifact |
| `DEVELOPS` | `Organization` / `Person` | `Project`, `Product`, `Technology` | Active engineering and software development |
| `MAINTAINS` | `Organization` / `Person` | `Repository`, `Package` | Continuous codebase maintenance |
| `AUTHORED_BY`| `Article`, `Project` | `Person`, `Organization` | Intellectual creation attribution |
| `BUILT_BY` | `Product`, `Project` | `Organization`, `Person` | Primary construction attribution |
| `ABOUT` | `Article`, `Evidence` | `Entity` | Subject matter reference |
| `MENTIONS` | `Document`, `Website` | `Entity` | Incidental or textual mention |
| `REFERENCES` | `Document`, `Evidence` | `Source`, `Entity` | Formal citation or citation link |
| `SUPPORTS` | `Evidence` | `Claim` | Corroborating verification signal |
| `CONTRADICTS` | `Evidence` | `Claim` | Conflicting verification signal |
| `VERIFIES` | `Source` | `Claim` | Authoritative verification |
| `DEPENDS_ON` | `Project`, `Package` | `Package`, `Technology` | Architectural dependency |
| `HOSTED_ON` | `Website`, `Repository` | `Organization`, `Technology` | Hosting infrastructure |
| `PUBLISHED_ON`| `Package`, `Article` | `Publication`, `Website` | Distribution platform |
| `AVAILABLE_ON`| `Product`, `Package` | `Website`, `Package` | Public registry accessibility |
| `HAS_DOCUMENTATION` | `Project` | `Website`, `Article` | Official technical documentation |
| `HAS_CASE_STUDY` | `Project`, `Service` | `Article` | Published implementation review |
| `HAS_REPOSITORY` | `Project` | `Repository` | Source code link |
| `HAS_PACKAGE` | `Project` | `Package` | Distribution package link |
| `HAS_WEBSITE` | `Organization`, `Project`| `Website` | Primary web portal link |

---

## 4. Source Trust & Classification

Sources are categorized into deterministic trust tiers:

```
[ Tier 1: Authoritative Registries & Official Sources ]
├── official_source (Verified official domain owned by the entity)
├── government_source (Official gov registry or corporate filings)
├── standards_body (W3C, IETF, ModelContextProtocol spec)
└── official_registry (Official npm, PyPI, GitHub organization)

[ Tier 2: Established Industry & Academic Corroboration ]
├── academic_source (Peer-reviewed journals, arXiv, ACM)
├── established_publication (VentureBeat, TechCrunch, Wired)
└── industry_directory (Verified Clutch, Crunchbase, GoodFirms)

[ Tier 3: Community & Secondary Sources ]
├── community_source (Dev.to, Hacker News, Reddit)
├── social_media (Verified LinkedIn, X/Twitter profile)
└── unknown_source (Unverified 3rd party web pages)
```

Each source record stores:
- `source_id`: Unique canonical identifier
- `source_type`: One of the above categories
- `url`: Exact URL of the source
- `domain`: Fully qualified domain name
- `trust_class`: Tier classification
- `reliability_score`: Float between $0.0$ and $1.0$
- `content_hash`: SHA-256 hash of the retrieved text
- `last_verified`: ISO-8601 timestamp
