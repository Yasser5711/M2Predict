import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	ChevronDown,
	Loader2,
	MapPin,
	Maximize2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: PredictComponent,
});

function getConfidenceColor(score: number): string {
	if (score >= 0.8) return "var(--confidence-high)";
	if (score >= 0.5) return "var(--confidence-medium)";
	return "var(--destructive)";
}

function getConfidenceLabel(score: number): string {
	if (score >= 0.8) return "Haute";
	if (score >= 0.5) return "Moyenne";
	return "Faible";
}

function formatMethodName(method: string): string {
	return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ConfidenceBar({ score }: { score: number }) {
	const [animated, setAnimated] = useState(0);
	const color = getConfidenceColor(score);
	const label = getConfidenceLabel(score);

	useEffect(() => {
		const raf = requestAnimationFrame(() => setAnimated(score));
		return () => cancelAnimationFrame(raf);
	}, [score]);

	return (
		<div className="space-y-2">
			<div className="flex items-baseline justify-between">
				<span className="text-muted-foreground text-xs">
					Confiance :{" "}
					<span className="font-medium" style={{ color }}>
						{label}
					</span>
				</span>
				<span className="font-mono text-lg tabular-nums tracking-tight">
					{(score * 100).toFixed(1)}
					<span className="text-muted-foreground text-xs">%</span>
				</span>
			</div>

			<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/80">
				<div
					className="absolute inset-y-0 left-0 origin-left rounded-full transition-transform duration-1000 ease-out"
					style={{
						transform: `scaleX(${animated})`,
						width: "100%",
						backgroundColor: color,
					}}
				/>
				<div className="absolute inset-y-0 left-1/2 w-px bg-foreground/15" />
				<div className="absolute inset-y-0 left-[80%] w-px bg-foreground/15" />
			</div>

			<div className="flex justify-between font-mono text-[10px] text-muted-foreground/60">
				<span>0</span>
				<span>50</span>
				<span>100</span>
			</div>
		</div>
	);
}

function PriceRangeBar({
	q10,
	q90,
	predicted,
}: {
	q10: number;
	q90: number;
	predicted: number;
}) {
	const range = q90 - q10;
	const position = range > 0 ? ((predicted - q10) / range) * 100 : 50;
	const clampedPosition = Math.max(8, Math.min(92, position));

	return (
		<div className="space-y-3">
			<div className="relative h-10">
				{/* Track */}
				<div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted/80" />

				{/* Filled range */}
				<div
					className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
					style={{
						left: 0,
						right: 0,
						background:
							"linear-gradient(90deg, var(--chart-1), var(--primary))",
						opacity: 0.5,
					}}
				/>

				{/* Predicted value marker */}
				<div
					className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
					style={{ left: `${clampedPosition}%` }}
				>
					<div className="flex flex-col items-center">
						<div className="size-3.5 rotate-45 rounded-sm border-2 border-primary bg-card shadow-sm" />
					</div>
				</div>
			</div>

			{/* Labels */}
			<div className="flex items-start justify-between">
				<div className="text-left">
					<div className="font-mono text-muted-foreground text-xs tabular-nums">
						{q10.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
						<span className="text-[10px]">EUR/m²</span>
					</div>
					<div className="text-[10px] text-muted-foreground/50">P10</div>
				</div>
				<div className="text-center">
					<div className="font-medium font-mono text-sm tabular-nums">
						{predicted.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
						<span className="text-[10px] text-muted-foreground">EUR/m²</span>
					</div>
					<div className="text-[10px] text-muted-foreground/50">Prediction</div>
				</div>
				<div className="text-right">
					<div className="font-mono text-muted-foreground text-xs tabular-nums">
						{q90.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
						<span className="text-[10px]">EUR/m²</span>
					</div>
					<div className="text-[10px] text-muted-foreground/50">P90</div>
				</div>
			</div>
		</div>
	);
}

function ResultsSkeleton() {
	return (
		<div className="grid gap-4">
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-28 rounded-full" />
					<Skeleton className="mt-3 h-9 w-52 rounded-full" />
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-24 rounded-full" />
					<Skeleton className="mt-3 h-7 w-40 rounded-full" />
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-20 rounded-full" />
					<Skeleton className="mt-4 h-2.5 w-full rounded-full" />
					<Skeleton className="mt-5 h-3 w-16 rounded-full" />
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-32 rounded-full" />
					<Skeleton className="mt-4 h-8 w-full rounded-full" />
				</CardContent>
			</Card>
		</div>
	);
}

const selectClass =
	"h-9 w-full appearance-none rounded-lg border border-input bg-transparent px-3 pr-8 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

function SelectWrapper({
	children,
	...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
	children: React.ReactNode;
}) {
	return (
		<div className="relative">
			<select {...props} className={selectClass}>
				{children}
			</select>
			<ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
}

function PredictComponent() {
	const trpc = useTRPC();

	const [codePostal, setCodePostal] = useState("");
	const [surface, setSurface] = useState("");
	const [pieces, setPieces] = useState("");
	const [typeLocal, setTypeLocal] = useState<"Maison" | "Appartement">(
		"Appartement",
	);
	const [modelVersion, setModelVersion] = useState<"v1_hgb_te" | "v1_rf_te">(
		"v1_rf_te",
	);
	const [predictionKey, setPredictionKey] = useState(0);

	const predict = useMutation(trpc.predict.mutationOptions());

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setPredictionKey((k) => k + 1);
		predict.mutate({
			code_postal: codePostal,
			surface_reelle_bati: Number(surface),
			nombre_pieces_principales: Number(pieces),
			type_local: typeLocal,
			model_version: modelVersion,
		});
	}

	const hasResult = predict.data && !predict.isPending;

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
			{/* Page header */}
			<div className="mb-6 sm:mb-8">
				<h1 className="font-medium text-base tracking-tight sm:text-lg">
					Estimation prix / m²
				</h1>
				<p className="mt-0.5 text-muted-foreground text-xs">
					Prix au metre carre pour l'immobilier residentiel en France
				</p>
			</div>

			{/* Two-panel layout */}
			<div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-8">
				{/* LEFT: Form */}
				<div className="lg:sticky lg:top-16 lg:self-start">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-sm">
								<MapPin className="size-3.5 text-primary" />
								Parametres
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="grid gap-4">
								<div className="grid gap-1.5">
									<Label htmlFor="code_postal" className="text-xs">
										Code postal
									</Label>
									<Input
										id="code_postal"
										placeholder="75011"
										value={codePostal}
										onChange={(e) => setCodePostal(e.target.value)}
										required
									/>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="grid gap-1.5">
										<Label htmlFor="surface" className="text-xs">
											Surface (m²)
										</Label>
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
										<Label htmlFor="pieces" className="text-xs">
											Pieces
										</Label>
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
								</div>

								<div className="grid gap-1.5">
									<Label htmlFor="type_local" className="text-xs">
										Type de bien
									</Label>
									<SelectWrapper
										id="type_local"
										value={typeLocal}
										onChange={(e) =>
											setTypeLocal(e.target.value as "Maison" | "Appartement")
										}
									>
										<option value="Appartement">Appartement</option>
										<option value="Maison">Maison</option>
									</SelectWrapper>
								</div>

								<div className="grid gap-1.5">
									<Label htmlFor="model_version" className="text-xs">
										Modele
									</Label>
									<SelectWrapper
										id="model_version"
										value={modelVersion}
										onChange={(e) =>
											setModelVersion(
												e.target.value as "v1_hgb_te" | "v1_rf_te",
											)
										}
									>
										<option value="v1_rf_te">RandomForest (v1_rf_te)</option>
										<option value="v1_hgb_te">
											HistGradientBoosting (v1_hgb_te)
										</option>
									</SelectWrapper>
								</div>

								<Button
									type="submit"
									disabled={predict.isPending}
									className="mt-1 w-full"
								>
									{predict.isPending ? (
										<>
											<Loader2 className="animate-spin" />
											Estimation...
										</>
									) : (
										<>
											<TrendingUp className="size-3.5" />
											Estimer
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* RIGHT: Results */}
				<div className="min-w-0">
					{/* Empty state */}
					{!predict.data && !predict.isPending && !predict.error && (
						<div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
							<div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/50">
								<Building2 className="size-7 text-muted-foreground/40" />
							</div>
							<p className="text-muted-foreground/70 text-xs">
								Remplissez le formulaire et lancez une estimation
							</p>
						</div>
					)}

					{/* Loading */}
					{predict.isPending && <ResultsSkeleton />}

					{/* Error */}
					{predict.error && (
						<Card className="border-destructive/20">
							<CardContent className="pt-5">
								<p className="text-destructive text-xs">
									{predict.error.message}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Results */}
					{hasResult && (
						<div className="grid gap-4" key={predictionKey}>
							{/* Prix/m2 hero */}
							<Card className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards duration-300">
								<CardContent className="pt-5">
									<p className="mb-1.5 text-muted-foreground text-xs">
										Prix estime par m²
									</p>
									<p className="font-mono font-semibold text-3xl tabular-nums tracking-tight sm:text-4xl">
										{predict.data.prix_m2.toLocaleString("fr-FR", {
											minimumFractionDigits: 2,
										})}
										<span className="ml-1.5 font-normal text-muted-foreground text-sm">
											EUR/m²
										</span>
									</p>
								</CardContent>
							</Card>

							{/* Prix total */}
							<Card className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards delay-100 duration-300">
								<CardContent className="pt-5">
									<div className="flex items-start justify-between">
										<div>
											<p className="mb-1.5 text-muted-foreground text-xs">
												Prix total estime
											</p>
											<p className="font-medium font-mono text-xl tabular-nums">
												{predict.data.prix_total_estime.toLocaleString(
													"fr-FR",
													{
														style: "currency",
														currency: "EUR",
													},
												)}
											</p>
										</div>
										<div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
											<Maximize2 className="size-3 text-muted-foreground" />
											<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
												{Number(surface)} m²
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Confidence */}
							<Card className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards delay-200 duration-300">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm">Indice de confiance</CardTitle>
								</CardHeader>
								<CardContent>
									<ConfidenceBar score={predict.data.score_confiance} />
									{predict.data.confidence_method && (
										<div className="mt-3">
											<span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
												{formatMethodName(predict.data.confidence_method)}
											</span>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Price range */}
							{predict.data.q10 != null && predict.data.q90 != null && (
								<Card className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards delay-300 duration-300">
									<CardHeader className="pb-3">
										<CardTitle className="text-sm">
											Fourchette de prix
										</CardTitle>
										<CardDescription>Percentiles 10 — 90</CardDescription>
									</CardHeader>
									<CardContent>
										<PriceRangeBar
											q10={predict.data.q10}
											q90={predict.data.q90}
											predicted={predict.data.prix_m2}
										/>
									</CardContent>
								</Card>
							)}

							{/* Meta footer */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted/30 px-3 py-2 font-mono text-[10px] text-muted-foreground/60">
								<span>model: {predict.data.model_version}</span>
								{predict.data.intervalle_largeur != null && (
									<>
										<span className="text-border">|</span>
										<span>
											largeur:{" "}
											{predict.data.intervalle_largeur.toLocaleString("fr-FR")}{" "}
											EUR/m²
										</span>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
