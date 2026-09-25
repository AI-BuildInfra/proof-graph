/**
 * ProofGraph Schema.org Structured Data Generator & Validator
 * Produces compliant JSON-LD grounded purely in verified facts
 */
export class SchemaOrgGenerator {
    static generateOrganization(entity) {
        const meta = entity.metadata || {};
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': entity.canonical_url || `https://aibuildinfra.com/#${entity.id}`,
            'name': entity.name,
            'description': entity.description,
        };
        if (entity.canonical_url) {
            schema['url'] = entity.canonical_url;
        }
        if (entity.aliases.length > 0) {
            schema['alternateName'] = entity.aliases;
        }
        const sameAs = [];
        if (meta.github)
            sameAs.push(meta.github);
        if (meta.npm)
            sameAs.push(`https://www.npmjs.com/package/${meta.npm}`);
        if (meta.mcp_registry)
            sameAs.push(meta.mcp_registry);
        if (meta.linkedin)
            sameAs.push(meta.linkedin);
        if (meta.twitter)
            sameAs.push(meta.twitter);
        if (sameAs.length > 0) {
            schema['sameAs'] = sameAs;
        }
        return schema;
    }
    static generateSoftwareApplication(entity) {
        const meta = entity.metadata || {};
        return {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': entity.name,
            'description': entity.description,
            'applicationCategory': meta.category || 'DeveloperApplication',
            'operatingSystem': meta.os || 'Cross-platform',
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
            },
            'url': entity.canonical_url,
            'codeRepository': meta.github || meta.repository,
            'softwareVersion': meta.version || '1.0.0',
        };
    }
    static generateService(entity) {
        return {
            '@context': 'https://schema.org',
            '@type': 'Service',
            'name': entity.name,
            'description': entity.description,
            'provider': {
                '@type': 'Organization',
                'name': entity.metadata?.provider || 'AI Build Infra',
            },
            'serviceType': entity.metadata?.serviceType || 'Agentic AI Architecture',
        };
    }
    static generateArticle(entity) {
        return {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            'headline': entity.name,
            'description': entity.description,
            'author': {
                '@type': 'Organization',
                'name': entity.metadata?.author || 'AI Build Infra',
            },
            'datePublished': entity.metadata?.published_at || entity.created_at,
        };
    }
    static generateForEntity(entity) {
        switch (entity.type) {
            case 'Organization':
                return this.generateOrganization(entity);
            case 'Project':
            case 'Product':
            case 'Package':
                return this.generateSoftwareApplication(entity);
            case 'Service':
                return this.generateService(entity);
            case 'Article':
                return this.generateArticle(entity);
            default:
                return {
                    '@context': 'https://schema.org',
                    '@type': 'Thing',
                    'name': entity.name,
                    'description': entity.description,
                    'url': entity.canonical_url,
                };
        }
    }
}
//# sourceMappingURL=schemaOrg.js.map