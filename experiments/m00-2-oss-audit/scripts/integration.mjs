import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
try {
  db.exec('PRAGMA foreign_keys=ON; CREATE TABLE audit_probe(id INTEGER PRIMARY KEY, label TEXT NOT NULL);');
  db.prepare('INSERT INTO audit_probe(id,label) VALUES(?,?)').run(1, 'electrocraft');
  const row = db.prepare('SELECT id,label FROM audit_probe WHERE id=?').get(1);
  if (!row || row.label !== 'electrocraft') throw new Error('SQLite round-trip failed');
  let negative = false;
  try { db.prepare('SELECT * FROM definitely_missing_table').all(); } catch { negative = true; }
  if (!negative) throw new Error('SQLite negative diagnostic was not surfaced');
  console.log(JSON.stringify({engine:'SQLite via node:sqlite',roundTrip:'PASS',negativeDiagnostic:'PASS',note:'Representative real storage engine for M00.2 audit; PGlite/Drizzle runtime POC belongs to M00.4.'}));
} finally { db.close(); }
