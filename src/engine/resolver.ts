/**
 * ProofGraph Entity Resolution Engine
 * Multi-signal entity resolution without false-positive merges
 */

import { Entity, EntityResolutionCandidate } from '../types/index.js';
import { GraphStore } from '../storage/graphStore.js';

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  if (str1 === str2) return 1.0;
  if (!str1.length || !str2.length) return 0.0;

  const matchDistance = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  const str1Matches = new Array(str1.length).fill(false);
  const str2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (str2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3.0;

  // Prefix scale for Winkler
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(str1.length, str2.length)); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '')
    .trim();
}

export class EntityResolver {
  constructor(private store: GraphStore) {}

  public resolve(query: {
    name?: string;
    domain?: string;
    github?: string;
    npm?: string;
    email?: string;
  }): EntityResolutionCandidate[] {
    const allEntities = this.store.getAllEntities();
    const candidates: EntityResolutionCandidate[] = [];

    const targetName = query.name || '';
    const normTargetName = normalizeSlug(targetName);
    const targetDomain = query.domain ? query.domain.toLowerCase().replace(/^www\./, '') : '';
    const targetGithub = query.github ? query.github.toLowerCase() : '';
    const targetNpm = query.npm ? query.npm.toLowerCase() : '';

    for (const entity of allEntities) {
      // 1. Name Signal
      let maxNameScore = 0;
      const entityNames = [entity.name, ...entity.aliases];

      for (const name of entityNames) {
        if (name.toLowerCase() === targetName.toLowerCase()) {
          maxNameScore = 1.0;
          break;
        }
        const normEntityName = normalizeSlug(name);
        if (normEntityName === normTargetName && normTargetName.length > 2) {
          maxNameScore = Math.max(maxNameScore, 0.96);
        }
        const sim = jaroWinklerSimilarity(name, targetName);
        maxNameScore = Math.max(maxNameScore, sim);
      }

      // 2. Domain Signal
      let domainScore = 0;
      const entityUrl = entity.canonical_url || (entity.metadata?.domain as string) || '';
      if (targetDomain && entityUrl) {
        const cleanEntityDomain = entityUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        if (cleanEntityDomain === targetDomain) {
          domainScore = 1.0;
        } else if (cleanEntityDomain.includes(targetDomain) || targetDomain.includes(cleanEntityDomain)) {
          domainScore = 0.8;
        }
      }

      // 3. GitHub Signal
      let githubScore = 0;
      const entityGithub = (entity.metadata?.github as string) || (entity.metadata?.github_org as string) || '';
      if (targetGithub && entityGithub) {
        if (entityGithub.toLowerCase().includes(targetGithub) || targetGithub.includes(entityGithub.toLowerCase())) {
          githubScore = 1.0;
        }
      }

      // 4. npm Scope Signal
      let npmScore = 0;
      const entityNpm = (entity.metadata?.npm as string) || (entity.metadata?.npm_scope as string) || '';
      if (targetNpm && entityNpm) {
        if (entityNpm.toLowerCase().includes(targetNpm) || targetNpm.includes(entityNpm.toLowerCase())) {
          npmScore = 1.0;
        }
      }

      // Weighted composite score calculation
      let totalWeight = 0;
      let weightedSum = 0;

      if (targetName) {
        const weight = 0.45;
        weightedSum += maxNameScore * weight;
        totalWeight += weight;
      }
      if (targetDomain) {
        const weight = 0.25;
        weightedSum += domainScore * weight;
        totalWeight += weight;
      }
      if (targetGithub) {
        const weight = 0.15;
        weightedSum += githubScore * weight;
        totalWeight += weight;
      }
      if (targetNpm) {
        const weight = 0.15;
        weightedSum += npmScore * weight;
        totalWeight += weight;
      }

      const matchScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(3)) : 0;

      // Only include candidates above minimum recognition threshold (0.50)
      if (matchScore >= 0.50) {
        candidates.push({
          entity,
          match_score: matchScore,
          signals: {
            name: Number(maxNameScore.toFixed(3)),
            domain: Number(domainScore.toFixed(3)),
            github: Number(githubScore.toFixed(3)),
            npm: Number(npmScore.toFixed(3)),
          },
        });
      }
    }

    candidates.sort((a, b) => b.match_score - a.match_score);
    return candidates;
  }

  public findCanonical(query: string): Entity | undefined {
    const candidates = this.resolve({ name: query });
    if (candidates.length > 0 && candidates[0].match_score >= 0.85) {
      return candidates[0].entity;
    }
    return undefined;
  }
}
