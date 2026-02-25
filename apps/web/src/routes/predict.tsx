import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/predict")({
	component: PredictComponent,
});

function PredictComponent() {
	const trpc = useTRPC();

	const [codePostal, setCodePostal] = useState("");
	const [surface, setSurface] = useState("");
	const [pieces, setPieces] = useState("");
	const [typeLocal, setTypeLocal] = useState<"Maison" | "Appartement">(
		"Appartement",
	);

	const predict = useMutation(trpc.predict.mutationOptions());

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		predict.mutate({
			code_postal: codePostal,
			surface_reelle_bati: Number(surface),
			nombre_pieces_principales: Number(pieces),
			type_local: typeLocal,
		});
	}

	return (
		<div className="container mx-auto max-w-lg px-4 py-6">
			<h1 className="mb-4 font-medium text-lg">Estimation prix/m²</h1>

			<form onSubmit={handleSubmit} className="grid gap-4">
				<div className="grid gap-1.5">
					<Label htmlFor="code_postal">Code postal</Label>
					<Input
						id="code_postal"
						placeholder="75011"
						value={codePostal}
						onChange={(e) => setCodePostal(e.target.value)}
						required
					/>
				</div>

				<div className="grid gap-1.5">
					<Label htmlFor="surface">Surface (m²)</Label>
					<Input
						id="surface"
						type="number"
						min={1}
						placeholder="42"
						value={surface}
						onChange={(e) => setSurface(e.target.value)}
						required
					/>
				</div>

				<div className="grid gap-1.5">
					<Label htmlFor="pieces">Nombre de pièces</Label>
					<Input
						id="pieces"
						type="number"
						min={1}
						placeholder="2"
						value={pieces}
						onChange={(e) => setPieces(e.target.value)}
						required
					/>
				</div>

				<div className="grid gap-1.5">
					<Label htmlFor="type_local">Type de bien</Label>
					<select
						id="type_local"
						value={typeLocal}
						onChange={(e) =>
							setTypeLocal(e.target.value as "Maison" | "Appartement")
						}
						className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
					>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
					</select>
				</div>

				<Button type="submit" disabled={predict.isPending}>
					{predict.isPending ? "Estimation..." : "Estimer"}
				</Button>
			</form>

			{predict.error && (
				<Card className="mt-4 border-destructive/50">
					<CardContent>
						<p className="text-destructive text-xs">{predict.error.message}</p>
					</CardContent>
				</Card>
			)}

			{predict.data && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle>Résultat</CardTitle>
						<CardDescription>Modèle: {predict.data.model_version}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground text-xs">Prix / m²</p>
								<p className="font-medium text-lg">
									{predict.data.prix_m2.toLocaleString("fr-FR", {
										style: "currency",
										currency: "EUR",
									})}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Prix total estimé</p>
								<p className="font-medium text-lg">
									{predict.data.prix_total_estime.toLocaleString("fr-FR", {
										style: "currency",
										currency: "EUR",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
