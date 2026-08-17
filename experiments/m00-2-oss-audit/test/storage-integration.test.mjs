import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

test('real SQLite engine persists and round-trips a target fixture', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON; CREATE TABLE records(id INTEGER PRIMARY KEY, label TEXT NOT NULL);');
    db.prepare('INSERT INTO records(id,label) VALUES(?,?)').run(1,'electrocraft');
    const row = db.prepare('SELECT id,label FROM records WHERE id=?').get(1);
    assert.equal(row.id, 1); assert.equal(row.label, 'electrocraft');
  } finally { db.close(); }
});

test('real SQLite transaction rolls back atomically', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE records(id INTEGER PRIMARY KEY, label TEXT NOT NULL); BEGIN;');
    db.prepare('INSERT INTO records(id,label) VALUES(?,?)').run(1,'temporary');
    db.exec('ROLLBACK;');
    assert.equal(db.prepare('SELECT count(*) AS total FROM records').get().total, 0);
  } finally { db.close(); }
});

test('real SQLite engine surfaces SQL diagnostics', () => {
  const db = new DatabaseSync(':memory:');
  try { assert.throws(() => db.prepare('SELECT * FROM definitely_missing_table').all()); }
  finally { db.close(); }
});
