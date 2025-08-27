// Connect to DB
import { Client } from 'pg';

const client = (process.env.NODE_ENV === 'production') 
  ? new Client({
    connectionString: process.env.DATABASE_URL ,
    ssl: {rejectUnauthorized: false}
  }) 
  : new Client('postgres://postgres:postgres@localhost:5432/graceshopper?sslmode=disable')

export { client };
