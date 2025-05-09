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


export async function get_ads() {
   const ads = await execute_select(
       'SELECT * FROM facebook_ads'
   );

   console.log(ads);
   return ads
}

export async function update_ad_status(ad_name, val) {
   const result = await execute_transaction(
       'UPDATE facebook_ads SET status = $1 WHERE ad_name = $2',
       [val, ad_name]
   );
   return result;
}

export async function update_ad_budget(ad_name, val) {
   const result = await execute_transaction(
       'UPDATE facebook_ads SET budget = $1 WHERE ad_name = $2',
       [val, ad_name]
   );
   return result;
}


export const execute_select = (text, params) => execute_query(text, params);
export const execute_transaction = (text, params) => execute_query(text, params, true);


