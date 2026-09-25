/**
 * ProofGraph Multi-Format Exporter
 * Supports JSON, JSON-LD, CSV, and GraphML
 */
import { GraphStore } from '../storage/graphStore.js';
export declare class GraphExporter {
    private store;
    constructor(store: GraphStore);
    toJSON(): string;
    toJSONLD(): string;
    toCSV(): {
        entitiesCSV: string;
        relationshipsCSV: string;
        claimsCSV: string;
    };
    toGraphML(): string;
}
