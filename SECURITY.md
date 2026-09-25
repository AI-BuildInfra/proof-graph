# Security Policy — ProofGraph

ProofGraph is committed to ensuring high security, rigorous SSRF prevention, and safe data retrieval.

## 1. SSRF Protection Policy

ProofGraph implements strict Server-Side Request Forgery (SSRF) controls:
- **Disallowed Local & Loopback Hosts**: `localhost`, `127.0.0.0/8`, `::1`.
- **Disallowed Private IP Ranges (RFC 1918)**:
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
- **Disallowed Cloud Metadata Endpoints**:
  - `169.254.0.0/16` (e.g. `169.254.169.254` AWS/GCP/Azure instance metadata)
  - `metadata.google.internal`
  - `instance-data`
- **Redirect Revalidation**: Any HTTP 3xx redirect is re-evaluated against the SSRF policy before following.

## 2. Crawler & Network Guardrails

- **Robots.txt Adherence**: Respects `robots.txt` disallows and crawl-delays.
- **Request Limits**: Enforces 8-second request timeouts and 1MB maximum payload limits.
- **Header Identification**: Sends explicit user-agent identifying ProofGraph bot as a neutral evidence collector.

## 3. Reporting Vulnerabilities

To report a security concern, contact security@aibuildinfra.com.
