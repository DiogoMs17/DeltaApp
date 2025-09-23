import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Connection string from Supabase environment variables
const connectionString = `postgresql://postgres.bkorzadlajfztazruprw:OwCfo6AFuTWHwMtu@aws-1-sa-east-1.pooler.supabase.com:6543/postgres`;

// Create the postgres client
const client = postgres(connectionString, {
  prepare: false,
  ssl: 'require',
});

// Create the drizzle instance
export const db = drizzle(client, { schema });

export { schema };