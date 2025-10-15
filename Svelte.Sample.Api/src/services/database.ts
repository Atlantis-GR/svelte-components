import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/sample.db');
const dbDir = dirname(dbPath);

// Ensure the data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let db: Database;

// Initialize database connection
export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Enable WAL mode for better concurrent access
    await db.exec('PRAGMA journal_mode = WAL');
  }
  return db;
}

// Create tables
export async function initializeDatabase() {
  console.log('Initializing SQLite database...');
  
  const database = await getDatabase();

  // Configuration table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS config_items (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity logs table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sample data table for demonstration
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sample_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_email TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for performance
  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_config_key ON config_items (key);
    CREATE INDEX IF NOT EXISTS idx_config_public ON config_items (is_public);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs (user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs (created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON sample_posts (author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON sample_posts (is_published);
  `);

  console.log('Database initialized successfully');
}

// Database operations
export const db_operations = {
  // Configuration
  async getConfigByKey(key: string) {
    const database = await getDatabase();
    return database.get('SELECT * FROM config_items WHERE key = ?', key);
  },
  
  async getPublicConfig() {
    const database = await getDatabase();
    return database.all('SELECT key, value, description FROM config_items WHERE is_public = 1');
  },
  
  async getAllConfig() {
    const database = await getDatabase();
    return database.all('SELECT * FROM config_items ORDER BY key');
  },
  
  async setConfig(id: string, key: string, value: string, description: string | null, isPublic: number) {
    const database = await getDatabase();
    return database.run(`
      INSERT OR REPLACE INTO config_items (id, key, value, description, is_public, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, id, key, value, description, isPublic);
  },
  
  async deleteConfig(key: string) {
    const database = await getDatabase();
    return database.run('DELETE FROM config_items WHERE key = ?', key);
  },

  // Activity Logs
  async createActivityLog(id: string, userId: string | null, userEmail: string | null, action: string, resource: string, details: string | null, ipAddress: string | null, userAgent: string | null) {
    const database = await getDatabase();
    return database.run(`
      INSERT INTO activity_logs (id, user_id, user_email, action, resource, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, id, userId, userEmail, action, resource, details, ipAddress, userAgent);
  },
  
  async getActivityLogs(limit: number, offset: number) {
    const database = await getDatabase();
    return database.all(`
      SELECT * FROM activity_logs
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
  },
  
  async getActivityLogsCount() {
    const database = await getDatabase();
    return database.get('SELECT COUNT(*) as count FROM activity_logs');
  },

  // Sample Posts
  async createPost(id: string, title: string, content: string, authorId: string, authorEmail: string, isPublished: number) {
    const database = await getDatabase();
    return database.run(`
      INSERT INTO sample_posts (id, title, content, author_id, author_email, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `, id, title, content, authorId, authorEmail, isPublished);
  },
  
  async getPostById(id: string) {
    const database = await getDatabase();
    return database.get(`
      SELECT * FROM sample_posts WHERE id = ?
    `, id);
  },
  
  async getPublishedPosts(limit: number, offset: number) {
    const database = await getDatabase();
    return database.all(`
      SELECT * FROM sample_posts
      WHERE is_published = 1
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
  },
  
  async getAllPosts(limit: number, offset: number) {
    const database = await getDatabase();
    return database.all(`
      SELECT * FROM sample_posts
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, limit, offset);
  },
  
  async getPostsCount(isPublished: number) {
    const database = await getDatabase();
    return database.get('SELECT COUNT(*) as count FROM sample_posts WHERE is_published = ?', isPublished);
  },
  
  async updatePost(title: string, content: string, isPublished: number, id: string, authorId: string) {
    const database = await getDatabase();
    return database.run(`
      UPDATE sample_posts 
      SET title = ?, content = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND author_id = ?
    `, title, content, isPublished, id, authorId);
  },
  
  async deletePost(id: string, authorId: string) {
    const database = await getDatabase();
    return database.run('DELETE FROM sample_posts WHERE id = ? AND author_id = ?', id, authorId);
  },
};

// Health check function
export async function checkDatabaseHealth(): Promise<{ connected: boolean; responseTime?: number }> {
  try {
    const start = Date.now();
    const database = await getDatabase();
    await database.get('SELECT 1');
    const responseTime = Date.now() - start;
    return { connected: true, responseTime };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { connected: false };
  }
}