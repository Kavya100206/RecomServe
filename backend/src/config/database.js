import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
    connectionString: config.database.connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 10000, // Close idle clients after 10s
    connectionTimeoutMillis: 10000, // Wait 10s for connection (NeonDB cold start)
    statement_timeout: 30000, // 30s query timeout
    ssl: {
        rejectUnauthorized: false, // Required for NeonDB
    },
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (config.nodeEnv === 'development') {
        console.log('Executed query:', { text, duration, rows: res.rowCount });
    }

    return res;
};

export default pool;
