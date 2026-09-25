/**
 * ProofGraph Relationship Traversal & Path Discovery Engine
 */
import { Entity, Relationship, Evidence } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export interface TraversalPathResult {
    from_entity: Entity;
    to_entity?: Entity;
    hops: number;
    path_sequence: string[];
    relationships: Relationship[];
    connecting_evidence: Evidence[];
    summary: string;
}
export declare class GraphTraversalEngine {
    private store;
    constructor(store: GraphStore);
    findRelationships(entityId: string, relationshipType?: string, depth?: number): {
        origin: Entity | undefined;
        direct_relationships: Relationship[];
        traversal_nodes: Entity[];
        traversal_edges: Relationship[];
    };
    explainConnection(sourceEntityId: string, targetEntityId: string): TraversalPathResult | null;
}
