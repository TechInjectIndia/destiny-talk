# DestinyAI Core Platform

## Overview
DestinyAI is a consumer-facing AI-powered Numerology & Destiny Platform. It combines strict mathematical numerology algorithms with the empathetic reasoning of Large Language Models (LLMs) to provide personalized, context-aware guidance.

Unlike generic chatbots, DestinyAI anchors every conversation to a "Destiny Blueprint" (a structured numerology report), ensuring consistency and deep personalization.

## Documentation Index
The project specification is broken down into the following implementation-ready documents:

1. **[Product Vision & PRD](specs/01_product_vision_prd.md)**
   - Business Strategy & Moat
   - User Journeys
   - Core Features

2. **[Technical Architecture & Schema](specs/02_architecture_schema.md)**
   - Firestore JSON Schema
   - Wallet & Ledger Logic
   - Payment Integration
   - Turborepo Structure
   - Security Rules

3. **[AI System & Prompts](specs/03_ai_system.md)**
   - Report Mode vs. Planning Mode
   - System Prompts (Copy-Ready)
   - Context Injection Strategy

4. **[Admin Platform & Roadmap](specs/04_admin_roadmap.md)**
   - Admin Dashboard Requirements
   - Analytics & Metrics
   - Phased Rollout Plan

## Quick Start (Engineering)
This project uses a **Next.js + Turborepo** architecture.

### Prerequisites
- Node.js 20+
- Firebase Project (Blaze Plan)
- Gemini API Key / OpenAI API Key

### Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind, Framer Motion
- **Backend:** Firebase Cloud Functions, Firestore
- **AI:** Google GenAI SDK (Gemini Models)
- **State:** Zustand (Client), Server Actions (Server)

## Deployment to Vercel

This monorepo uses Turborepo and is configured for deployment to Vercel. Both `apps/client` and `apps/admin` can be deployed as separate Vercel projects.

### Prerequisites
- Vercel account
- Environment variables configured in Vercel dashboard (see below)

### Environment Variables

Configure these in your Vercel project settings:

**Client App:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `API_KEY` (Gemini API key)

**Admin App:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Deploying Client App

1. Create a new Vercel project (or use existing)
2. Connect your Git repository
3. In project settings, set **Root Directory** to `apps/client`
4. Vercel will auto-detect:
   - Framework: Next.js
   - Build Command: `turbo build` (from `apps/client/vercel.json`)
   - Output Directory: `.next`
   - Install Command: Auto-detected (bun install from root)
5. Add environment variables (see above)
6. Deploy

### Deploying Admin App

1. Create a **separate** Vercel project
2. Connect the same Git repository
3. In project settings, set **Root Directory** to `apps/admin`
4. Vercel will auto-detect:
   - Framework: Next.js
   - Build Command: `turbo build` (from `apps/admin/vercel.json`)
   - Output Directory: `.next`
   - Install Command: Auto-detected (bun install from root)
5. Add environment variables (see above)
6. Deploy

### How It Works

- Vercel detects the monorepo structure and `bun.lock` file
- Automatically installs dependencies from the root using bun
- Turborepo automatically filters builds to only the app in the root directory
- Both apps share the same workspace packages but deploy independently
- Turborepo caches unchanged packages across deployments

### Troubleshooting

If builds fail:
1. Verify Root Directory is set correctly in Vercel project settings
2. Check that all environment variables are configured
3. Ensure `turbo.json` has the correct output paths (`.next/**`)
4. Review build logs for specific errors
