import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		ML_API_URL: z.url().default("http://localhost:8000"),
		ML_API_KEY: z.string().min(16),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
