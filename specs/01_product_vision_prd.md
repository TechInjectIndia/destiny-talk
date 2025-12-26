# Product Vision & Requirements (PRD)

## 1. Business Vision & Strategy

### Vision Statement
To build the world’s most accessible, accurate, and personalized digital numerologist. We democratize access to high-quality destiny guidance by replacing expensive, static consultations with a dynamic, AI-driven companion that retains context of the user's life journey.

### The Problem
- **Static Reports:** Traditional numerology reports are "read once, forget forever" PDFs.
- **Prohibitive Cost:** Human consultations cost $50-$200 per session.
- **Generic AI:** Standard LLMs (ChatGPT) lack deep numerological context, hallucinate calculations, and have no memory of specific user constraints.

### Why AI?
Numerology is algorithmic (math-based) combined with interpretive intuition (pattern matching). LLMs are perfect for synthesizing strict mathematical rules (Loshu Grid, Moolank) into empathetic, human-readable advice.

### The Moat
1. **Context Lock-in:** The "Root Report" acts as the source of truth. The more the user chats, the more tailored the advice becomes.
2. **Wallet Psychology:** Pre-loaded wallets reduce the friction of payment. A remaining balance drives micro-transaction retention.
3. **Proprietary Prompt Engineering:** Admin-controlled prompts ensure quality generic chatbots cannot replicate.

### Target Audience
Global "Spiritual Seekers" (Ages 25–45). Tech-savvy, looking for guidance on career, relationships, and health, but skeptical of expensive traditional astrologers.

---

## 2. Product Requirements Document (PRD)

### Core Concept
Users receive a personalized **Numerology & Destiny Report** as the starting point. Every future chat is anchored to this report data.

### Primary User Flows
1. **Onboarding:** User signs up (Social Auth).
2. **Data Intake:** User provides Name, DOB (Time optional), Gender, Place of Birth.
3. **The Hook (Report):** User purchases "Destiny Blueprint" (e.g., ₹100 / ~$1.20).
4. **Generation:** System calculates strict numerology data + generates narrative.
5. **Retention (Chat):** User asks specific questions (e.g., "When will I get married?").
6. **Transaction:** System checks wallet -> deducts fee (e.g., ₹10) -> AI answers *using the Blueprint as context*.

### Functional Requirements

#### User Interface
- **Dashboard:** Shows "Destiny Blueprint" summary (lucky numbers, colors) + Wallet Balance.
- **Report View:** Beautifully rendered HTML/Markdown sections (not a PDF).
- **Chat Interface:** WhatsApp-style UI. Input field is disabled if Balance is insufficient.
- **Wallet:** "Add Money" modal with preset amounts.

#### Backend Logic
- **Stateful Chat:** Chat history must be partitioned by *Report ID*.
- **Micro-transactions:** Every AI request (excluding clarifications) triggers a ledger debit.

#### Features
- Authentication (email + OAuth)
- Profile management
- Wallet (recharge, balance, ledger)
- Report viewing
- Chat with AI (Context-aware)
- Topic-based chat entry points
- Order history
