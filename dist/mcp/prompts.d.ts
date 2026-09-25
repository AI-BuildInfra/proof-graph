/**
 * ProofGraph MCP Prompts Implementation
 * Provides structured prompts guiding AI agents to maintain evidence-first integrity
 */
export declare const PROMPT_DEFINITIONS: {
    name: string;
    description: string;
    arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
}[];
export declare class PromptHandler {
    getPrompt(name: string, args: Record<string, string>): {
        description: string;
        messages: {
            role: string;
            content: {
                type: string;
                text: string;
            };
        }[];
    };
}
