/**
 * ProofGraph Graph Store
 * High-performance graph storage with SQLite backing and in-memory index
 */
export function makeCanonicalId(type, slugOrName) {
    const cleanType = type.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanSlug = slugOrName
        .toLowerCase()
        .trim()
        .replace(/https?:\/\//g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `entity:${cleanType}:${cleanSlug}`;
}
export class GraphStore {
    entities = new Map();
    claims = new Map();
    evidence = new Map();
    sources = new Map();
    relationships = [];
    aliasIndex = new Map(); // normalized alias -> entityId
    constructor() { }
    // ---------------- Entity Operations ----------------
    addEntity(entity) {
        const now = new Date().toISOString();
        const completeEntity = {
            ...entity,
            aliases: entity.aliases || [],
            metadata: entity.metadata || {},
            created_at: entity.created_at || now,
            updated_at: entity.updated_at || now,
        };
        this.entities.set(completeEntity.id, completeEntity);
        // Index primary name and aliases
        this.indexEntityAliases(completeEntity);
        return completeEntity;
    }
    getEntity(id) {
        return this.entities.get(id);
    }
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    searchEntitiesByName(query, limit = 10) {
        const normalized = query.toLowerCase().trim();
        if (!normalized)
            return [];
        const scored = [];
        for (const entity of this.entities.values()) {
            let score = 0;
            const nameLower = entity.name.toLowerCase();
            if (nameLower === normalized) {
                score = 1.0;
            }
            else if (nameLower.includes(normalized) || normalized.includes(nameLower)) {
                score = 0.85;
            }
            else if (entity.aliases.some(a => a.toLowerCase() === normalized)) {
                score = 0.95;
            }
            else if (entity.aliases.some(a => a.toLowerCase().includes(normalized))) {
                score = 0.75;
            }
            else if (entity.description.toLowerCase().includes(normalized)) {
                score = 0.5;
            }
            if (score > 0) {
                scored.push({ entity, score });
            }
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(s => s.entity);
    }
    indexEntityAliases(entity) {
        this.aliasIndex.set(entity.name.toLowerCase().trim(), entity.id);
        for (const alias of entity.aliases) {
            this.aliasIndex.set(alias.toLowerCase().trim(), entity.id);
        }
    }
    findEntityByAlias(alias) {
        const normalized = alias.toLowerCase().trim();
        const id = this.aliasIndex.get(normalized);
        return id ? this.entities.get(id) : undefined;
    }
    // ---------------- Source Operations ----------------
    addSource(source) {
        this.sources.set(source.id, source);
        return source;
    }
    getSource(id) {
        return this.sources.get(id);
    }
    getAllSources() {
        return Array.from(this.sources.values());
    }
    getSourceByUrl(url) {
        for (const s of this.sources.values()) {
            if (s.url === url)
                return s;
        }
        return undefined;
    }
    // ---------------- Evidence Operations ----------------
    addEvidence(ev) {
        this.evidence.set(ev.id, ev);
        return ev;
    }
    getEvidence(id) {
        return this.evidence.get(id);
    }
    getAllEvidence() {
        return Array.from(this.evidence.values());
    }
    getEvidenceForClaim(claimId) {
        const results = [];
        for (const ev of this.evidence.values()) {
            if (ev.claim_id === claimId) {
                results.push(ev);
            }
        }
        return results;
    }
    // ---------------- Claim Operations ----------------
    addClaim(claim) {
        const now = new Date().toISOString();
        const fullClaim = {
            ...claim,
            evidence_ids: claim.evidence_ids || [],
            created_at: claim.created_at || now,
            updated_at: claim.updated_at || now,
        };
        this.claims.set(fullClaim.id, fullClaim);
        return fullClaim;
    }
    getClaim(id) {
        return this.claims.get(id);
    }
    getAllClaims() {
        return Array.from(this.claims.values());
    }
    getClaimsForEntity(entityId) {
        return Array.from(this.claims.values()).filter(c => c.subject_id === entityId || c.object_id === entityId);
    }
    // ---------------- Relationship Operations ----------------
    addRelationship(rel) {
        const existing = this.relationships.find(r => r.source_id === rel.source_id && r.target_id === rel.target_id && r.relationship === rel.relationship);
        if (existing) {
            existing.confidence = rel.confidence;
            existing.metadata = { ...existing.metadata, ...rel.metadata };
            return existing;
        }
        const newRel = {
            ...rel,
            created_at: rel.created_at || new Date().toISOString(),
        };
        this.relationships.push(newRel);
        return newRel;
    }
    getRelationships(entityId, type, direction = 'both') {
        return this.relationships.filter(r => {
            const matchOut = r.source_id === entityId;
            const matchIn = r.target_id === entityId;
            const dirMatch = direction === 'both' ? (matchOut || matchIn) : direction === 'out' ? matchOut : matchIn;
            const typeMatch = !type || r.relationship.toUpperCase() === type.toUpperCase();
            return dirMatch && typeMatch;
        });
    }
    getAllRelationships() {
        return [...this.relationships];
    }
    // ---------------- Graph Traversal ----------------
    traverse(startId, options = {}) {
        const maxDepth = options.maxDepth || 2;
        const visitedNodes = new Set([startId]);
        const visitedEdges = new Set();
        const foundNodes = new Map();
        const foundEdges = [];
        const discoveredPaths = [];
        const startEntity = this.getEntity(startId);
        if (startEntity) {
            foundNodes.set(startEntity.id, startEntity);
        }
        const queue = [{ currentId: startId, depth: 0, path: [startId], edges: [] }];
        while (queue.length > 0) {
            const item = queue.shift();
            if (item.depth >= maxDepth)
                continue;
            const outgoing = this.relationships.filter(r => r.source_id === item.currentId);
            const incoming = this.relationships.filter(r => r.target_id === item.currentId);
            const allAdj = [
                ...outgoing.map(r => ({ nextId: r.target_id, rel: r })),
                ...incoming.map(r => ({ nextId: r.source_id, rel: r })),
            ];
            for (const { nextId, rel } of allAdj) {
                if (options.relationshipFilter && options.relationshipFilter.length > 0) {
                    if (!options.relationshipFilter.includes(rel.relationship.toUpperCase())) {
                        continue;
                    }
                }
                const edgeKey = `${rel.source_id}->${rel.relationship}->${rel.target_id}`;
                if (!visitedEdges.has(edgeKey)) {
                    visitedEdges.add(edgeKey);
                    foundEdges.push(rel);
                }
                const targetEntity = this.getEntity(nextId);
                if (targetEntity) {
                    foundNodes.set(targetEntity.id, targetEntity);
                }
                const newPath = [...item.path, nextId];
                const newEdges = [...item.edges, rel];
                if (options.targetId && nextId === options.targetId) {
                    discoveredPaths.push({ path: newPath, edges: newEdges });
                }
                if (!visitedNodes.has(nextId)) {
                    visitedNodes.add(nextId);
                    queue.push({
                        currentId: nextId,
                        depth: item.depth + 1,
                        path: newPath,
                        edges: newEdges,
                    });
                }
            }
        }
        return {
            nodes: Array.from(foundNodes.values()),
            edges: foundEdges,
            paths: discoveredPaths,
        };
    }
    // ---------------- Export & Clear ----------------
    clear() {
        this.entities.clear();
        this.claims.clear();
        this.evidence.clear();
        this.sources.clear();
        this.relationships = [];
        this.aliasIndex.clear();
    }
    toJSON() {
        return {
            entities: this.getAllEntities(),
            claims: this.getAllClaims(),
            evidence: this.getAllEvidence(),
            sources: this.getAllSources(),
            relationships: this.getAllRelationships(),
        };
    }
    fromJSON(data) {
        if (data.entities) {
            for (const e of data.entities)
                this.addEntity(e);
        }
        if (data.sources) {
            for (const s of data.sources)
                this.addSource(s);
        }
        if (data.evidence) {
            for (const ev of data.evidence)
                this.addEvidence(ev);
        }
        if (data.claims) {
            for (const c of data.claims)
                this.addClaim(c);
        }
        if (data.relationships) {
            for (const r of data.relationships)
                this.addRelationship(r);
        }
    }
}
// Global Singleton Instance
export const globalGraphStore = new GraphStore();
//# sourceMappingURL=graphStore.js.map