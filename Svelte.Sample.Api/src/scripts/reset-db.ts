import dotenv from 'dotenv';
import { existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/sample.db');

console.log('🗑️ Resetting database...');

try {
  if (existsSync(dbPath)) {
    unlinkSync(dbPath);
    console.log('✅ Database file deleted');
  } else {
    console.log('ℹ️ Database file does not exist');
  }
  
  console.log('🔄 Database reset completed');
  console.log('💡 Run "npm run db:init" and "npm run db:seed" to recreate the database');
  
} catch (error) {
  console.error('❌ Failed to reset database:', error);
  process.exit(1);
}