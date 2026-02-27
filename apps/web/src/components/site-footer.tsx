import { Clock3, Github, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { HuggingFace } from "./ui/svgs/huggingFace";

type SiteFooterProps = {
	portfolioUrl: string;
	githubRepoUrl: string;
	huggingFaceUrl: string;
};

export function SiteFooter({
	portfolioUrl,
	githubRepoUrl,
	huggingFaceUrl,
}: SiteFooterProps) {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const interval = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(interval);
	}, []);

	const currentYear = now?.getFullYear() ?? "----";
	const currentHour =
		now?.toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}) ?? "--:--:--";

	return (
		<footer className="mt-10 rounded-2xl border border-border/60 bg-card/50 px-4 py-4">
			<div className="flex flex-col gap-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5">
					<Clock3 className="size-4" />
					<span className="font-mono tabular-nums">{currentHour}</span>
					<span>|</span>
					<span>{currentYear}</span>
				</div>

				<div className="flex flex-wrap items-center gap-4">
					<a
						href={portfolioUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
					>
						<Globe className="size-4" />
						Portfolio
					</a>
					<a
						href={githubRepoUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
					>
						<Github className="size-4" />
						GitHub Repo
					</a>
					<a
						href={huggingFaceUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
					>
						<HuggingFace className="size-4" />
						Hugging Face
					</a>
				</div>
			</div>
		</footer>
	);
}
