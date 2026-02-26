import type { AppRouter } from "@M2Predict/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ThemeProvider } from "next-themes";

import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import Header from "../components/header";
import appCss from "../index.css?url";

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "M2Predict",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
	notFoundComponent: NotFound,
	errorComponent: RootError,
});

function NotFound() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 text-center">
			<p className="font-mono font-semibold text-6xl text-muted-foreground/30 tabular-nums tracking-tight">
				404
			</p>
			<p className="text-muted-foreground text-sm">Page introuvable</p>
			<Link
				to="/"
				className={buttonVariants({ variant: "outline", size: "sm" })}
			>
				Retour
			</Link>
		</div>
	);
}

function RootError({ error }: { error: unknown }) {
	const message =
		error instanceof Error ? error.message : "Une erreur est survenue";

	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 text-center">
			<p className="font-mono font-semibold text-4xl text-destructive/50 tracking-tight">
				Erreur
			</p>
			<p className="max-w-md text-muted-foreground text-xs">{message}</p>
			<Link
				to="/"
				className={buttonVariants({ variant: "outline", size: "sm" })}
			>
				Retour
			</Link>
		</div>
	);
}

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
				>
					<div className="bg-mesh" />
					<div className="grid h-svh grid-rows-[auto_1fr]">
						<Header />
						<Outlet />
					</div>
					<Toaster richColors />
				</ThemeProvider>
				<TanStackRouterDevtools position="bottom-left" />
				<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
