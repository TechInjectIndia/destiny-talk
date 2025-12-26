# DestinyAI Implementation Checklist

## Phase 0: Project Initialization 🛠️
- [x] **Repo Setup**
  - [x] Initialize Turborepo structure (`apps/web`, `apps/admin`, `packages/ui`, `packages/core`, `packages/database`).
  - [x] Configure TypeScript, ESLint, and Prettier shared packages.
  - [x] Set up Shadcn/UI and Tailwind CSS in `packages/ui`.
- [x] **Firebase Setup**
  - [x] Create Firebase Project (Blaze Plan).
  - [x] Enable Auth (Google, Email/Password).
  - [x] Enable Firestore & Storage.
  - [x] Initialize Firebase Admin SDK in `packages/database`.
  - [x] Write initial Firestore Security Rules (`specs/02_architecture_schema.md`).

## Phase 1: The Core (MVP) 🚀

### 1. Authentication & Profile
- [x] **User Auth**
  - [x] Implement Login/Signup pages in `apps/web`.
  - [x] Create `onCreateUser` Cloud Function to initialize user document in Firestore.
- [x] **Data Intake Flow**
  - [x] Build "My Profile" form (Name, DOB, Time, Place of Birth, Gender).
  - [x] Save profile data to `users/{uid}`.

### 2. Core Numerology Engine (`packages/core`)
- [x] **Algorithms**
  - [x] Implement `calculateMoolank(dob)`.
  - [x] Implement `calculateBhagyank(dob)`.
  - [x] Implement `calculateLoshuGrid(dob)`.
  - [x] Implement `calculateKuaNumber(dob, gender)`.
  - [x] Write unit tests for all calculations.

### 3. Wallet System (Ledger) 💰
- [x] **Backend Logic**
  - [x] Create `deductWalletBalance` transactional function (Implemented in Client for MVP).
  - [x] Create `creditWalletTransaction` function.
  - [x] Implement "Add Money" UI with dummy payment button (for MVP testing).
- [x] **UI**
  - [x] Display real-time Wallet Balance in Header.
  - [x] Build Transaction History view.

### 4. Report Generation (Mode A) 📜
- [x] **AI Integration**
  - [x] Set up Google GenAI SDK (`gemini-1.5-flash`).
  - [x] Implement `generateReport` Server Action (Client-side for MVP).
  - [x] Inject `packages/core` calculation results into the System Prompt.
- [x] **Purchase Flow**
  - [x] Create UI for "Unlock Destiny Blueprint (₹100)".
  - [x] Gate generation behind Wallet check/deduction.
- [x] **Rendering**
  - [x] Build Markdown renderer for the Report View.
  - [x] Persist report to `reports/{reportId}`.

### 5. Context-Aware Chat (Mode B) 💬
- [x] **Chat UI**
  - [x] Build WhatsApp-style chat interface.
  - [x] Implement Optimistic UI for message sending.
- [x] **Chat Backend**
  - [x] Implement `sendMessage` Server Action (Client-side for MVP).
  - [x] **Context Injection:** Fetch user's `reportId` and inject Numerology Data into system prompt.
  - [x] **Gating:** Check wallet balance > ₹10 before processing.
  - [x] **Deduction:** Deduct ₹10 on successful response.

## Phase 2: Admin & Ops 👮‍♂️

### 1. Admin Dashboard (`apps/admin`)
- [x] **Auth:** Restrict access to admin emails (Simulated for Demo).
- [x] **User Inspector:** View user profiles, reports, and wallet history.
- [x] **Prompt Manager:**
  - [x] Editor for System Prompts.
  - [x] Save versions to `prompts` collection.
  - [x] Update `apps/web` to fetch active prompt ID.

### 2. Payments (Stripe/Razorpay) 💳
- [x] Set up Stripe account (Simulated).
- [x] Implement Checkout Session creation (Simulated).
- [x] Implement Webhook handler (`api/webhooks/stripe`) to credit wallet (Simulated via `PaymentModal`).
- [x] handle idempotency for webhooks (Handled via Order Status check).

### 3. Refined Planning Mode 🧠
- [x] Implement "Chain of Thought" or "Tool Calling" for the AI.
- [x] Allow AI to ask clarifying questions (Free) vs Final Answer (Paid).
- [x] Update UI to differentiate between "Clarifying" and "Answering" states.

## Phase 3: Scale & Polish 🌍
- [x] **Analytics:** Integrate PostHog or custom Firestore analytics.
- [x] **Voice Mode:** Implement Speech-to-Text and Text-to-Speech.
- [x] **Architecture Refactor:** Split Client/Admin apps, Create Shared UI Package.
- [x] **Strict Typing:** Enforce TypeScript interfaces across all apps and packages.
- [ ] **Mobile:** Evaluate React Native wrapper.
- [ ] **Localization:** Support Hindi/Spanish prompts.