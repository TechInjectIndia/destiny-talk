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
