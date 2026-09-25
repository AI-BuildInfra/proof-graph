/**
 * ProofGraph AI Discoverability Diagnostic Engine
 * Assesses knowledge completeness for AI agents to accurately synthesize entity information
 */
import { AIDiscoverabilityResult } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export declare class AIDiscoverabilityEngine {
    private store;
    constructor(store: GraphStore);
    evaluate(entityIdOrName: string): AIDiscoverabilityResult;
}
