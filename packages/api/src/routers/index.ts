import { env } from "@M2Predict/env/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

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
				model_version: z.enum(["v1_hgb_te", "v1_rf_te"]).default("v1_rf_te"),
			}),
		)
		.mutation(async ({ input }) => {
			const { model_version, ...body } = input;
			const res = await fetch(
				`${env.ML_API_URL}/predict?model_version=${model_version}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${env.ML_API_KEY}`,
					},
					body: JSON.stringify(body),
				},
			);

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`ML API error: ${res.status} ${text}`);
			}

			return res.json() as Promise<{
				model_version: string;
				prix_m2: number;
				prix_total_estime: number;
				score_confiance: number;
				intervalle_largeur: number | null;
				q10: number | null;
				q90: number | null;
				confidence_method: string | null;
			}>;
		}),
});
export type AppRouter = typeof appRouter;
