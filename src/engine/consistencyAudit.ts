/**
 * ProofGraph Entity Consistency Audit Engine
 * Internal diagnostic for identifying cross-platform footprint mismatches
 */

import { Entity, ConsistencyAuditResult } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';

export class ConsistencyAuditor {
  constructor(private store: GraphStore) {}

  public audit(entityIdOrName: string): ConsistencyAuditResult {
    let entity = this.store.getEntity(entityIdOrName);
    if (!entity) {
      const byName = this.store.searchEntitiesByName(entityIdOrName, 1);
      if (byName.length > 0) entity = byName[0];
    }

    if (!entity) {
      return {
        entity: entityIdOrName,
        entity_id: 'unknown',
        consistency_score: 0,
        footprint: {
          company_name: false,
          website: false,
          github_organization: false,
          npm_scope: false,
          mcp_registry: false,
          schema_org: false,
          email_domain: false,
        },
        issues: [
          {
            severity: 'high',
            component: 'Entity Index',
            message: `Entity "${entityIdOrName}" was not found in the verified graph.`,
            recommendation: 'Register the canonical entity with verified source proofs.',
          },
        ],
        verified_presence: {},
      };
    }

    const meta = entity.metadata || {};
    const issues: ConsistencyAuditResult['issues'] = [];
    const verifiedPresence: Record<string, string> = {};

    let verifiedPoints = 0;
    const totalPoints = 7;

    // 1. Company / Entity Name
    const hasName = Boolean(entity.name && entity.name.trim().length > 1);
    if (hasName) {
      verifiedPoints++;
      verifiedPresence['name'] = entity.name;
    } else {
      issues.push({
        severity: 'high',
        component: 'Name',
        message: 'Primary canonical name is missing or ambiguous.',
        recommendation: 'Set a formal canonical entity name.',
      });
    }

    // 2. Canonical Website
    const hasWebsite = Boolean(entity.canonical_url);
    if (hasWebsite) {
      verifiedPoints++;
      verifiedPresence['website'] = entity.canonical_url!;
      if (!entity.canonical_url!.startsWith('https://')) {
        issues.push({
          severity: 'medium',
          component: 'Security',
          message: 'Website is not served over secure HTTPS.',
          recommendation: 'Enforce HTTPS for canonical URLs.',
        });
      }
    } else {
      issues.push({
        severity: 'high',
        component: 'Website',
        message: 'No official canonical website URL registered.',
        recommendation: 'Link the official domain to the entity record.',
      });
    }

    // 3. GitHub Organization
    const hasGithub = Boolean(meta.github || meta.github_org);
    if (hasGithub) {
      verifiedPoints++;
      verifiedPresence['github'] = meta.github || meta.github_org;
    } else {
      issues.push({
        severity: 'low',
        component: 'GitHub Footprint',
        message: 'No official GitHub organization or repository linkage discovered.',
        recommendation: 'Add GitHub organization URL or repository links.',
      });
    }

    // 4. npm Scope / Package Ecosystem
    const hasNpm = Boolean(meta.npm || meta.npm_scope || meta.packages);
    if (hasNpm) {
      verifiedPoints++;
      verifiedPresence['npm'] = meta.npm || meta.npm_scope || 'registered-packages';
    } else {
      issues.push({
        severity: 'low',
        component: 'Package Footprint',
        message: 'No official npm scope or package registry presence verified.',
        recommendation: 'Verify package namespace ownership.',
      });
    }

    // 5. MCP Registry
    const hasMcp = Boolean(meta.mcp_name || meta.mcp_registry);
    if (hasMcp) {
      verifiedPoints++;
      verifiedPresence['mcp'] = meta.mcp_name || meta.mcp_registry;
    } else {
      issues.push({
        severity: 'low',
        component: 'MCP Registry',
        message: 'No Model Context Protocol registry identifier listed.',
        recommendation: 'Register server namespace on the official MCP registry.',
      });
    }

    // 6. Schema.org / Structured Data
    const hasSchema = Boolean(meta.schema_org || meta.structured_data);
    if (hasSchema) {
      verifiedPoints++;
      verifiedPresence['schema_org'] = 'valid-json-ld';
    } else {
      issues.push({
        severity: 'medium',
        component: 'Structured Data',
        message: 'Missing Schema.org JSON-LD markup verification.',
        recommendation: 'Implement Organization or SoftwareApplication JSON-LD schema on official pages.',
      });
    }

    // 7. Email Domain Match
    const hasEmail = Boolean(meta.email || meta.email_domain);
    if (hasEmail) {
      verifiedPoints++;
      verifiedPresence['email'] = meta.email || meta.email_domain;
    } else {
      issues.push({
        severity: 'low',
        component: 'Contact Provenance',
        message: 'No verified official email domain linked.',
        recommendation: 'Associate corporate email domain matching canonical website.',
      });
    }

    const consistencyScore = Number((verifiedPoints / totalPoints).toFixed(2));

    return {
      entity: entity.name,
      entity_id: entity.id,
      consistency_score: consistencyScore,
      footprint: {
        company_name: hasName,
        website: hasWebsite,
        github_organization: hasGithub,
        npm_scope: hasNpm,
        mcp_registry: hasMcp,
        schema_org: hasSchema,
        email_domain: hasEmail,
      },
      issues,
      verified_presence: verifiedPresence,
    };
  }
}
