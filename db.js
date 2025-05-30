import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function getChannelId(type) {
  const result = await pool.query(
    `SELECT value FROM bot_config WHERE key = '${type}'`
  );
  return result.rows[0]?.value;
}

// deletes all chunks and vectors of a changed file
export async function deleteVectorChunk(fileName) {
  await pool.query(`DELETE FROM vectors WHERE file_name = $1`, [fileName]);
}

export async function deleteFileHash(fileName) {
  await pool.query(`DELETE FROM file_hashes WHERE file_name = $1`, [fileName]);
  console.log("[deleting hash from}:", fileName);
}

// saves chunks to db
export async function saveVectorChunk(fileName, chunk, embedding) {
  const vectorString = `[${embedding.join(",")}]`; // Converts JS array to PostgreSQL vector string
  await pool.query(
    `INSERT INTO vectors (file_name, chunk, embedding)
     VALUES ($1, $2, $3::vector)`,
    [fileName, chunk, vectorString]
  );
  console.log("[updating]: ", fileName);
}

// gets chunk vectors form db
export async function loadAllVectors() {
  const result = await pool.query(
    "SELECT file_name, chunk, embedding FROM vectors"
  );
  return result.rows.map((row) => ({
    chunk: `[${row.file_name}]\n${row.chunk}`,
    vector: row.embedding,
  }));
}

// finds similar chunks of info to message in postgreSQL
export async function findSimilarChunks(messageEmbedding, topN) {
  const vectorString = `[${messageEmbedding.join(",")}]`; // PostgreSQL vector format

  const result = await pool.query(
    `
    SELECT file_name, chunk, embedding <#> $1 AS score
    FROM vectors
    ORDER BY embedding <#> $1
    LIMIT $2
    `,
    [vectorString, topN]
  );

  return result.rows;
}

// returns hash of passed file
export async function getStoredFileHash(filename) {
  const result = await pool.query(
    `SELECT hash FROM file_hashes WHERE file_name = $1`,
    [filename]
  );
  return result.rows[0]?.hash || null;
}

// ads or updates hash
export async function storeFileHash(filename, hash) {
  await pool.query(
    `
    INSERT INTO file_hashes (file_name, hash)
    VALUES ($1, $2)
    ON CONFLICT (file_name) DO UPDATE SET hash = EXCLUDED.hash
    `,
    [filename, hash]
  );
}

// gets file names from neondb
export async function getAllStoredFileNames() {
  const res = await pool.query("SELECT DISTINCT file_name FROM vectors"); // returns array of jsons
  return res.rows.map((r) => r.file_name); // returns array of strings of file names
}

export async function getConfigValue(key) {
  const result = await pool.query(
    "SELECT value FROM bot_config WHERE key = $1",
    [key]
  );
  return result.rows[0]?.value || null;
}

export async function setConfigValue(key, value) {
  await pool.query(
    `INSERT INTO bot_config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

export async function logUserTokenUsage(userId, model, tokens) {
  await pool.query(
    `INSERT INTO user_logs (user_id, model, tokens)
     VALUES ($1, $2, $3)`,
    [userId, model, tokens]
  );
}

export async function incrementStat(key) {
  await pool.query(
    `INSERT INTO bot_stats (stat_key, value)
     VALUES ($1, 1)
     ON CONFLICT (stat_key)
     DO UPDATE SET value = bot_stats.value + 1`,
    [key]
  );
}

export default pool;
