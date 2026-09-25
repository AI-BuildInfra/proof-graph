#!/usr/bin/env node
/**
 * ProofGraph - Main Entry Point
 * Evidence-First Knowledge & Entity Graph MCP Server
 * Developed by AI Build Infra
 */
import { ProofGraphMCPServer } from './mcp/server.js';
import { globalGraphStore } from './storage/graphStore.js';
// Export modules for library usage
export * from './types/index.js';
export * from './storage/graphStore.js';
export * from './engine/resolver.js';
export * from './engine/tokenOptimizer.js';
export * from './engine/claimVerifier.js';
export * from './engine/graphTraversal.js';
export * from './engine/consistencyAudit.js';
export * from './engine/webPresence.js';
export * from './engine/aiDiscoverability.js';
export * from './engine/schemaOrg.js';
export * from './engine/exporter.js';
export * from './security/safeFetch.js';
export * from './security/robots.js';
export * from './data/seed.js';
// If executed directly as CLI/MCP server
const isMain = process.argv[1] && (process.argv[1].endsWith('dist/index.js') ||
    process.argv[1].endsWith('dist\\index.js') ||
    process.argv[1].endsWith('proofgraph/dist/index.js'));
if (isMain || process.env.PROOFGRAPH_RUN_SERVER) {
    const server = new ProofGraphMCPServer(globalGraphStore);
    server.start().catch((err) => {
        console.error('Fatal error starting ProofGraph MCP server:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map