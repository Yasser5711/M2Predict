const ML_API_URL = "http://localhost:8000";

function ask(question: string): string {
	process.stdout.write(question);
	return prompt("") ?? "";
}

async function predict() {
	const code_postal = ask("  Code postal: ");
	const surface = ask("  Surface (m²): ");
	const pieces = ask("  Nombre de pièces: ");

	console.log("  Type de bien:");
	console.log("    1. Appartement");
	console.log("    2. Maison");
	const typeChoice = ask("  Choix (1/2): ");
	const type_local = typeChoice === "2" ? "Maison" : "Appartement";

	console.log(`\n  Estimation en cours pour un ${type_local}...`);

	try {
		const res = await fetch(`${ML_API_URL}/predict`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code_postal,
				surface_reelle_bati: Number(surface),
				nombre_pieces_principales: Number(pieces),
				type_local,
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			console.error(`\n  Erreur API: ${res.status} ${text}`);
			return;
		}

		const data = (await res.json()) as {
			model_version: string;
			prix_m2: number;
			prix_total_estime: number;
		};

		console.log("\n  ─── Résultat ───");
		console.log(`  Modèle:      ${data.model_version}`);
		console.log(
			`  Prix/m²:     ${data.prix_m2.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`,
		);
		console.log(
			`  Prix total:  ${data.prix_total_estime.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`,
		);
	} catch {
		console.error(
			"\n  Erreur: impossible de contacter le serveur ML (http://localhost:8000).",
		);
		console.error("  Assurez-vous que le serveur FastAPI est lancé.");
	}
}

console.log("\n  M2Predict — Estimation prix/m²");
console.log("  Tapez 'q' pour quitter.\n");

while (true) {
	await predict();
	console.log("");
	const again = ask("  Nouvelle estimation ? (Enter/q): ");
	if (again.toLowerCase() === "q") break;
	console.log("");
}
