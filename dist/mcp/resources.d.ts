/**
 * ProofGraph MCP Resources Implementation
 */
import { GraphStore } from '../storage/graphStore.js';
export declare const RESOURCE_TEMPLATES: {
    uriTemplate: string;
    name: string;
    description: string;
    mimeType: string;
}[];
export declare class ResourceHandler {
    private store;
    constructor(store: GraphStore);
    getResourceList(): {
        uri: string;
        name: string;
        description: string;
        mimeType: string;
    }[];
    readResource(uri: string): {
        contents: Array<{
            uri: string;
            mimeType: string;
            text: string;
        }>;
    };
}
