/**
 * ProofGraph Lightweight Developer Dashboard
 * Built with native Node.js HTTP server and responsive vanilla UI
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { globalGraphStore } from '../storage/graphStore.js';
import { seedStandardGraph } from '../data/seed.js';
import { ConsistencyAuditor } from '../engine/consistencyAudit.js';
import { AIDiscoverabilityEngine } from '../engine/aiDiscoverability.js';
import { GraphExporter } from '../engine/exporter.js';

export function startDashboard(port = 3456): void {
  seedStandardGraph(globalGraphStore);

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/graph') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(globalGraphStore.toJSON()));
      return;
    }

    if (url.pathname === '/api/audit') {
      const entityId = url.searchParams.get('entity') || 'entity:organization:ai-build-infra';
      const auditor = new ConsistencyAuditor(globalGraphStore);
      const discoverability = new AIDiscoverabilityEngine(globalGraphStore);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          consistency: auditor.audit(entityId),
          discoverability: discoverability.evaluate(entityId),
        })
      );
      return;
    }

    // Serve HTML Dashboard
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml());
  });

  server.listen(port, () => {
    console.log(`\n ProofGraph Developer Dashboard running at http://localhost:${port}`);
  });
}

function renderDashboardHtml(): string {
  const entities = globalGraphStore.getAllEntities();
  const claims = globalGraphStore.getAllClaims();
  const sources = globalGraphStore.getAllSources();
  const relationships = globalGraphStore.getAllRelationships();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofGraph Dashboard | AI Build Infra</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-bright: #f0f6fc;
      --accent: #58a6ff;
      --success: #3fb950;
      --warning: #d29922;
      --danger: #f85149;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-bright);
    }
    .logo span { color: var(--accent); }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      background: #1f6feb26;
      color: var(--accent);
      border: 1px solid #388bfd4d;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }
    .metric-card .num {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-bright);
    }
    .metric-card .label {
      font-size: 0.85rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    h2 {
      font-size: 1.1rem;
      color: var(--text-bright);
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th, td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
    }
    th { color: #8b949e; font-weight: 600; }
    .status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .supported { background: #23863626; color: var(--success); border: 1px solid #2ea0434d; }
    .conflicting { background: #bb800926; color: var(--warning); border: 1px solid #d299224d; }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.85rem;
      background: rgba(110,118,129,0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="logo">Proof<span>Graph</span></div>
      <p style="font-size: 0.85rem; color: #8b949e;">Evidence-First Entity & Knowledge Graph MCP Server • AI Build Infra</p>
    </div>
    <span class="badge">STDIO MCP Active</span>
  </header>

  <div class="grid">
    <div class="metric-card">
      <div class="num">${entities.length}</div>
      <div class="label">Canonical Entities</div>
    </div>
    <div class="metric-card">
      <div class="num">${claims.length}</div>
      <div class="label">Verified Claims</div>
    </div>
    <div class="metric-card">
      <div class="num">${sources.length}</div>
      <div class="label">Authoritative Sources</div>
    </div>
    <div class="metric-card">
      <div class="num">${relationships.length}</div>
      <div class="label">Graph Relationships</div>
    </div>
  </div>

  <div class="section">
    <h2>Canonical Entities</h2>
    <table>
      <thead>
        <tr>
          <th>Canonical ID</th>
          <th>Name</th>
          <th>Type</th>
          <th>Aliases</th>
          <th>Canonical URL</th>
        </tr>
      </thead>
      <tbody>
        ${entities
          .map(
            e => `<tr>
              <td><code>${e.id}</code></td>
              <td style="color: var(--text-bright); font-weight: 600;">${e.name}</td>
              <td><span class="badge">${e.type}</span></td>
              <td>${e.aliases.join(', ') || '—'}</td>
              <td><a href="${e.canonical_url || '#'}" target="_blank" style="color: var(--accent);">${e.canonical_url || '—'}</a></td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Verified Claims & Confidence</h2>
    <table>
      <thead>
        <tr>
          <th>Subject ID</th>
          <th>Claim Statement</th>
          <th>Status</th>
          <th>Confidence</th>
          <th>Proofs</th>
        </tr>
      </thead>
      <tbody>
        ${claims
          .map(
            c => `<tr>
              <td><code>${c.subject_id}</code></td>
              <td style="color: var(--text-bright);">${c.statement}</td>
              <td><span class="status-pill ${c.status}">${c.status.toUpperCase()}</span></td>
              <td>${(c.confidence * 100).toFixed(0)}%</td>
              <td>${c.evidence_ids.length} Excerpt(s)</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Authoritative Sources & Hashes</h2>
    <table>
      <thead>
        <tr>
          <th>Publisher</th>
          <th>Trust Class</th>
          <th>URL</th>
          <th>Reliability</th>
          <th>SHA-256 Hash</th>
        </tr>
      </thead>
      <tbody>
        ${sources
          .map(
            s => `<tr>
              <td style="color: var(--text-bright); font-weight: 600;">${s.publisher}</td>
              <td><span class="badge">${s.trust_class}</span></td>
              <td><a href="${s.url}" target="_blank" style="color: var(--accent);">${s.url}</a></td>
              <td>${(s.reliability_score * 100).toFixed(0)}%</td>
              <td><code>${s.content_hash.substring(0, 16)}...</code></td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

if (process.argv[1] && process.argv[1].includes('dashboard')) {
  const port = Number(process.env.PORT) || 3456;
  startDashboard(port);
}
