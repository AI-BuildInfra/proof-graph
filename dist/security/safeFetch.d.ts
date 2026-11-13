/**
 * ProofGraph Safe Fetch & SSRF Protection Engine
 * Prevents SSRF vulnerabilities, blocks private addresses and cloud metadata,
 * validates IPs post-DNS resolution to prevent DNS rebinding,
 * handles per-hop redirect re-validation, and enforces streaming size limits.
 */
import { URL } from 'node:url';
export interface SafeFetchOptions {
    timeoutMs?: number;
    maxSizeBytes?: number;
    allowDevLocalhost?: boolean;
    maxRedirects?: number;
    headers?: Record<string, string>;
}
export declare class SecurityError extends Error {
    constructor(message: string);
}
/**
 * Validates whether an IP address belongs to loopback, RFC 1918, link-local,
 * cloud metadata (169.254.169.254), or other reserved/forbidden ranges.
 */
export declare function isPrivateIp(ip: string, allowDevLocalhost?: boolean): boolean;
/**
 * Synchronous pre-check on hostname string for known forbidden names and literal IPs.
 */
export declare function isPrivateOrForbiddenHost(hostname: string, allowDevLocalhost?: boolean): boolean;
/**
 * Validates the URL scheme and hostname syntax.
 */
export declare function validateSafeUrl(rawUrl: string, allowDevLocalhost?: boolean): URL;
/**
 * Resolves all IP addresses for a hostname and verifies none resolve to private/forbidden ranges.
 * Mitigates DNS rebinding attacks and domain spoofing.
 */
export declare function resolveAndValidateDns(hostname: string, allowDevLocalhost?: boolean): Promise<string[]>;
export declare function computeSha256(content: string): string;
/**
 * Hardened safe fetch with:
 * 1. IP validation occurs strictly after DNS resolution (Anti-DNS Rebinding)
 * 2. Manual redirect mode with per-hop DNS and security re-validation
 * 3. Enforced timeout via AbortController
 * 4. Streaming response body size enforcement (prevents memory exhaustion)
 */
export declare function safeFetch(rawUrl: string, options?: SafeFetchOptions): Promise<{
    text: string;
    status: number;
    contentType: string;
    contentHash: string;
    etag?: string;
}>;
