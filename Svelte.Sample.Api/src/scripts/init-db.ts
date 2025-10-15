import dotenv from 'dotenv';
import { initializeDatabase } from '../services/database.js';

// Load environment variables
dotenv.config();

console.log('🚀 Initializing database...');

try {
  initializeDatabase();
  console.log('✅ Database initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}