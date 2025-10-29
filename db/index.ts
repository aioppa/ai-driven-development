import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { setDefaultResultOrder } from 'node:dns';

config({ path: '.env.local' }); // or .env.local

try { setDefaultResultOrder('ipv4first'); } catch {}

const connectionString = process.env.DATABASE_URL!;
// Supabase/managed Postgres often requires SSL; enable when host matches common providers
const requiresSsl = /supabase\.co|neon\.tech|render\.com|aws\.com|gcp\.cloudsql/.test(connectionString);
const client = postgres(connectionString, requiresSsl ? { ssl: 'require' } as any : {});
export const db = drizzle(client);
