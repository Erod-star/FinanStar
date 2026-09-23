# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace

pnpm monorepo (Node 20, pnpm 9): `apps/api` (NestJS 11 + MongoDB/Mongoose) and `apps/mobile` (Expo SDK 57 / React Native, iOS-first).

- Target one app: `pnpm --filter @finanstar/api <script>` / `pnpm --filter @finanstar/mobile <script>`
- Root: `pnpm dev:api`, `pnpm dev:mobile`, `pnpm build:api`, `pnpm typecheck`, `pnpm lint`, `pnpm test`
- `lint` runs `eslint --fix` — it modifies files.
- Single test: `pnpm --filter @finanstar/api test -- <pattern> [-t "name"]`
- Expo packages: install with `npx expo install <pkg>` inside `apps/mobile` (keeps SDK-compatible versions), then `pnpm install`. Don't `pnpm add` them.
- `test:e2e` in api references `test/jest-e2e.json`, which doesn't exist yet.

## Conventions

- English everywhere: comments, docs, commits, identifiers.
- Prettier: single quotes, trailing commas, printWidth 100. `no-explicit-any` is an error in both apps.
- Branches: `feat/<app>/<topic>` (e.g. `feat/api/auth-module`). PR titles: `feat/<app> - <summary>`.

## API (`apps/api/src`)

- Use **relative imports** for internal modules. Existing `src/...` imports are legacy (and aren't mapped in Jest).
- Feature module layout: `<feature>/{*.module, *.controller, *.service, dto/ (with index.ts barrel), entities/}`. Follow `auth/` as reference.
- Entities are Mongoose `@Schema` classes + `SchemaFactory`; inject with `@InjectModel(X.name)`. No migrations.
- Wrap controller responses with `formatToApiResponse` from `apiResponse.ts`.
- Protect routes with `@Auth()` (`auth/decorators/auth.decorator.ts`); modules needing it import `AuthModule`.
- Global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` — every accepted field needs a class-validator decorator in its DTO.
- Env (`apps/api/.env`, see `.env.example`): `MONGO_URI`, `JWT_SECRET`, `PORT` — validated at boot in `config/env.validation.ts`; add new vars there. Default port is 3002.

## Mobile (`apps/mobile`)

- Path aliases `@/*` → `app/*`, `@test/*`, `@assets/*` — defined in tsconfig, babel `module-resolver`, and `jest.config.js`; update all three when changing.
- State: Zustand (`app/store`), server data: TanStack Query (`app/api/queryClient.ts`), forms: react-hook-form + zod.
