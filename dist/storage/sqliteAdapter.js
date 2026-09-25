/**
 * ProofGraph SQLite Storage Adapter
 * Provides persistent SQLite storage using node:sqlite DatabaseSync
 */
export class SQLiteAdapter {
    dbPath;
    db = null;
    constructor(dbPath = ':memory:') {
        this.dbPath = dbPath;
    }
    async init() {
        try {
            // Dynamic import to support Node 22 node:sqlite
            const { DatabaseSync } = await import('node:sqlite');
            this.db = new DatabaseSync(this.dbPath);
            this.createSchema();
        }
        catch (err) {
            // If node:sqlite is unavailable, fallback silently (in-memory GraphStore handles data)
            console.warn('[ProofGraph] SQLite initialization note: In-memory mode active');
        }
    }
    createSchema() {
        if (!this.db)
            return;
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        canonical_url TEXT,
        aliases TEXT,
        metadata TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        source_type TEXT NOT NULL,
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        title TEXT NOT NULL,
        publisher TEXT NOT NULL,
        trust_class TEXT NOT NULL,
        reliability_score REAL NOT NULL,
        published_at TEXT,
        retrieved_at TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        etag TEXT,
        last_verified TEXT NOT NULL,
        freshness TEXT NOT NULL,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        predicate TEXT NOT NULL,
        object_id TEXT,
        object_value TEXT,
        statement TEXT NOT NULL,
        status TEXT NOT NULL,
        confidence REAL NOT NULL,
        evidence_ids TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        claim_id TEXT,
        source_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        publisher TEXT NOT NULL,
        retrieved_at TEXT NOT NULL,
        published_at TEXT,
        content_hash TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        supports_claim INTEGER NOT NULL,
        confidence REAL NOT NULL,
        directness REAL NOT NULL,
        corroborating_sources TEXT
      );

      CREATE TABLE IF NOT EXISTS relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship TEXT NOT NULL,
        confidence REAL NOT NULL,
        evidence_ids TEXT,
        metadata TEXT,
        created_at TEXT
      );
    `);
    }
    saveGraph(store) {
        if (!this.db)
            return;
        const data = store.toJSON();
        const insertEntity = this.db.prepare(`
      INSERT OR REPLACE INTO entities (id, name, type, description, canonical_url, aliases, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const e of data.entities) {
            insertEntity.run(e.id, e.name, e.type, e.description, e.canonical_url || null, JSON.stringify(e.aliases), JSON.stringify(e.metadata), e.created_at, e.updated_at);
        }
    }
    loadGraph(store) {
        if (!this.db)
            return;
        try {
            const entities = this.db.prepare(`SELECT * FROM entities`).all();
            for (const row of entities) {
                store.addEntity({
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    description: row.description,
                    canonical_url: row.canonical_url,
                    aliases: JSON.parse(row.aliases || '[]'),
                    metadata: JSON.parse(row.metadata || '{}'),
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                });
            }
        }
        catch (e) {
            // Ignore query errors if empty
        }
    }
}
//# sourceMappingURL=sqliteAdapter.js.map