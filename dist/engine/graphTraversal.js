/**
 * ProofGraph Relationship Traversal & Path Discovery Engine
 */
export class GraphTraversalEngine {
    store;
    constructor(store) {
        this.store = store;
    }
    findRelationships(entityId, relationshipType, depth = 2) {
        const origin = this.store.getEntity(entityId);
        const filter = relationshipType ? [relationshipType.toUpperCase()] : undefined;
        const traversal = this.store.traverse(entityId, {
            maxDepth: depth,
            relationshipFilter: filter,
        });
        const direct = this.store.getRelationships(entityId, relationshipType);
        return {
            origin,
            direct_relationships: direct,
            traversal_nodes: traversal.nodes,
            traversal_edges: traversal.edges,
        };
    }
    explainConnection(sourceEntityId, targetEntityId) {
        const fromEntity = this.store.getEntity(sourceEntityId);
        const toEntity = this.store.getEntity(targetEntityId);
        if (!fromEntity || !toEntity)
            return null;
        const traversal = this.store.traverse(sourceEntityId, {
            maxDepth: 3,
            targetId: targetEntityId,
        });
        if (traversal.paths.length === 0) {
            return {
                from_entity: fromEntity,
                to_entity: toEntity,
                hops: 0,
                path_sequence: [],
                relationships: [],
                connecting_evidence: [],
                summary: `No direct or 3-hop relationship path found between ${fromEntity.name} and ${toEntity.name}.`,
            };
        }
        const shortestPath = traversal.paths[0];
        const connectingEvidence = [];
        for (const edge of shortestPath.edges) {
            if (edge.evidence_ids) {
                for (const evId of edge.evidence_ids) {
                    const ev = this.store.getEvidence(evId);
                    if (ev)
                        connectingEvidence.push(ev);
                }
            }
        }
        // Build human-readable narrative
        const steps = [];
        for (let i = 0; i < shortestPath.edges.length; i++) {
            const edge = shortestPath.edges[i];
            const src = this.store.getEntity(edge.source_id)?.name || edge.source_id;
            const tgt = this.store.getEntity(edge.target_id)?.name || edge.target_id;
            steps.push(`${src} --[${edge.relationship}]--> ${tgt}`);
        }
        return {
            from_entity: fromEntity,
            to_entity: toEntity,
            hops: shortestPath.edges.length,
            path_sequence: shortestPath.path,
            relationships: shortestPath.edges,
            connecting_evidence: connectingEvidence,
            summary: steps.join(' THEN '),
        };
    }
}
//# sourceMappingURL=graphTraversal.js.map