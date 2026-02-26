import {
	ArrowDown,
	BrainCircuit,
	Database,
	FlaskConical,
	GitBranch,
	Layers,
	ShieldCheck,
	Workflow,
} from "lucide-react";

import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Slide } from "@/components/animate-ui/primitives/effects/slide";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/* ── stat badge ─────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="text-center">
			<p className="font-mono font-semibold text-foreground text-xl tabular-nums tracking-tight">
				{value}
			</p>
			<p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
		</div>
	);
}

/* ── model metric row ───────────────────────────────── */
function MetricRow({
	name,
	rmse,
	mae,
	highlight,
}: {
	name: string;
	rmse: number;
	mae: number;
	highlight?: boolean;
}) {
	return (
		<div
			className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg px-3 py-2.5 ${highlight ? "bg-primary/6 ring-1 ring-primary/15" : "bg-muted/30"}`}
		>
			<span className="font-medium text-xs">{name}</span>
			<span className="font-mono text-muted-foreground text-xs tabular-nums">
				{rmse}
			</span>
			<span
				className={`font-mono text-xs tabular-nums ${highlight ? "font-semibold text-primary" : "text-muted-foreground"}`}
			>
				{mae}
			</span>
		</div>
	);
}

/* ── pipeline step ──────────────────────────────────── */
function PipelineStep({
	step,
	label,
	detail,
	last,
}: {
	step: number;
	label: string;
	detail: string;
	last?: boolean;
}) {
	return (
		<div className="flex gap-3">
			<div className="flex flex-col items-center">
				<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono font-semibold text-[11px] text-primary">
					{step}
				</div>
				{!last && <div className="my-1 h-full w-px bg-border/60" />}
			</div>
			<div className={`${last ? "" : "pb-4"}`}>
				<p className="font-medium text-xs leading-7">{label}</p>
				<p className="text-[11px] text-muted-foreground">{detail}</p>
			</div>
		</div>
	);
}

/* ── confidence row ─────────────────────────────────── */
function ConfidenceRow({
	range,
	label,
	color,
}: {
	range: string;
	label: string;
	color: string;
}) {
	return (
		<div className="flex items-center justify-between rounded-md px-3 py-1.5">
			<div className="flex items-center gap-2.5">
				<div
					className="size-2 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<span className="font-mono text-xs tabular-nums">{range}</span>
			</div>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════ */
export function MethodologySection() {
	return (
		<section className="mt-16 border-border/40 border-t pt-12">
			{/* Section header */}
			<Fade>
				<div className="mb-10 max-w-lg">
					<p className="mb-2 flex items-center gap-2 font-medium text-primary text-xs uppercase tracking-widest">
						<FlaskConical className="size-3.5" />
						Methodologie
					</p>
					<h2 className="font-display text-2xl tracking-tight sm:text-3xl">
						Comment fonctionne{" "}
						<span className="text-primary italic">la prediction</span>
					</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Notre modele s'appuie sur les donnees DVF (Demande de Valeurs
						Foncieres), un jeu de donnees public de transactions immobilieres en
						France.
					</p>
				</div>
			</Fade>

			<div className="grid gap-5 lg:grid-cols-2">
				{/* ── Dataset card ──────────────────────── */}
				<Slide direction="up" offset={20} inView inViewOnce>
					<Fade inView inViewOnce>
						<Card className="h-full">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-sm">
									<Database className="size-3.5 text-primary" />
									Dataset DVF
								</CardTitle>
								<CardDescription>
									Donnees de transactions immobilieres
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 px-4 py-4">
									<Stat value="1,39M" label="Lignes brutes" />
									<Stat value="390K" label="Apres nettoyage" />
									<Stat value="5 830" label="Codes postaux" />
								</div>

								<div className="space-y-2">
									<p className="font-medium text-muted-foreground text-xs">
										Nettoyage applique
									</p>
									<ul className="space-y-1.5 text-[12px] text-muted-foreground">
										<li className="flex items-start gap-2">
											<span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
											Uniquement Maisons et Appartements
										</li>
										<li className="flex items-start gap-2">
											<span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
											Surface &ge; 10 m², valeur fonciere &gt; 0
										</li>
										<li className="flex items-start gap-2">
											<span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
											Prix/m² filtre entre 200 et 60 000 EUR
										</li>
										<li className="flex items-start gap-2">
											<span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
											Mediane finale : 2 685 EUR/m²
										</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</Fade>
				</Slide>

				{/* ── Target Encoding card ──────────────── */}
				<Slide direction="up" offset={20} delay={80} inView inViewOnce>
					<Fade delay={80} inView inViewOnce>
						<Card className="h-full">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-sm">
									<Layers className="size-3.5 text-primary" />
									Target Encoding
								</CardTitle>
								<CardDescription>Encodage geographique retenu</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground text-xs leading-relaxed">
									Le code postal est remplace par le prix moyen au m² observe
									dans cette zone (calcule uniquement sur le jeu
									d'entrainement). Cette technique compresse 5 830 colonnes
									one-hot en une seule variable a fort signal geographique.
								</p>

								<div className="space-y-2 rounded-lg bg-muted/30 p-3">
									<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
										Parametres
									</p>
									<div className="grid grid-cols-2 gap-y-2 font-mono text-xs">
										<span className="text-muted-foreground">Methode</span>
										<span>KFold OOF</span>
										<span className="text-muted-foreground">Smoothing</span>
										<span>20</span>
										<span className="text-muted-foreground">Fallback</span>
										<span>Moyenne globale</span>
									</div>
								</div>

								<div className="flex items-center gap-2 rounded-md bg-primary/6 px-3 py-2 ring-1 ring-primary/15">
									<ArrowDown className="size-3.5 text-primary" />
									<span className="text-primary text-xs">
										MAE amelioree de ~2 150 a ~1 700 EUR/m²
									</span>
								</div>
							</CardContent>
						</Card>
					</Fade>
				</Slide>

				{/* ── Model comparison card ─────────────── */}
				<Slide direction="up" offset={20} delay={160} inView inViewOnce>
					<Fade delay={160} inView inViewOnce>
						<Card className="h-full">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-sm">
									<BrainCircuit className="size-3.5 text-primary" />
									Modeles compares
								</CardTitle>
								<CardDescription>
									Performances sur le jeu de test
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Header */}
								<div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 pb-1">
									<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
										Modele
									</span>
									<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
										RMSE
									</span>
									<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
										MAE
									</span>
								</div>

								<div className="space-y-1.5">
									<MetricRow name="RF (One-Hot)" rmse={4176} mae={2150} />
									<MetricRow name="HGB (One-Hot)" rmse={4075} mae={2014} />
									<MetricRow name="RF (Departement)" rmse={4201} mae={2012} />
									<MetricRow name="HGB (Departement)" rmse={4217} mae={1969} />
									<div className="my-2 h-px bg-border/50" />
									<MetricRow
										name="RF + TE (v1_rf_te)"
										rmse={3737}
										mae={1701}
										highlight
									/>
									<MetricRow
										name="HGB + TE (v1_hgb_te)"
										rmse={3823}
										mae={1746}
									/>
								</div>

								<div className="flex items-center gap-2 pt-1">
									<GitBranch className="size-3 text-primary" />
									<span className="text-[11px] text-muted-foreground">
										Meilleure precision brute :{" "}
										<span className="font-medium text-foreground">
											RandomForest + TE
										</span>
									</span>
								</div>
							</CardContent>
						</Card>
					</Fade>
				</Slide>

				{/* ── Confidence score card ─────────────── */}
				<Slide direction="up" offset={20} delay={240} inView inViewOnce>
					<Fade delay={240} inView inViewOnce>
						<Card className="h-full">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-sm">
									<ShieldCheck className="size-3.5 text-primary" />
									Score de confiance
								</CardTitle>
								<CardDescription>
									Systeme d'incertitude par modele
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="space-y-1.5 rounded-lg bg-muted/30 p-3">
										<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
											RandomForest
										</p>
										<p className="text-[12px] text-muted-foreground leading-relaxed">
											Predictions de tous les arbres, percentiles q10/q90 de la
											distribution.
										</p>
										<p className="font-mono text-[10px] text-primary/70">
											rf_tree_quantile_width
										</p>
									</div>
									<div className="space-y-1.5 rounded-lg bg-muted/30 p-3">
										<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
											HGB Bootstrap
										</p>
										<p className="text-[12px] text-muted-foreground leading-relaxed">
											10 modeles sur echantillons bootstrap, dispersion des
											predictions.
										</p>
										<p className="font-mono text-[10px] text-primary/70">
											hgb_bootstrap_width
										</p>
									</div>
								</div>

								<div className="space-y-0.5">
									<p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
										Interpretation
									</p>
									<ConfidenceRow
										range="≥ 0.80"
										label="Tres fiable"
										color="var(--confidence-high)"
									/>
									<ConfidenceRow
										range="0.65 – 0.80"
										label="Fiable"
										color="var(--chart-2)"
									/>
									<ConfidenceRow
										range="0.50 – 0.65"
										label="Incertain"
										color="var(--confidence-medium)"
									/>
									<ConfidenceRow
										range="< 0.50"
										label="Risque"
										color="var(--destructive)"
									/>
								</div>
							</CardContent>
						</Card>
					</Fade>
				</Slide>
			</div>

			{/* ── Pipeline card (full width) ────────── */}
			<Slide direction="up" offset={20} delay={100} inView inViewOnce>
				<Fade delay={100} inView inViewOnce>
					<Card className="mt-5">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-sm">
								<Workflow className="size-3.5 text-primary" />
								Pipeline de prediction
							</CardTitle>
							<CardDescription>
								Etapes internes lors d'une requete
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-0 sm:grid-cols-2 sm:gap-x-10">
								<div>
									<PipelineStep
										step={1}
										label="Extraction departement"
										detail="Les 2 premiers chiffres du code postal"
									/>
									<PipelineStep
										step={2}
										label="Target Encoding"
										detail="cp → prix_m2 moyen, fallback moyenne globale"
									/>
									<PipelineStep
										step={3}
										label="Prediction"
										detail="Passage dans le pipeline scikit-learn"
									/>
								</div>
								<div>
									<PipelineStep
										step={4}
										label="Calcul d'incertitude"
										detail="Quantiles q10/q90 via arbres ou bootstrap"
									/>
									<PipelineStep
										step={5}
										label="Score de confiance"
										detail="Normalise entre p5 et p95 observes au training"
										last
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</Fade>
			</Slide>
		</section>
	);
}
