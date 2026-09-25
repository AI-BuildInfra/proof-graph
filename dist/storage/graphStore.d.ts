/**
 * ProofGraph Graph Store
 * High-performance graph storage with SQLite backing and in-memory index
 */
import { Entity, Claim, Evidence, Source, Relationship, RelationshipType } from '../types/index.js';
export declare function makeCanonicalId(type: string, slugOrName: string): string;
export declare class GraphStore {
    private entities;
    private claims;
    private evidence;
    private sources;
    private relationships;
    private aliasIndex;
    constructor();
    addEntity(entity: Omit<Entity, 'created_at' | 'updated_at'> & {
        created_at?: string;
        updated_at?: string;
    }): Entity;
    getEntity(id: string): Entity | undefined;
    getAllEntities(): Entity[];
    searchEntitiesByName(query: string, limit?: number): Entity[];
    private indexEntityAliases;
    findEntityByAlias(alias: string): Entity | undefined;
    addSource(source: Source): Source;
    getSource(id: string): Source | undefined;
    getAllSources(): Source[];
    getSourceByUrl(url: string): Source | undefined;
    addEvidence(ev: Evidence): Evidence;
    getEvidence(id: string): Evidence | undefined;
    getAllEvidence(): Evidence[];
    getEvidenceForClaim(claimId: string): Evidence[];
    addClaim(claim: Omit<Claim, 'created_at' | 'updated_at'> & {
        created_at?: string;
        updated_at?: string;
    }): Claim;
    getClaim(id: string): Claim | undefined;
    getAllClaims(): Claim[];
    getClaimsForEntity(entityId: string): Claim[];
    addRelationship(rel: Relationship): Relationship;
    getRelationships(entityId: string, type?: RelationshipType, direction?: 'out' | 'in' | 'both'): Relationship[];
    getAllRelationships(): Relationship[];
    traverse(startId: string, options?: {
        maxDepth?: number;
        relationshipFilter?: string[];
        targetId?: string;
    }): {
        nodes: Entity[];
        edges: Relationship[];
        paths: Array<{
            path: string[];
            edges: Relationship[];
        }>;
    };
    clear(): void;
    toJSON(): {
        entities: Entity[];
        claims: Claim[];
        evidence: Evidence[];
        sources: Source[];
        relationships: Relationship[];
    };
    fromJSON(data: {
        entities?: Entity[];
        claims?: Claim[];
        evidence?: Evidence[];
        sources?: Source[];
        relationships?: Relationship[];
    }): void;
}
export declare const globalGraphStore: GraphStore;
