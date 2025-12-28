import { pool } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
    try {
        console.log('🚀 Applying database schema...\n');

        // Read schema file from database folder
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Apply schema
        await pool.query(schema);

        console.log('✅ Schema applied successfully!\n');
        console.log('📊 Tables created:');
        console.log('  - users');
        console.log('  - content');
        console.log('  - interactions');
        console.log('  - models');
        console.log('  - recommendation_logs\n');

        // Verify tables exist
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        console.log('📋 All tables in database:');
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        await pool.end();
        console.log('\n✅ Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

applySchema();
