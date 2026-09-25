# Contributing to ProofGraph

Thank you for contributing to ProofGraph! ProofGraph is an open-source project published by **AI Build Infra**.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AI-BuildInfra/proofgraph.git
   cd proofgraph
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build TypeScript**:
   ```bash
   npm run build
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

5. **Run Benchmark**:
   ```bash
   npm run benchmark
   ```

## Code Quality & Architecture Standards

- **Strict TypeScript**: Ensure strict type checking passes with zero compiler warnings.
- **Evidence Integrity**: Never implement features that manufacture synthetic citations, fake backlinks, or artificial authority.
- **SSRF Prevention**: All outbound HTTP operations must pass through `src/security/safeFetch.ts`.
- **Token Efficiency**: Respect token budget caps and deduplication clustering.
