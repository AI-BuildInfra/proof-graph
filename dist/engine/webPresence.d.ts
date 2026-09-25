/**
 * ProofGraph Web Presence & Digital Footprint Analyzer
 */
import { Source } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';
export interface WebPresenceAnalysis {
    entity_id: string;
    entity_name: string;
    domain?: string;
    breakdown: {
        official_references: Source[];
        third_party_references: Source[];
        github_references: Source[];
        package_references: Source[];
        registry_references: Source[];
        documentation_references: Source[];
        social_references: Source[];
        case_studies: Source[];
    };
    detected_anomalies: string[];
    summary: {
        total_sources: number;
        official_count: number;
        third_party_count: number;
        footprint_diversity: number;
    };
}
export declare class WebPresenceAnalyzer {
    private store;
    constructor(store: GraphStore);
    analyze(entityIdOrName: string, domainHint?: string): WebPresenceAnalysis;
}
