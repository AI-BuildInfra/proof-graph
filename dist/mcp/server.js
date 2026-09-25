/**
 * ProofGraph MCP Server
 * STDIO transport server adhering to Model Context Protocol specification
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { globalGraphStore } from '../storage/graphStore.js';
import { seedStandardGraph } from '../data/seed.js';
import { TOOL_DEFINITIONS, ToolHandler } from './tools.js';
import { ResourceHandler } from './resources.js';
import { PROMPT_DEFINITIONS, PromptHandler } from './prompts.js';
export class ProofGraphMCPServer {
    store;
    server;
    toolHandler;
    resourceHandler;
    promptHandler;
    constructor(store = globalGraphStore) {
        this.store = store;
        this.server = new Server({
            name: 'io.github.AI-BuildInfra/proofgraph',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        });
        this.toolHandler = new ToolHandler(this.store);
        this.resourceHandler = new ResourceHandler(this.store);
        this.promptHandler = new PromptHandler();
        this.setupHandlers();
    }
    setupHandlers() {
        // 1. Tools Handlers
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return { tools: TOOL_DEFINITIONS };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const result = await this.toolHandler.handleTool(request.params.name, request.params.arguments || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ error: error.message || String(error) }),
                        },
                    ],
                    isError: true,
                };
            }
        });
        // 2. Resources Handlers
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return { resources: this.resourceHandler.getResourceList() };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            return this.resourceHandler.readResource(request.params.uri);
        });
        // 3. Prompts Handlers
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            return { prompts: PROMPT_DEFINITIONS };
        });
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            return this.promptHandler.getPrompt(request.params.name, request.params.arguments || {});
        });
    }
    async start() {
        seedStandardGraph(this.store);
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        // Logging to stderr to keep stdout pure for JSON-RPC MCP
        console.error('ProofGraph MCP Server active over stdio. Publisher: AI Build Infra.');
    }
}
//# sourceMappingURL=server.js.map