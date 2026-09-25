/**
 * ProofGraph Multi-Format Exporter
 * Supports JSON, JSON-LD, CSV, and GraphML
 */
import { SchemaOrgGenerator } from './schemaOrg.js';
export class GraphExporter {
    store;
    constructor(store) {
        this.store = store;
    }
    toJSON() {
        return JSON.stringify(this.store.toJSON(), null, 2);
    }
    toJSONLD() {
        const entities = this.store.getAllEntities();
        const graphNodes = entities.map(e => SchemaOrgGenerator.generateForEntity(e));
        const jsonld = {
            '@context': 'https://schema.org',
            '@graph': graphNodes,
        };
        return JSON.stringify(jsonld, null, 2);
    }
    toCSV() {
        // 1. Entities CSV
        const entities = this.store.getAllEntities();
        const entityRows = ['id,name,type,canonical_url,aliases,created_at'];
        for (const e of entities) {
            const escapedName = `"${e.name.replace(/"/g, '""')}"`;
            const escapedAliases = `"${e.aliases.join(';').replace(/"/g, '""')}"`;
            entityRows.push(`${e.id},${escapedName},${e.type},${e.canonical_url || ''},${escapedAliases},${e.created_at}`);
        }
        // 2. Relationships CSV
        const relationships = this.store.getAllRelationships();
        const relRows = ['source_id,relationship,target_id,confidence,created_at'];
        for (const r of relationships) {
            relRows.push(`${r.source_id},${r.relationship},${r.target_id},${r.confidence},${r.created_at || ''}`);
        }
        // 3. Claims CSV
        const claims = this.store.getAllClaims();
        const claimRows = ['id,subject_id,statement,status,confidence'];
        for (const c of claims) {
            const escapedStmt = `"${c.statement.replace(/"/g, '""')}"`;
            claimRows.push(`${c.id},${c.subject_id},${escapedStmt},${c.status},${c.confidence}`);
        }
        return {
            entitiesCSV: entityRows.join('\n'),
            relationshipsCSV: relRows.join('\n'),
            claimsCSV: claimRows.join('\n'),
        };
    }
    toGraphML() {
        const entities = this.store.getAllEntities();
        const relationships = this.store.getAllRelationships();
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="relationship" for="edge" attr.name="relationship" attr.type="string"/>
  <key id="confidence" for="edge" attr.name="confidence" attr.type="double"/>
  <graph id="ProofGraph" edgedefault="directed">
`;
        for (const e of entities) {
            const cleanName = e.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `    <node id="${e.id}">
      <data key="name">${cleanName}</data>
      <data key="type">${e.type}</data>
    </node>\n`;
        }
        let edgeCounter = 1;
        for (const r of relationships) {
            xml += `    <edge id="e${edgeCounter++}" source="${r.source_id}" target="${r.target_id}">
      <data key="relationship">${r.relationship}</data>
      <data key="confidence">${r.confidence}</data>
    </edge>\n`;
        }
        xml += `  </graph>
</graphml>`;
        return xml;
    }
}
//# sourceMappingURL=exporter.js.map