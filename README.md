# FinanStar

Personal finance application built with React Native, NestJS, and MongoDB for practicing full-stack development, database management, and deployments.

<p align="center">
  <img
    src="apps/mobile/assets/FinanStarLogo.png"
    alt="FinanStar Logo"
    width="300"
  />
</p>

## Structure

```
FinanStar/
│
├── apps/
│   ├── api/ // NestJS + MongoDB (Mongoose)
│   │
│   └── mobile/ // Expo / React Native (iOS first)
│
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Requisitos previos

- Node.js 20 o superior (revisa `.nvmrc`).
- pnpm: `corepack enable && corepack prepare pnpm@9.12.0 --activate` (o `npm i -g pnpm`).
- Xcode + simulador de iOS (para `apps/mobile`) o la app Expo Go en tu telefono.
- Una cuenta de MongoDB Atlas (tier gratuito M0) para `apps/api`.

## 1. Instalar dependencias

Desde la raiz del repo:

```bash
pnpm install
```

Esto instala las dependencias de `apps/api`. Las dependencias de `apps/mobile` ligadas al SDK de Expo (React Native, React, Expo, navegacion, gestos, etc.) **no vienen fijadas a una version** en su `package.json` a proposito: instalalas con el propio CLI de Expo para que resuelva las versiones correctas de tu SDK instalado:

```bash
cd apps/mobile
npx expo install expo react react-dom react-native expo-status-bar expo-secure-store \
  react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer
npx expo install --dev jest-expo @testing-library/react-native @types/react @types/react-dom
cd ../..
pnpm install
```

## 2. Configurar variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
```

Edita `apps/api/.env` con la cadena de conexion de tu cluster de MongoDB Atlas (`MONGO_URI`) y un `JWT_SECRET` propio (se usara a partir de la fase 1, cuando se agregue autenticacion).

## 3. Correr los proyectos

```bash
pnpm dev:api      # Nest en modo watch, http://localhost:3000/health
pnpm dev:mobile   # abre el bundler de Expo (presiona i para iOS)
```

## 4. Calidad de codigo

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Roadmap

Este repo sigue el roadmap acordado (fases 0 a 6: setup, auth + gastos, ingresos + presupuesto, prestamos + resumenes, multiusuario, testing, despliegue). Esta entrega cubre la **fase 0**: monorepo con pnpm workspaces, TypeScript estricto en ambos proyectos, ESLint/Prettier, y el modulo de Mongo/Config listo en la API (falta crear el cluster de Atlas y pegar su URI en `.env`).
