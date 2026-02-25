import { env } from "@M2Predict/env/server";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type DrizzleDB = PostgresJsDatabase<typeof schema>;
let db: DrizzleDB;

const isEdge = env.NODE_ENV !== "development";

if (isEdge) {
	const { neon } = await import("@neondatabase/serverless");
	const { drizzle } = await import("drizzle-orm/neon-http");

	const sql = neon(env.DATABASE_URL);
	db = drizzle(sql, { schema });
} else {
	const { Pool } = await import("pg");
	const { drizzle } = await import("drizzle-orm/node-postgres");

	const pool = new Pool({ connectionString: env.DATABASE_URL });
	db = drizzle(pool, { schema });
}

export { db };
