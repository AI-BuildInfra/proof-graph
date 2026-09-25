/**
 * ProofGraph Safe Fetch & SSRF Protection Engine
 * Prevents SSRF vulnerabilities, blocks private addresses and cloud metadata
 */
import { URL } from 'node:url';
export interface SafeFetchOptions {
    timeoutMs?: number;
    maxSizeBytes?: number;
    allowDevLocalhost?: boolean;
}
export declare class SecurityError extends Error {
    constructor(message: string);
}
export declare function isPrivateOrForbiddenHost(hostname: string, allowDevLocalhost?: boolean): boolean;
export declare function validateSafeUrl(rawUrl: string, allowDevLocalhost?: boolean): URL;
export declare function computeSha256(content: string): string;
export declare function safeFetch(rawUrl: string, options?: SafeFetchOptions): Promise<{
    text: string;
    status: number;
    contentType: string;
    contentHash: string;
    etag?: string;
}>;
