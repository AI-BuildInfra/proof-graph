/**
 * ProofGraph Safe Fetch & SSRF Protection Engine
 * Prevents SSRF vulnerabilities, blocks private addresses and cloud metadata,
 * validates IPs post-DNS resolution to prevent DNS rebinding,
 * handles per-hop redirect re-validation, and enforces streaming size limits.
 */
import { URL } from 'node:url';
import { createHash } from 'node:crypto';
import dns from 'node:dns/promises';
export class SecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecurityError';
    }
}
/**
 * Validates whether an IP address belongs to loopback, RFC 1918, link-local,
 * cloud metadata (169.254.169.254), or other reserved/forbidden ranges.
 */
export function isPrivateIp(ip, allowDevLocalhost = false) {
    const trimmed = ip.trim().toLowerCase();
    // Allow localhost only if explicitly enabled in local development mode
    if (allowDevLocalhost && (trimmed === '127.0.0.1' || trimmed === '::1')) {
        return false;
    }
    // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
    if (trimmed.startsWith('::ffff:')) {
        const rawV4 = trimmed.substring(7);
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rawV4)) {
            return isPrivateIp(rawV4, allowDevLocalhost);
        }
        return true; // Disallow non-standard mapped representations
    }
    // IPv6 Checks
    if (trimmed.includes(':')) {
        if (trimmed === '::1' || trimmed === '::')
            return true;
        if (trimmed.startsWith('fe80:'))
            return true; // Link-local
        if (trimmed.startsWith('fc') || trimmed.startsWith('fd'))
            return true; // Unique Local Address (ULA)
        if (trimmed.startsWith('2001:db8:'))
            return true; // Documentation
        if (trimmed.startsWith('64:ff9b:'))
            return true; // IPv4/IPv6 translation
        return false;
    }
    // IPv4 Checks
    const parts = trimmed.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return true; // Malformed IP
    }
    const [o1, o2] = parts;
    // 0.0.0.0/8 (Current network)
    if (o1 === 0)
        return true;
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127)
        return true;
    // 10.0.0.0/8 (RFC 1918 Private)
    if (o1 === 10)
        return true;
    // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31)
        return true;
    // 192.168.0.0/16 (RFC 1918 Private)
    if (o1 === 192 && o2 === 168)
        return true;
    // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. AWS/GCP/Azure 169.254.169.254)
    if (o1 === 169 && o2 === 254)
        return true;
    // 100.64.0.0/10 (Shared Address Space / Carrier Grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127)
        return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (o1 === 192 && o2 === 0 && parts[2] === 0)
        return true;
    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
    if (o1 === 192 && o2 === 0 && parts[2] === 2)
        return true;
    if (o1 === 198 && o2 === 51 && parts[2] === 100)
        return true;
    if (o1 === 203 && o2 === 0 && parts[2] === 113)
        return true;
    // 198.18.0.0/15 (Benchmarking)
    if (o1 === 198 && (o2 === 18 || o2 === 19))
        return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (o1 >= 224)
        return true;
    return false;
}
/**
 * Synchronous pre-check on hostname string for known forbidden names and literal IPs.
 */
export function isPrivateOrForbiddenHost(hostname, allowDevLocalhost = false) {
    const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, ''); // strip IPv6 brackets if present
    if (allowDevLocalhost && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
        return false;
    }
    // Exact hostname blocks
    if (host === 'localhost' ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host === 'metadata.google.internal' ||
        host === 'instance-data' ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        host.endsWith('.localhost')) {
        return true;
    }
    // Check if hostname is an IP literal
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) || host.includes(':')) {
        return isPrivateIp(host, allowDevLocalhost);
    }
    return false;
}
/**
 * Validates the URL scheme and hostname syntax.
 */
export function validateSafeUrl(rawUrl, allowDevLocalhost = false) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    }
    catch {
        throw new SecurityError(`Invalid URL format: ${rawUrl}`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new SecurityError(`Disallowed protocol "${parsed.protocol}". Only http/https are permitted.`);
    }
    if (isPrivateOrForbiddenHost(parsed.hostname, allowDevLocalhost)) {
        throw new SecurityError(`Access to host "${parsed.hostname}" is forbidden by ProofGraph SSRF policy.`);
    }
    return parsed;
}
/**
 * Resolves all IP addresses for a hostname and verifies none resolve to private/forbidden ranges.
 * Mitigates DNS rebinding attacks and domain spoofing.
 */
export async function resolveAndValidateDns(hostname, allowDevLocalhost = false) {
    const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');
    if (isPrivateOrForbiddenHost(host, allowDevLocalhost)) {
        throw new SecurityError(`Host "${hostname}" violates ProofGraph SSRF policy.`);
    }
    // If already an IP literal, validate directly
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) || host.includes(':')) {
        if (isPrivateIp(host, allowDevLocalhost)) {
            throw new SecurityError(`Target IP "${host}" belongs to a private or forbidden network range.`);
        }
        return [host];
    }
    // Perform DNS resolution for all records (IPv4 & IPv6)
    let addresses;
    try {
        addresses = await dns.lookup(host, { all: true });
    }
    catch (err) {
        throw new SecurityError(`DNS resolution failed for host "${hostname}": ${err?.message || err}`);
    }
    if (!addresses || addresses.length === 0) {
        throw new SecurityError(`No DNS records found for host "${hostname}".`);
    }
    for (const record of addresses) {
        if (isPrivateIp(record.address, allowDevLocalhost)) {
            throw new SecurityError(`DNS resolution for "${hostname}" resolved to forbidden address "${record.address}" (SSRF/DNS Rebinding mitigation).`);
        }
    }
    return addresses.map(r => r.address);
}
export function computeSha256(content) {
    return createHash('sha256').update(content, 'utf8').digest('hex');
}
/**
 * Hardened safe fetch with:
 * 1. IP validation occurs strictly after DNS resolution (Anti-DNS Rebinding)
 * 2. Manual redirect mode with per-hop DNS and security re-validation
 * 3. Enforced timeout via AbortController
 * 4. Streaming response body size enforcement (prevents memory exhaustion)
 */
export async function safeFetch(rawUrl, options = {}) {
    const timeoutMs = options.timeoutMs ?? 8000;
    const maxSizeBytes = options.maxSizeBytes ?? 1024 * 1024; // 1MB default limit
    const maxRedirects = options.maxRedirects ?? 5;
    const allowDevLocalhost = options.allowDevLocalhost ?? false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let currentUrl = validateSafeUrl(rawUrl, allowDevLocalhost);
    let redirectCount = 0;
    try {
        while (true) {
            // 1. Pre-connection DNS resolution & validation at each hop
            await resolveAndValidateDns(currentUrl.hostname, allowDevLocalhost);
            // 2. Fetch with manual redirect mode to re-validate every hop
            const response = await fetch(currentUrl.toString(), {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'ProofGraph-Bot/1.0 (+https://aibuildinfra.com/proofgraph/bot; neutral-evidence-collector)',
                    'Accept': 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9',
                    ...(options.headers || {}),
                },
                redirect: 'manual',
            });
            // 3. Handle redirects manually
            if ([301, 302, 303, 307, 308].includes(response.status)) {
                redirectCount++;
                if (redirectCount > maxRedirects) {
                    throw new SecurityError(`Redirect limit exceeded (${maxRedirects} hops) for "${rawUrl}".`);
                }
                const locationHeader = response.headers.get('location');
                if (!locationHeader) {
                    throw new SecurityError(`Redirect response (${response.status}) missing "Location" header.`);
                }
                // Resolve redirect URL relative to current URL
                let nextUrl;
                try {
                    nextUrl = new URL(locationHeader, currentUrl);
                }
                catch {
                    throw new SecurityError(`Malformed redirect Location header: "${locationHeader}".`);
                }
                // Validate scheme and hostname of redirect destination
                currentUrl = validateSafeUrl(nextUrl.toString(), allowDevLocalhost);
                continue;
            }
            // 4. Stream response body chunk-by-chunk to enforce maxSizeBytes strictly
            const contentType = response.headers.get('content-type') || '';
            const etag = response.headers.get('etag') || undefined;
            let text = '';
            if (response.body) {
                const reader = response.body.getReader();
                let totalBytes = 0;
                const chunks = [];
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        if (value) {
                            totalBytes += value.byteLength;
                            if (totalBytes > maxSizeBytes) {
                                await reader.cancel();
                                throw new SecurityError(`Response body exceeds maximum allowed size of ${maxSizeBytes} bytes.`);
                            }
                            chunks.push(value);
                        }
                    }
                }
                finally {
                    reader.releaseLock();
                }
                const totalBuffer = Buffer.concat(chunks);
                text = totalBuffer.toString('utf8');
            }
            const contentHash = computeSha256(text);
            return {
                text,
                status: response.status,
                contentType,
                contentHash,
                etag,
            };
        }
    }
    finally {
        clearTimeout(timer);
    }
}
//# sourceMappingURL=safeFetch.js.map