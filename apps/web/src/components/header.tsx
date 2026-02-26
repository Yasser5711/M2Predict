import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
	const { theme, setTheme } = useTheme();

	return (
		<header
			className="sticky top-0 z-50 border-border/50 border-b bg-card/80 backdrop-blur-xl"
			style={{ WebkitBackdropFilter: "blur(20px)" }}
		>
			<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
				<span className="font-medium font-mono text-sm tracking-tight">
					M2Predict
				</span>
				<button
					type="button"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<Sun className="hidden size-4 dark:block" />
					<Moon className="block size-4 dark:hidden" />
				</button>
			</div>
		</header>
	);
}
