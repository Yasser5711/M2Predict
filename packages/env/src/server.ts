import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32).optional(),
		BETTER_AUTH_URL: z.url().default("http://localhost:3001"),
		CORS_ORIGIN: z.url().default("http://localhost:3001"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		ML_API_URL: z.url().default("http://localhost:8000"),
		ML_API_KEY: z.string().min(16).optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
