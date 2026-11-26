import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'

const migration = readFileSync(new URL('../server/database/migrations/0007_media_source_id.sql', import.meta.url), 'utf8')

function createDatabase() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE media (id TEXT PRIMARY KEY, type TEXT NOT NULL, url TEXT NOT NULL, thumbnail TEXT NOT NULL);
    CREATE TABLE artist_media (media_id TEXT NOT NULL REFERENCES media(id));
  `)
  return db
}

test('migrates image paths and supported YouTube URLs without changing links', () => {
  const db = createDatabase()
  const insert = db.prepare('INSERT INTO media VALUES (?, ?, ?, ?)')
  insert.run('image', 'image', '/images/artist/file.webp', '/images/artist/thumb.webp')
  for (const [id, url] of [
    ['watch', 'https://www.youtube.com/watch?x=1&v=abcdefghijk'],
    ['short', 'https://youtu.be/abcdefghijk?t=42'],
    ['shorts', 'https://m.youtube.com/shorts/abcdefghijk'],
    ['live', 'https://youtube.com/live/abcdefghijk'],
    ['embed', 'https://youtube.com/embed/abcdefghijk#start']
  ]) {
    insert.run(id, 'video', url, 'https://example.com/thumbnail.jpg')
  }
  db.prepare('INSERT INTO artist_media VALUES (?)').run('image')

  db.transaction(() => db.exec(migration))()

  assert.deepEqual(db.prepare('SELECT source_id, thumbnail FROM media WHERE id = ?').get('image'), {
    source_id: 'artist/file.webp',
    thumbnail: 'artist/thumb.webp'
  })
  assert.deepEqual(db.prepare('SELECT DISTINCT source_id, thumbnail FROM media WHERE type = ?').all('video'), [{
    source_id: 'abcdefghijk',
    thumbnail: 'https://example.com/thumbnail.jpg'
  }])
  assert.deepEqual(db.pragma('foreign_key_check'), [])
  assert.equal(db.prepare('SELECT media_id FROM artist_media').get().media_id, 'image')
  db.close()
})

test('rejects unsupported records without changing the existing media', () => {
  for (const [type, url, thumbnail] of [
    ['music', 'https://example.com/audio', 'https://example.com/thumb'],
    ['image', 'https://example.com/image.jpg', 'https://example.com/thumb'],
    ['image', '/images/artist/file.webp', 'https://example.com/thumb'],
    ['video', 'https://example.com/watch?v=abcdefghijk', 'https://example.com/thumb'],
    ['video', 'https://youtube.com/watch?v=invalid', 'https://example.com/thumb']
  ]) {
    const db = createDatabase()
    db.prepare('INSERT INTO media VALUES (?, ?, ?, ?)').run('item', type, url, thumbnail)
    assert.throws(() => db.transaction(() => db.exec(migration))())
    assert.deepEqual(db.prepare('SELECT type, url, thumbnail FROM media').get(), { type, url, thumbnail })
    db.close()
  }
})
