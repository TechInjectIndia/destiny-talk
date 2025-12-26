# Admin Platform & Roadmap

## 1. Admin Platform Design

### Roles
- Super Admin
- Ops Admin
- Finance Admin

### Key Features
1. **Prompt Manager:** 
   - Code-editor interface to edit System Prompts.
   - Version control (v1, v2).
   - "Set Active" toggle to hot-swap AI behavior without code deploys.
2. **User Inspector:**
   - Search by email.
   - View generated reports.
   - View Wallet Ledger (Audit trail).
3. **Finance Dashboard:**
   - Total Revenue.
   - Wallet Breakage (Unspent credits).
   - Refund Tool (Transactions -> Refund).
4. **Content Monitoring:**
   - Flagged conversations.
   - AI Refusal logs.

## 2. Metrics & Analytics

### Key Performance Indicators (KPIs)
- **Report Conversion Rate:** % of Signups who buy the full report. (Target: >5%)
- **Chat Attach Rate:** % of Report buyers who ask >3 follow-up questions.
- **Wallet Velocity:** Average days to deplete initial wallet load.

### Unit Economics
- **Cost:** Input Token + Output Token per chat ≈ $0.005.
- **Price:** User Charge ≈ $0.12 (₹10).
- **Margin:** ~95% Gross Margin on Chat software level.

## 3. Phased Roadmap

### Phase 1: The Core (Weeks 1-4)
- Set up Turborepo & Firebase.
- Implement Numerology Algorithm (TypeScript).
- Build Report Generation (Mode A).
- Implement Wallet (Add Money + Debit).
- Launch Web MVP.

### Phase 2: Intelligence & Ops (Weeks 5-8)
- Build Admin Prompt Manager.
- Implement "Planning Mode" for Chat (Clarification logic).
- Add Email Notifications for low balance.
- Stripe Global Integration.

### Phase 3: Scale (Weeks 9-12)
- Voice Input/Output (Audio chat).
- Multi-language support (Spanish, Hindi).
- Native Mobile App (React Native using shared packages).
