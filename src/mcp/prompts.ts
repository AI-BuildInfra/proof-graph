/**
 * ProofGraph MCP Prompts Implementation
 * Provides structured prompts guiding AI agents to maintain evidence-first integrity
 */

export const PROMPT_DEFINITIONS = [
  {
    name: 'verify-answer',
    description: 'Instructs the AI agent to ground an answer strictly in verified ProofGraph evidence packets.',
    arguments: [
      { name: 'question', description: 'The question being answered', required: true },
      { name: 'entity_id', description: 'Subject entity ID', required: false },
    ],
  },
  {
    name: 'research-entity',
    description: 'Guides the AI agent to produce a structured entity profile backed by traceable provenance.',
    arguments: [
      { name: 'entity_name', description: 'Name or alias of the entity to research', required: true },
    ],
  },
  {
    name: 'trace-claim',
    description: 'Instructions for generating an audit trail of why a claim is supported or refuted.',
    arguments: [
      { name: 'claim_statement', description: 'The claim to trace', required: true },
    ],
  },
  {
    name: 'build-evidence-summary',
    description: 'Generates a concise citation-first summary respecting token budget constraints.',
    arguments: [
      { name: 'topic', description: 'Topic or entity to summarize', required: true },
      { name: 'max_tokens', description: 'Maximum tokens (e.g. 1500)', required: false },
    ],
  },
  {
    name: 'detect-conflicts',
    description: 'Instructions for analyzing contradictory claims and presenting impartial discrepancies.',
    arguments: [
      { name: 'claims', description: 'Comma-separated list of conflicting claims', required: true },
    ],
  },
];

export class PromptHandler {
  public getPrompt(name: string, args: Record<string, string>) {
    switch (name) {
      case 'verify-answer':
        return {
          description: `Verification workflow for: "${args.question}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `You are answering the question: "${args.question}".
Follow the ProofGraph Evidence-First Protocol:
1. Call get_evidence_packet(question: "${args.question}") to retrieve verified evidence.
2. Only state claims marked as "supported" by high-trust sources.
3. If an assertion lacks evidence, clearly state that no verifiable proof exists.
4. Provide source attributions (Publisher, URL, Retrieval Date) for every key claim.
5. Do not hallucinate or extrapolate beyond the compact evidence packet.`,
              },
            },
          ],
        };

      case 'research-entity':
        return {
          description: `Entity research workflow for: "${args.entity_name}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform an evidence-grounded investigation into entity: "${args.entity_name}".
1. Call search_entities(query: "${args.entity_name}") to locate the canonical ID.
2. Call explain_entity(entity_id: <canonical_id>) and find_relationships(entity_id: <canonical_id>).
3. Synthesize:
   - Canonical Identity & Aliases
   - Core Products, Services, & Projects
   - Verified Relationships & Dependencies
   - Provenance chain and freshness of sources.`,
              },
            },
          ],
        };

      case 'trace-claim':
        return {
          description: `Trace claim provenance for: "${args.claim_statement}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Trace the complete cryptographic provenance for the claim: "${args.claim_statement}".
1. Call trace_claim(claim: "${args.claim_statement}").
2. Present the step-by-step chain: Claim -> Evidence Excerpt -> Source -> URL -> Timestamp -> Hash.`,
              },
            },
          ],
        };

      case 'build-evidence-summary':
        return {
          description: `Evidence summary for: "${args.topic}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Build a compact, citation-first evidence summary on: "${args.topic}" with max_tokens: ${args.max_tokens || 1500}.
1. Call get_evidence_packet(question: "${args.topic}", max_tokens: ${args.max_tokens || 1500}).
2. Format as a citation-first response where each paragraph links directly to verified source excerpts.`,
              },
            },
          ],
        };

      case 'detect-conflicts':
        return {
          description: `Discrepancy detection for claims: "${args.claims}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Analyze potential contradictions among the following claims: "${args.claims}".
1. Split the claims and call compare_claims(claims: [...]).
2. Objectively report discrepancies without manufacturing an artificial resolution unless high-trust primary evidence decisively resolves it.`,
              },
            },
          ],
        };

      default:
        throw new Error(`Unknown ProofGraph prompt: ${name}`);
    }
  }
}
