/**
 * ProofGraph Entity Resolution Engine
 * Multi-signal entity resolution without false-positive merges
 */
import { Entity, EntityResolutionCandidate } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export declare function jaroWinklerSimilarity(s1: string, s2: string): number;
export declare function normalizeSlug(text: string): string;
export declare class EntityResolver {
    private store;
    constructor(store: GraphStore);
    resolve(query: {
        name?: string;
        domain?: string;
        github?: string;
        npm?: string;
        email?: string;
    }): EntityResolutionCandidate[];
    findCanonical(query: string): Entity | undefined;
}
