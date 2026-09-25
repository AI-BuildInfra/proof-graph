/**
 * ProofGraph Web Presence & Digital Footprint Analyzer
 */
export class WebPresenceAnalyzer {
    store;
    constructor(store) {
        this.store = store;
    }
    analyze(entityIdOrName, domainHint) {
        let entity = this.store.getEntity(entityIdOrName);
        if (!entity) {
            const candidates = this.store.searchEntitiesByName(entityIdOrName, 1);
            if (candidates.length > 0)
                entity = candidates[0];
        }
        const entityName = entity?.name || entityIdOrName;
        const entityId = entity?.id || `entity:organization:${entityIdOrName.toLowerCase().replace(/\s+/g, '-')}`;
        const domain = domainHint || (entity?.canonical_url ? new URL(entity.canonical_url).hostname : undefined);
        const allSources = this.store.getAllSources();
        const relevantSources = [];
        for (const src of allSources) {
            const matchesDomain = domain && (src.domain === domain || src.url.includes(domain));
            const matchesName = src.title.toLowerCase().includes(entityName.toLowerCase()) || src.publisher.toLowerCase().includes(entityName.toLowerCase());
            if (matchesDomain || matchesName) {
                relevantSources.push(src);
            }
        }
        const breakdown = {
            official_references: relevantSources.filter(s => s.trust_class === 'official_source'),
            third_party_references: relevantSources.filter(s => s.trust_class === 'established_publication' || s.trust_class === 'industry_directory' || s.trust_class === 'academic_source'),
            github_references: relevantSources.filter(s => s.trust_class === 'github_repository' || s.url.includes('github.com')),
            package_references: relevantSources.filter(s => s.trust_class === 'package_registry' || s.url.includes('npmjs.com') || s.url.includes('pypi.org')),
            registry_references: relevantSources.filter(s => s.trust_class === 'official_registry' || s.trust_class === 'standards_body'),
            documentation_references: relevantSources.filter(s => s.url.includes('/docs') || s.title.toLowerCase().includes('documentation')),
            social_references: relevantSources.filter(s => s.trust_class === 'social_media'),
            case_studies: relevantSources.filter(s => s.title.toLowerCase().includes('case study') || s.url.includes('/case-studies/')),
        };
        // Detect anomalies
        const anomalies = [];
        if (breakdown.official_references.length === 0 && relevantSources.length > 0) {
            anomalies.push('Missing direct canonical official website reference among discovered citations.');
        }
        if (breakdown.third_party_references.length === 0 && relevantSources.length > 0) {
            anomalies.push('Low third-party corroboration footprint; entity is predominantly self-attested.');
        }
        const categoriesWithPresence = Object.values(breakdown).filter(arr => arr.length > 0).length;
        const diversity = Number((categoriesWithPresence / 8).toFixed(2));
        return {
            entity_id: entityId,
            entity_name: entityName,
            domain,
            breakdown,
            detected_anomalies: anomalies,
            summary: {
                total_sources: relevantSources.length,
                official_count: breakdown.official_references.length,
                third_party_count: breakdown.third_party_references.length,
                footprint_diversity: diversity,
            },
        };
    }
}
//# sourceMappingURL=webPresence.js.map