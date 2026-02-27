import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === "dark";

	return (
		<header
			className="sticky top-0 z-50 border-border/40 border-b bg-card/60 backdrop-blur-2xl"
			style={{ WebkitBackdropFilter: "blur(24px) saturate(1.5)" }}
		>
			<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
				<div className="flex items-baseline gap-1.5">
					<span className="font-display text-lg tracking-tight">
						M<sup className="font-sans text-[0.55em] text-primary">2</sup>
					</span>
					<span className="font-display text-lg italic tracking-tight">
						Predict
					</span>
				</div>

				<button
					type="button"
					onClick={() => setTheme(isDark ? "light" : "dark")}
					className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
				>
					{mounted ? (
						<AnimatePresence mode="wait" initial={false}>
							{isDark ? (
								<motion.span
									key="sun"
									initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
									animate={{ scale: 1, opacity: 1, rotate: 0 }}
									exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
									transition={{ duration: 0.2 }}
								>
									<Sun className="size-4" />
								</motion.span>
							) : (
								<motion.span
									key="moon"
									initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
									animate={{ scale: 1, opacity: 1, rotate: 0 }}
									exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
									transition={{ duration: 0.2 }}
								>
									<Moon className="size-4" />
								</motion.span>
							)}
						</AnimatePresence>
					) : (
						<span className="size-4" />
					)}
				</button>
			</div>
		</header>
	);
}
