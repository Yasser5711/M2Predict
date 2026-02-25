import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

const ML_API_URL = "http://localhost:8000";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	predict: publicProcedure
		.input(
			z.object({
				code_postal: z.string(),
				surface_reelle_bati: z.number().positive(),
				nombre_pieces_principales: z.number().int().positive(),
				type_local: z.enum(["Maison", "Appartement"]),
			}),
		)
		.mutation(async ({ input }) => {
			const res = await fetch(`${ML_API_URL}/predict`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`ML API error: ${res.status} ${text}`);
			}

			return res.json() as Promise<{
				model_version: string;
				prix_m2: number;
				prix_total_estime: number;
			}>;
		}),
});
export type AppRouter = typeof appRouter;
