# syntax=docker/dockerfile:1.10
#
# The M2Predict web app (`apps/web`, TanStack Start + Nitro `node-server`).
# Built from the REPOSITORY ROOT: pnpm needs every workspace manifest to install
# with the frozen lockfile. The Python model API has its own image
# (`apps/ml/Dockerfile`) and is reached through ML_API_URL.
#
# Nitro bundles every dependency into `apps/web/.output`, so the final image is
# Node plus that directory: no node_modules, no sources.
#
# Runtime env (packages/env/src/server.ts): DATABASE_URL (required),
# BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGIN, ML_API_URL, ML_API_KEY.
# Migrations stay a deploy step (`pnpm db:migrate`), not a container start.

ARG NODE_VERSION=24.22.1

# Only the files `pnpm install` reads. This stage reruns on every change, but
# the layer copied out of it is keyed on its content, so the install below is
# reused until a manifest or the lockfile changes.
FROM node:${NODE_VERSION}-trixie-slim AS manifests
WORKDIR /src
COPY . .
RUN mkdir /out \
	&& for file in package.json apps/*/package.json packages/*/package.json; do \
		cp --parents "$file" /out; \
	done \
	&& cp pnpm-lock.yaml pnpm-workspace.yaml /out

FROM node:${NODE_VERSION}-trixie-slim AS build
ENV PNPM_HOME=/pnpm \
	PATH=/pnpm:$PATH \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# The version in the root package.json's `packageManager`.
RUN corepack enable && corepack prepare pnpm@10.34.6 --activate
WORKDIR /app

COPY --from=manifests /out ./
# `web...`: the web app and the workspace packages it depends on; the TUI and
# the root tooling are not installed.
RUN --mount=type=cache,id=m2predict-pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile --store-dir=/pnpm/store --filter "web..."

COPY . .
RUN pnpm --filter web build

FROM node:${NODE_VERSION}-trixie-slim
ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=3000 \
	TZ=UTC
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/web/.output ./
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
	CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/trpc/healthCheck`).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "server/index.mjs"]
