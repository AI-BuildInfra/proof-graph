/**
 * ProofGraph Safe Fetch & SSRF Protection Engine
 * Prevents SSRF vulnerabilities, blocks private addresses and cloud metadata
 */

import { URL } from 'node:url';
import { createHash } from 'node:crypto';

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  allowDevLocalhost?: boolean;
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export function isPrivateOrForbiddenHost(hostname: string, allowDevLocalhost = false): boolean {
  const host = hostname.toLowerCase().trim();

  if (allowDevLocalhost && (host === 'localhost' || host === '127.0.0.1')) {
    return false;
  }

  // Exact hostname blocks
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === 'metadata.google.internal' ||
    host === 'instance-data' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 Pattern checks
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some(o => o < 0 || o > 255)) return true;

    const [o1, o2, o3, o4] = octets;

    // Loopback: 127.0.0.0/8
    if (o1 === 127) return true;
    // Private RFC 1918: 10.0.0.0/8
    if (o1 === 10) return true;
    // Private RFC 1918: 172.16.0.0/12
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // Private RFC 1918: 192.168.0.0/16
    if (o1 === 192 && o2 === 168) return true;
    // Link-local / Cloud metadata: 169.254.0.0/16 (e.g. 169.254.169.254)
    if (o1 === 169 && o2 === 254) return true;
    // Current network / Zero: 0.0.0.0/8
    if (o1 === 0) return true;
    // Carrier Grade NAT: 100.64.0.0/10
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
  }

  // IPv6 prefix checks
  if (host.startsWith('fe80:') || host.startsWith('fc00:') || host.startsWith('fd00:') || host === '::1') {
    return true;
  }

  return false;
}

export function validateSafeUrl(rawUrl: string, allowDevLocalhost = false): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
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

export function computeSha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ text: string; status: number; contentType: string; contentHash: string; etag?: string }> {
  const parsed = validateSafeUrl(rawUrl, options.allowDevLocalhost);
  const timeoutMs = options.timeoutMs || 8000;
  const maxSizeBytes = options.maxSizeBytes || 1024 * 1024; // 1MB limit

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProofGraph-Bot/1.0 (+https://aibuildinfra.com/proofgraph/bot; neutral-evidence-collector)',
        'Accept': 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9',
      },
      redirect: 'follow',
    });

    // Revalidate redirected final URL
    const finalUrl = new URL(response.url);
    if (isPrivateOrForbiddenHost(finalUrl.hostname, options.allowDevLocalhost)) {
      throw new SecurityError(`Redirect target "${finalUrl.hostname}" violates SSRF security policy.`);
    }

    const contentType = response.headers.get('content-type') || '';
    const etag = response.headers.get('etag') || undefined;

    const text = await response.text();
    if (text.length > maxSizeBytes) {
      throw new Error(`Response body exceeds maximum allowed size (${maxSizeBytes} bytes).`);
    }

    const contentHash = computeSha256(text);

    return {
      text,
      status: response.status,
      contentType,
      contentHash,
      etag,
    };
  } finally {
    clearTimeout(timer);
  }
}
