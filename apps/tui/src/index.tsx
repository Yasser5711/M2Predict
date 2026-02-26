import {
	createCliRenderer,
	type KeyEvent,
	type SelectOption,
} from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";

/* ─────────────────────────────────────────────────────
   Constants & Types
   ───────────────────────────────────────────────────── */

const ML_API_URL = "http://localhost:8000";

const TEAL = "#4FD1C5";
const GOLD = "#F6C343";
const MUTED = "#6B7280";
const ERR = "#FF6B6B";
const SUCCESS = "#51CF66";
const DIM = "#444444";
const LABEL = "#9CA3AF";
const WHITE = "#F3F4F6";

const HOUSING_TYPES: SelectOption[] = [
	{
		name: "Appartement",
		description: "Logement en immeuble collectif",
		value: "Appartement",
	},
	{ name: "Maison", description: "Habitation individuelle", value: "Maison" },
];

const MODEL_OPTIONS: SelectOption[] = [
	{
		name: "RandomForest",
		description: "v1_rf_te — Meilleure precision brute",
		value: "v1_rf_te",
	},
	{
		name: "HistGradientBoosting",
		description: "v1_hgb_te — Meilleure stabilite",
		value: "v1_hgb_te",
	},
];

type PredictResponse = {
	model_version: string;
	prix_m2: number;
	prix_total_estime: number;
	score_confiance?: number;
	confidence_method?: string;
	q10?: number | null;
	q90?: number | null;
	intervalle_largeur?: number | null;
};

type AppState = "form" | "loading" | "results" | "error";

/* ─────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────── */

function euro(value: number): string {
	return value.toLocaleString("fr-FR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function confidenceLabel(score: number): { text: string; color: string } {
	if (score >= 0.8) return { text: "Haute", color: SUCCESS };
	if (score >= 0.5) return { text: "Moyenne", color: GOLD };
	return { text: "Faible", color: ERR };
}

function confidenceBar(score: number, width: number): string {
	const filled = Math.round(score * width);
	const empty = width - filled;
	return "█".repeat(filled) + "░".repeat(empty);
}

/* ─────────────────────────────────────────────────────
   Field definitions for focus cycling
   ───────────────────────────────────────────────────── */

const FIELD_COUNT = 5; // code_postal, surface, pieces, type, model

/* ─────────────────────────────────────────────────────
   App Component
   ───────────────────────────────────────────────────── */

function App() {
	/* form state */
	const [codePostal, setCodePostal] = useState("");
	const [surface, setSurface] = useState("");
	const [pieces, setPieces] = useState("");
	const [typeIndex, setTypeIndex] = useState(0);
	const [modelIndex, setModelIndex] = useState(0);

	/* ui state */
	const [focusIndex, setFocusIndex] = useState(0);
	const [appState, setAppState] = useState<AppState>("form");
	const [result, setResult] = useState<PredictResponse | null>(null);
	const [errorMsg, setErrorMsg] = useState("");

	/* submit handler */
	const handleSubmit = useCallback(async () => {
		if (!codePostal || !surface || !pieces) return;

		setAppState("loading");
		setResult(null);
		setErrorMsg("");

		try {
			const res = await fetch(`${ML_API_URL}/predict`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code_postal: codePostal,
					surface_reelle_bati: Number(surface),
					nombre_pieces_principales: Number(pieces),
					type_local: HOUSING_TYPES[typeIndex]?.value ?? "Appartement",
					model_version: MODEL_OPTIONS[modelIndex]?.value ?? "v1_rf_te",
				}),
			});

			if (!res.ok) {
				const text = await res.text();
				setErrorMsg(`Erreur API ${res.status}: ${text}`);
				setAppState("error");
				return;
			}

			const data = (await res.json()) as PredictResponse;
			setResult(data);
			setAppState("results");
		} catch {
			setErrorMsg(
				`Impossible de contacter le serveur (${ML_API_URL}). Verifiez que FastAPI est lance.`,
			);
			setAppState("error");
		}
	}, [codePostal, surface, pieces, typeIndex, modelIndex]);

	/* reset to form */
	const resetForm = useCallback(() => {
		setAppState("form");
		setFocusIndex(0);
	}, []);

	/* keyboard navigation */
	useKeyboard(
		useCallback(
			(key: KeyEvent) => {
				if (key.name === "escape") {
					if (appState === "results" || appState === "error") {
						resetForm();
					} else {
						process.exit(0);
					}
					return;
				}

				if (appState === "results" || appState === "error") {
					if (key.name === "return" || key.name === "n") {
						resetForm();
					}
					if (key.name === "q") {
						process.exit(0);
					}
					return;
				}

				if (appState !== "form") return;

				if (key.name === "tab" || key.name === "down") {
					setFocusIndex((i: number) => (i + 1) % FIELD_COUNT);
				} else if (key.name === "up") {
					setFocusIndex((i: number) => (i - 1 + FIELD_COUNT) % FIELD_COUNT);
				} else if (key.name === "return") {
					if (focusIndex < FIELD_COUNT - 1) {
						setFocusIndex((i: number) => i + 1);
					} else {
						handleSubmit();
					}
				}
			},
			[appState, focusIndex, handleSubmit, resetForm],
		),
	);

	return (
		<box style={{ flexDirection: "column", padding: 1, gap: 1 }}>
			{/* ── Header ────────────────────────────── */}
			<box style={{ flexDirection: "column" }}>
				<ascii-font text="M2Predict" font="slick" />
				<text fg={MUTED}>
					Estimation du prix au m² — immobilier residentiel en France
				</text>
			</box>

			{/* ── Main content ───────────────────────── */}
			<box style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
				{/* LEFT: Form panel */}
				<box
					title=" Parametres "
					border
					borderStyle="rounded"
					borderColor={appState === "form" ? TEAL : DIM}
					style={{
						flexDirection: "column",
						padding: 1,
						gap: 1,
						width: "40%",
					}}
				>
					{/* Code postal */}
					<box style={{ flexDirection: "column" }}>
						<text fg={LABEL}>
							<span fg={TEAL}>●</span> Code postal
						</text>
						<input
							placeholder="ex: 75011"
							value={codePostal}
							focused={appState === "form" && focusIndex === 0}
							onInput={(v: string) => setCodePostal(v)}
						/>
					</box>

					{/* Surface */}
					<box style={{ flexDirection: "column" }}>
						<text fg={LABEL}>
							<span fg={TEAL}>●</span> Surface (m²)
						</text>
						<input
							placeholder="ex: 42"
							value={surface}
							focused={appState === "form" && focusIndex === 1}
							onInput={(v: string) => setSurface(v)}
						/>
					</box>

					{/* Pieces */}
					<box style={{ flexDirection: "column" }}>
						<text fg={LABEL}>
							<span fg={TEAL}>●</span> Nombre de pieces
						</text>
						<input
							placeholder="ex: 2"
							value={pieces}
							focused={appState === "form" && focusIndex === 2}
							onInput={(v: string) => setPieces(v)}
						/>
					</box>

					{/* Type de bien */}
					<box style={{ flexDirection: "column" }}>
						<text fg={LABEL}>
							<span fg={TEAL}>●</span> Type de bien
						</text>
						<select
							options={HOUSING_TYPES}
							focused={appState === "form" && focusIndex === 3}
							onChange={(i: number, _opt: SelectOption | null) =>
								setTypeIndex(i)
							}
						/>
					</box>

					{/* Modele */}
					<box style={{ flexDirection: "column" }}>
						<text fg={LABEL}>
							<span fg={TEAL}>●</span> Modele ML
						</text>
						<select
							options={MODEL_OPTIONS}
							focused={appState === "form" && focusIndex === 4}
							onChange={(i: number, _opt: SelectOption | null) =>
								setModelIndex(i)
							}
						/>
					</box>
				</box>

				{/* RIGHT: Results panel */}
				<box
					title=" Resultats "
					border
					borderStyle="rounded"
					borderColor={
						appState === "results" ? GOLD : appState === "error" ? ERR : DIM
					}
					style={{
						flexDirection: "column",
						padding: 1,
						gap: 1,
						flexGrow: 1,
					}}
				>
					{/* Empty state */}
					{appState === "form" && (
						<box
							style={{
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								flexGrow: 1,
								gap: 1,
							}}
						>
							<text fg={DIM}>┌─────────────────────┐</text>
							<text fg={DIM}>│ Lancez une │</text>
							<text fg={DIM}>│ estimation │</text>
							<text fg={DIM}>└─────────────────────┘</text>
							<text fg={MUTED}>
								Remplissez le formulaire puis appuyez sur Enter
							</text>
						</box>
					)}

					{/* Loading state */}
					{appState === "loading" && (
						<box
							style={{
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								flexGrow: 1,
							}}
						>
							<text fg={TEAL}>⣾ Estimation en cours...</text>
						</box>
					)}

					{/* Error state */}
					{appState === "error" && (
						<box style={{ flexDirection: "column", gap: 1 }}>
							<text fg={ERR}>
								<b>✗ Erreur</b>
							</text>
							<text fg={MUTED}>{errorMsg}</text>
							<text fg={DIM}>────────────────────────────────────────</text>
							<text fg={MUTED}>
								Appuyez sur <b fg={WHITE}>N</b> pour reessayer ou{" "}
								<b fg={WHITE}>Q</b> pour quitter
							</text>
						</box>
					)}

					{/* Results */}
					{appState === "results" && result && (
						<box style={{ flexDirection: "column", gap: 1 }}>
							{/* Prix / m² hero */}
							<box
								border
								borderStyle="rounded"
								borderColor={TEAL}
								style={{ flexDirection: "column", padding: 1 }}
							>
								<text fg={MUTED}>Prix estime par m²</text>
								<text>
									<b fg={GOLD}>{euro(result.prix_m2)}</b>{" "}
									<span fg={MUTED}>EUR/m²</span>
								</text>
							</box>

							{/* Prix total */}
							<box style={{ flexDirection: "row", gap: 2 }}>
								<box style={{ flexDirection: "column", flexGrow: 1 }}>
									<text fg={MUTED}>Prix total estime</text>
									<text>
										<b fg={WHITE}>{euro(result.prix_total_estime)}</b>{" "}
										<span fg={MUTED}>EUR</span>
									</text>
								</box>
								<box style={{ flexDirection: "column" }}>
									<text fg={MUTED}>Surface</text>
									<text fg={WHITE}>{surface} m²</text>
								</box>
							</box>

							<text fg={DIM}>────────────────────────────────────────</text>

							{/* Confidence */}
							{typeof result.score_confiance === "number" && (
								<box style={{ flexDirection: "column" }}>
									<text fg={MUTED}>
										Indice de confiance :{" "}
										<span fg={confidenceLabel(result.score_confiance).color}>
											{confidenceLabel(result.score_confiance).text}
										</span>
									</text>
									<text>
										<span fg={confidenceLabel(result.score_confiance).color}>
											{confidenceBar(result.score_confiance, 30)}
										</span>{" "}
										<span fg={WHITE}>
											{(result.score_confiance * 100).toFixed(1)}%
										</span>
									</text>
								</box>
							)}

							{/* Fourchette */}
							{typeof result.q10 === "number" &&
								typeof result.q90 === "number" && (
									<box style={{ flexDirection: "column" }}>
										<text fg={MUTED}>Fourchette de prix (P10 — P90)</text>
										<text>
											<span fg={MUTED}>{euro(result.q10)}</span>
											<span fg={DIM}> ◄───────► </span>
											<span fg={MUTED}>{euro(result.q90)}</span>
											<span fg={MUTED}> EUR/m²</span>
										</text>
									</box>
								)}

							<text fg={DIM}>────────────────────────────────────────</text>

							{/* Meta */}
							<text fg={DIM}>
								modele: {result.model_version}
								{result.confidence_method
									? ` │ methode: ${result.confidence_method}`
									: ""}
								{typeof result.intervalle_largeur === "number"
									? ` │ largeur: ${euro(result.intervalle_largeur)} EUR/m²`
									: ""}
							</text>

							<text fg={MUTED}>
								<b fg={WHITE}>N</b> nouvelle estimation │ <b fg={WHITE}>Q</b>{" "}
								quitter
							</text>
						</box>
					)}
				</box>
			</box>

			{/* ── Status bar ──────────────────────────── */}
			<box
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<text fg={MUTED}>
					{appState === "form" ? (
						<>
							<span fg={DIM}>Tab/↑↓</span> naviguer <span fg={DIM}>│</span>{" "}
							<span fg={DIM}>Enter</span> valider <span fg={DIM}>│</span>{" "}
							<span fg={DIM}>Esc</span> quitter
						</>
					) : appState === "results" || appState === "error" ? (
						<>
							<span fg={DIM}>N</span> nouvelle estimation{" "}
							<span fg={DIM}>│</span> <span fg={DIM}>Q</span> quitter{" "}
							<span fg={DIM}>│</span> <span fg={DIM}>Esc</span> retour
						</>
					) : (
						<span fg={TEAL}>Chargement...</span>
					)}
				</text>
				<text fg={DIM}>M²Predict TUI v1.0</text>
			</box>
		</box>
	);
}

/* ─────────────────────────────────────────────────────
   Bootstrap
   ───────────────────────────────────────────────────── */

const renderer = await createCliRenderer({ exitOnCtrlC: true });
createRoot(renderer).render(<App />);
