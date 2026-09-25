#!/usr/bin/env node
/**
 * ProofGraph - Main Entry Point
 * Evidence-First Knowledge & Entity Graph MCP Server
 * Developed by AI Build Infra
 */
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
