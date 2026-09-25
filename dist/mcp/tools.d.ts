/**
 * ProofGraph MCP Tools Implementation
 * Provides standard Model Context Protocol tool declarations and execution handlers
 */
import { GraphStore } from '../storage/graphStore.js';
export declare const TOOL_DEFINITIONS: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            entity_id?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            entity_id: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            claim: {
                type: string;
                description: string;
            };
            entity_id: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            claim: {
                type: string;
                description: string;
            };
            max_tokens: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            entity_id?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            entity_id: {
                type: string;
                description: string;
            };
            relationship: {
                type: string;
                description: string;
            };
            depth: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            claims: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            entity_id?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            question?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            question: {
                type: string;
                description: string;
            };
            entity_id: {
                type: string;
                description: string;
            };
            claim: {
                type: string;
                description: string;
            };
            max_tokens: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            domain?: undefined;
            format?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            entity_id: {
                type: string;
                description: string;
            };
            domain: {
                type: string;
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            format?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            format: {
                type: string;
                enum: string[];
                description: string;
            };
            query?: undefined;
            limit?: undefined;
            entity_id?: undefined;
            claim?: undefined;
            max_tokens?: undefined;
            relationship?: undefined;
            depth?: undefined;
            claims?: undefined;
            question?: undefined;
            domain?: undefined;
        };
        required: string[];
    };
})[];
export declare class ToolHandler {
    private store;
    private resolver;
    private verifier;
    private traversal;
    private consistency;
    private webPresence;
    private discoverability;
    private exporter;
    constructor(store: GraphStore);
    handleTool(name: string, args: Record<string, any>): Promise<any>;
}
