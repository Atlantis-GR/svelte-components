import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, db_operations } from '../services/database.js';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Initialize database if not already done
    await initializeDatabase();

    // Seed configuration items
    await db_operations.setConfig(
      uuidv4(),
      'app.name',
      JSON.stringify('Svelte Sample API'),
      'Application name',
      1  // public
    );

    await db_operations.setConfig(
      uuidv4(),
      'app.version',
      JSON.stringify('1.0.0'),
      'Application version',
      1  // public
    );

    await db_operations.setConfig(
      uuidv4(),
      'features.registration',
      JSON.stringify(true),
      'Enable user registration',
      1  // public
    );

    await db_operations.setConfig(
      uuidv4(),
      'api.rateLimit',
      JSON.stringify(100),
      'API rate limit per hour',
      0  // private/secure
    );

    await db_operations.setConfig(
      uuidv4(),
      'oauth.provider',
      JSON.stringify('oidc'),
      'OAuth provider type',
      1  // public
    );

    // Seed sample posts
    await db_operations.createPost(
      uuidv4(),
      'Welcome to Svelte Sample API',
      'This is a sample post to demonstrate the API functionality with OAuth integration.',
      'sample-user-123',
      'user@example.com',
      1  // published
    );

    await db_operations.createPost(
      uuidv4(),
      'Getting Started with OAuth',
      'Learn how to integrate OAuth authentication with your Svelte applications using this API.',
      'sample-user-123',
      'user@example.com',
      1  // published
    );

    await db_operations.createPost(
      uuidv4(),
      'Draft Post Example',
      'This is a draft post that demonstrates unpublished content.',
      'sample-user-456',
      'admin@example.com',
      0  // draft
    );

    // Log sample activity
    await db_operations.createActivityLog(
      uuidv4(),
      'sample-user-123',
      'user@example.com',
      'seed',
      'database',
      JSON.stringify({ message: 'Database seeded with initial data' }),
      '127.0.0.1',
      'seed-script'
    );

    console.log('✅ Database seeded successfully!');
    console.log('📝 Created configuration items:');
    console.log('  - app.name: "Svelte Sample API"');
    console.log('  - app.version: "1.0.0"');
    console.log('  - features.registration: true');
    console.log('  - api.rateLimit: 100');
    console.log('  - oauth.provider: "oidc"');
    console.log('📄 Created sample posts: 3 posts (2 published, 1 draft)');
    console.log('📊 Logged initial activity');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🏁 Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };