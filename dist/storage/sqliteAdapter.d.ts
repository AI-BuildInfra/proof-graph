/**
 * ProofGraph SQLite Storage Adapter
 * Provides persistent SQLite storage using node:sqlite DatabaseSync
 */
import { GraphStore } from './graphStore.js';
export declare class SQLiteAdapter {
    private dbPath;
    private db;
    constructor(dbPath?: string);
    init(): Promise<void>;
    private createSchema;
    saveGraph(store: GraphStore): void;
    loadGraph(store: GraphStore): void;
}
