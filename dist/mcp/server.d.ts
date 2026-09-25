/**
 * ProofGraph MCP Server
 * STDIO transport server adhering to Model Context Protocol specification
 */
import { GraphStore } from '../storage/graphStore.js';
export declare class ProofGraphMCPServer {
    private store;
    private server;
    private toolHandler;
    private resourceHandler;
    private promptHandler;
    constructor(store?: GraphStore);
    private setupHandlers;
    start(): Promise<void>;
}
