import { Pool } from 'pg';

const SQL_pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function execute_query(text, params = [], transaction = false) {
    const client = await SQL_pool.connect();
    try {
        // console.log('Query:', text, 'Params:', params);
        if (transaction) {
            await client.query('BEGIN');
        }

        const result = await client.query(text, params);

        if (transaction) {
            await client.query('COMMIT');
        }

        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        if (transaction) {
            console.log('Rolling back transaction');
            await client.query('ROLLBACK');
        }
        throw error;
    } finally {
        client.release();
    }
}

export async function get_store_id(user_id) {
    const store_id = await execute_select(
        'SELECT store_id FROM app_users WHERE app_user_id = $1',
        [user_id]
    );

    return store_id[0].store_id
    
}

export const execute_select = (text, params) => execute_query(text, params);
export const execute_transaction = (text, params) => execute_query(text, params, true);
