/**
 * ProofGraph MCP Resources Implementation
 */
export const RESOURCE_TEMPLATES = [
    {
        uriTemplate: 'proofgraph://entities/{id}',
        name: 'ProofGraph Entity',
        description: 'Canonical profile and relationships for a specific entity ID',
        mimeType: 'application/json',
    },
    {
        uriTemplate: 'proofgraph://claims/{id}',
        name: 'ProofGraph Claim',
        description: 'Status, confidence, and evidence pointers for a claim',
        mimeType: 'application/json',
    },
    {
        uriTemplate: 'proofgraph://sources/{id}',
        name: 'ProofGraph Source',
        description: 'Cryptographic hash, provenance, and trust classification for a source',
        mimeType: 'application/json',
    },
    {
        uriTemplate: 'proofgraph://relationships/{id}',
        name: 'ProofGraph Relationship',
        description: 'Direct and multi-hop relationships for an entity',
        mimeType: 'application/json',
    },
];
export class ResourceHandler {
    store;
    constructor(store) {
        this.store = store;
    }
    getResourceList() {
        const resources = [];
        for (const e of this.store.getAllEntities()) {
            resources.push({
                uri: `proofgraph://entities/${encodeURIComponent(e.id)}`,
                name: `Entity: ${e.name}`,
                description: e.description,
                mimeType: 'application/json',
            });
        }
        for (const c of this.store.getAllClaims()) {
            resources.push({
                uri: `proofgraph://claims/${encodeURIComponent(c.id)}`,
                name: `Claim: ${c.statement}`,
                description: `Status: ${c.status} (${c.confidence})`,
                mimeType: 'application/json',
            });
        }
        return resources;
    }
    readResource(uri) {
        const parsed = new URL(uri);
        const host = parsed.hostname || parsed.host;
        const path = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
        if (host === 'entities') {
            const entity = this.store.getEntity(path) || this.store.findEntityByAlias(path);
            if (!entity)
                throw new Error(`Entity resource not found: ${uri}`);
            const rels = this.store.getRelationships(entity.id);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({ entity, relationships: rels }, null, 2),
                    },
                ],
            };
        }
        if (host === 'claims') {
            const claim = this.store.getClaim(path);
            if (!claim)
                throw new Error(`Claim resource not found: ${uri}`);
            const evs = this.store.getEvidenceForClaim(claim.id);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({ claim, evidence: evs }, null, 2),
                    },
                ],
            };
        }
        if (host === 'sources') {
            const source = this.store.getSource(path);
            if (!source)
                throw new Error(`Source resource not found: ${uri}`);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(source, null, 2),
                    },
                ],
            };
        }
        if (host === 'relationships') {
            const rels = this.store.getRelationships(path);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({ entity_id: path, relationships: rels }, null, 2),
                    },
                ],
            };
        }
        throw new Error(`Unsupported resource URI: ${uri}`);
    }
}
//# sourceMappingURL=resources.js.map