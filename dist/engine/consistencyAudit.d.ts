/**
 * ProofGraph Entity Consistency Audit Engine
 * Internal diagnostic for identifying cross-platform footprint mismatches
 */
import { ConsistencyAuditResult } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export declare class ConsistencyAuditor {
    private store;
    constructor(store: GraphStore);
    audit(entityIdOrName: string): ConsistencyAuditResult;
}
