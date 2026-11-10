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
			<p className="text-foreground font-mono text-xl font-semibold tracking-tight tabular-nums">
				{value}
			</p>
			<p className="text-muted-foreground mt-0.5 text-[11px]">{label}</p>
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
			className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg px-3 py-2.5 ${highlight ? "bg-primary/6 ring-primary/15 ring-1" : "bg-muted/30"}`}
		>
			<span className="text-xs font-medium">{name}</span>
			<span className="text-muted-foreground font-mono text-xs tabular-nums">
				{rmse}
			</span>
			<span
				className={`font-mono text-xs tabular-nums ${highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}
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
				<div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold">
					{step}
				</div>
				{!last && <div className="bg-border/60 my-1 h-full w-px" />}
			</div>
			<div className={`${last ? "" : "pb-4"}`}>
				<p className="text-xs leading-7 font-medium">{label}</p>
				<p className="text-muted-foreground text-[11px]">{detail}</p>
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
		<section className="border-border/40 mt-16 border-t pt-12">
			{/* Section header */}
			<Fade>
				<div className="mb-10 max-w-lg">
					<p className="text-primary mb-2 flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
						<FlaskConical className="size-3.5" />
						Methodologie
					</p>
					<h2 className="font-display text-2xl tracking-tight sm:text-3xl">
						Comment fonctionne{" "}
						<span className="text-primary italic">la prediction</span>
					</h2>
					<p className="text-muted-foreground mt-2 text-sm">
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
									<Database className="text-primary size-3.5" />
									Dataset DVF
								</CardTitle>
								<CardDescription>
									Donnees de transactions immobilieres
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="bg-muted/30 grid grid-cols-3 gap-2 rounded-lg px-4 py-4">
									<Stat value="1,39M" label="Lignes brutes" />
									<Stat value="390K" label="Apres nettoyage" />
									<Stat value="5 830" label="Codes postaux" />
								</div>

								<div className="space-y-2">
									<p className="text-muted-foreground text-xs font-medium">
										Nettoyage applique
									</p>
									<ul className="text-muted-foreground space-y-1.5 text-[12px]">
										<li className="flex items-start gap-2">
											<span className="bg-primary/60 mt-1.5 size-1 shrink-0 rounded-full" />
											Uniquement Maisons et Appartements
										</li>
										<li className="flex items-start gap-2">
											<span className="bg-primary/60 mt-1.5 size-1 shrink-0 rounded-full" />
											Surface &ge; 10 m², valeur fonciere &gt; 0
										</li>
										<li className="flex items-start gap-2">
											<span className="bg-primary/60 mt-1.5 size-1 shrink-0 rounded-full" />
											Prix/m² filtre entre 200 et 60 000 EUR
										</li>
										<li className="flex items-start gap-2">
											<span className="bg-primary/60 mt-1.5 size-1 shrink-0 rounded-full" />
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
									<Layers className="text-primary size-3.5" />
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

								<div className="bg-muted/30 space-y-2 rounded-lg p-3">
									<p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
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

								<div className="bg-primary/6 ring-primary/15 flex items-center gap-2 rounded-md px-3 py-2 ring-1">
									<ArrowDown className="text-primary size-3.5" />
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
									<BrainCircuit className="text-primary size-3.5" />
									Modeles compares
								</CardTitle>
								<CardDescription>
									Performances sur le jeu de test
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Header */}
								<div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 pb-1">
									<span className="text-muted-foreground text-[10px] tracking-wider uppercase">
										Modele
									</span>
									<span className="text-muted-foreground text-[10px] tracking-wider uppercase">
										RMSE
									</span>
									<span className="text-muted-foreground text-[10px] tracking-wider uppercase">
										MAE
									</span>
								</div>

								<div className="space-y-1.5">
									<MetricRow name="RF (One-Hot)" rmse={4176} mae={2150} />
									<MetricRow name="HGB (One-Hot)" rmse={4075} mae={2014} />
									<MetricRow name="RF (Departement)" rmse={4201} mae={2012} />
									<MetricRow name="HGB (Departement)" rmse={4217} mae={1969} />
									<div className="bg-border/50 my-2 h-px" />
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
									<GitBranch className="text-primary size-3" />
									<span className="text-muted-foreground text-[11px]">
										Meilleure precision brute :{" "}
										<span className="text-foreground font-medium">
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
									<ShieldCheck className="text-primary size-3.5" />
									Score de confiance
								</CardTitle>
								<CardDescription>
									Systeme d'incertitude par modele
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="bg-muted/30 space-y-1.5 rounded-lg p-3">
										<p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
											RandomForest
										</p>
										<p className="text-muted-foreground text-[12px] leading-relaxed">
											Predictions de tous les arbres, percentiles q10/q90 de la
											distribution.
										</p>
										<p className="text-primary/70 font-mono text-[10px]">
											rf_tree_quantile_width
										</p>
									</div>
									<div className="bg-muted/30 space-y-1.5 rounded-lg p-3">
										<p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
											HGB Bootstrap
										</p>
										<p className="text-muted-foreground text-[12px] leading-relaxed">
											10 modeles sur echantillons bootstrap, dispersion des
											predictions.
										</p>
										<p className="text-primary/70 font-mono text-[10px]">
											hgb_bootstrap_width
										</p>
									</div>
								</div>

								<div className="space-y-0.5">
									<p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase">
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
								<Workflow className="text-primary size-3.5" />
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
