import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	Loader2,
	MapPin,
	Maximize2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Shine } from "@/components/animate-ui/primitives/effects/shine";
import { Slide } from "@/components/animate-ui/primitives/effects/slide";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import { MethodologySection } from "@/components/methodology-section";
import { SiteFooter } from "@/components/site-footer";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
		<div className="space-y-2.5">
			<div className="flex items-baseline justify-between">
				<span className="text-muted-foreground text-xs">
					Confiance :{" "}
					<span className="font-medium" style={{ color }}>
						{label}
					</span>
				</span>
				<span className="font-mono text-lg tabular-nums tracking-tight">
					<CountingNumber
						number={score * 100}
						decimalPlaces={1}
						decimalSeparator=","
						transition={{ stiffness: 30, damping: 28, mass: 1.2 }}
					/>
					<span className="text-muted-foreground text-xs">%</span>
				</span>
			</div>

			<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/80">
				<div
					className="absolute inset-y-0 left-0 origin-left rounded-full transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
					style={{
						transform: `scaleX(${animated})`,
						width: "100%",
						backgroundColor: color,
					}}
				/>
				<div className="absolute inset-y-0 left-1/2 w-px bg-foreground/10" />
				<div className="absolute inset-y-0 left-[80%] w-px bg-foreground/10" />
			</div>

			<div className="flex justify-between font-mono text-[10px] text-muted-foreground/50">
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
				<div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted/80" />

				<div
					className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
					style={{
						left: 0,
						right: 0,
						background:
							"linear-gradient(90deg, var(--chart-2), var(--primary))",
						opacity: 0.45,
					}}
				/>

				<div
					className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
					style={{ left: `${clampedPosition}%` }}
				>
					<div className="flex flex-col items-center">
						<div className="size-3.5 rotate-45 rounded-sm border-2 border-primary bg-card shadow-sm" />
					</div>
				</div>
			</div>

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
					<Skeleton className="mt-3 h-10 w-56 rounded-full" />
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-24 rounded-full" />
					<Skeleton className="mt-3 h-7 w-44 rounded-full" />
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-5">
					<Skeleton className="h-3 w-20 rounded-full" />
					<Skeleton className="mt-4 h-2 w-full rounded-full" />
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

function PredictComponent() {
	const trpc = useTRPC();
	const portfolioUrl = "https://www.yassermekhfi.me";
	const githubRepoUrl = "https://github.com/Yasser5711/M2Predict";
	const huggingFaceUrl = "https://huggingface.co/spaces/yasser5711/m2predict";

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
		<div className="mx-auto w-full max-w-6xl px-5 py-8 sm:py-10">
			{/* Page header */}
			<Fade>
				<div className="mb-8 sm:mb-10">
					<h1 className="font-display text-2xl tracking-tight sm:text-3xl">
						Estimation <span className="text-primary italic">prix / m²</span>
					</h1>
					<p className="mt-1.5 max-w-md text-muted-foreground text-sm">
						Estimation du prix au metre carre pour l'immobilier residentiel en
						France, propulse par le machine learning.
					</p>
				</div>
			</Fade>

			{/* Two-panel layout */}
			<div className="grid gap-6 lg:grid-cols-[minmax(300px,400px)_1fr] lg:gap-10">
				{/* LEFT: Form */}
				<Slide direction="up" offset={30}>
					<div className="lg:sticky lg:top-20 lg:self-start">
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
										<Label className="text-xs">Type de bien</Label>
										<Select
											value={typeLocal}
											onValueChange={(val) =>
												setTypeLocal(val as "Maison" | "Appartement")
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Type de bien" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Appartement">Appartement</SelectItem>
												<SelectItem value="Maison">Maison</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid gap-1.5">
										<Label className="text-xs">Modele</Label>
										<Select
											value={modelVersion}
											onValueChange={(val) =>
												setModelVersion(val as "v1_hgb_te" | "v1_rf_te")
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Modele" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="v1_rf_te">
													RandomForest (v1_rf_te)
												</SelectItem>
												<SelectItem value="v1_hgb_te">
													HistGradientBoosting (v1_hgb_te)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<Button
										type="submit"
										disabled={predict.isPending}
										className="mt-2 w-full"
										size="lg"
									>
										{predict.isPending ? (
											<>
												<Loader2 className="animate-spin" />
												Estimation...
											</>
										) : (
											<>
												<TrendingUp className="size-4" />
												Estimer le prix
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</Slide>

				{/* RIGHT: Results */}
				<div className="min-w-0">
					{/* Empty state */}
					{!predict.data && !predict.isPending && !predict.error && (
						<Fade>
							<div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
								<div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-muted/40">
									<Building2 className="size-9 text-muted-foreground/30" />
								</div>
								<p className="font-display text-lg text-muted-foreground/50 italic">
									Lancez une estimation
								</p>
								<p className="mt-1 max-w-xs text-muted-foreground/40 text-xs">
									Remplissez les parametres et cliquez sur Estimer
								</p>
							</div>
						</Fade>
					)}

					{/* Loading */}
					{predict.isPending && <ResultsSkeleton />}

					{/* Error */}
					{predict.error && (
						<Fade>
							<Card className="border-destructive/20">
								<CardContent className="pt-5">
									<p className="text-destructive text-xs">
										{predict.error.message}
									</p>
								</CardContent>
							</Card>
						</Fade>
					)}

					{/* Results */}
					{hasResult && (
						<div className="grid gap-4" key={predictionKey}>
							{/* Prix/m2 hero */}
							<Slide direction="up" offset={24}>
								<Fade>
									<Shine
										delay={400}
										duration={1400}
										opacity={0.15}
										color="var(--primary)"
										asChild
									>
										<Card>
											<CardContent className="pt-6 pb-6">
												<p className="mb-2 text-muted-foreground text-xs">
													Prix estime par m²
												</p>
												<div className="flex items-baseline gap-2">
													<span className="font-mono font-semibold text-4xl tabular-nums tracking-tight sm:text-5xl">
														<CountingNumber
															number={Math.round(predict.data.prix_m2)}
															thousandSeparator=" "
															transition={{
																stiffness: 35,
																damping: 30,
																mass: 1.2,
															}}
														/>
													</span>
													<span className="font-display text-lg text-muted-foreground italic">
														EUR/m²
													</span>
												</div>
											</CardContent>
										</Card>
									</Shine>
								</Fade>
							</Slide>

							{/* Prix total */}
							<Slide direction="up" offset={24} delay={80}>
								<Fade delay={80}>
									<Card>
										<CardContent className="pt-5">
											<div className="flex items-start justify-between">
												<div>
													<p className="mb-1.5 text-muted-foreground text-xs">
														Prix total estime
													</p>
													<p className="font-medium font-mono text-xl tabular-nums">
														<CountingNumber
															number={Math.round(
																predict.data.prix_total_estime,
															)}
															thousandSeparator=" "
															transition={{
																stiffness: 30,
																damping: 28,
																mass: 1.2,
															}}
														/>
														<span className="ml-1 text-muted-foreground text-sm">
															EUR
														</span>
													</p>
												</div>
												<div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1">
													<Maximize2 className="size-3 text-muted-foreground" />
													<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
														{Number(surface)} m²
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</Fade>
							</Slide>

							{/* Confidence */}
							<Slide direction="up" offset={24} delay={160}>
								<Fade delay={160}>
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-sm">
												Indice de confiance
											</CardTitle>
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
								</Fade>
							</Slide>

							{/* Price range */}
							{predict.data.q10 != null && predict.data.q90 != null && (
								<Slide direction="up" offset={24} delay={240}>
									<Fade delay={240}>
										<Card>
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
									</Fade>
								</Slide>
							)}

							{/* Meta footer */}
							<Fade delay={320}>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted/25 px-3.5 py-2.5 font-mono text-[10px] text-muted-foreground/50">
									<span>model: {predict.data.model_version}</span>
									{predict.data.intervalle_largeur != null && (
										<>
											<span className="text-border">|</span>
											<span>
												largeur:{" "}
												{predict.data.intervalle_largeur.toLocaleString(
													"fr-FR",
												)}{" "}
												EUR/m²
											</span>
										</>
									)}
								</div>
							</Fade>
						</div>
					)}
				</div>
			</div>

			<MethodologySection />

			<SiteFooter
				portfolioUrl={portfolioUrl}
				githubRepoUrl={githubRepoUrl}
				huggingFaceUrl={huggingFaceUrl}
			/>
		</div>
	);
}
