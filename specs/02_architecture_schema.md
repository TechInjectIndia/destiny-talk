# Technical Architecture & Schema

## 1. Firebase Firestore Schema (JSON)

```json
{
  "users": {
    "uid": "string (PK)",
    "email": "string",
    "displayName": "string",
    "photoURL": "string",
    "createdAt": "timestamp",
    "lastLogin": "timestamp",
    "walletBalance": "number (Read-only cache)",
    "currency": "string (e.g., 'INR', 'USD')"
  },
  "reports": {
    "reportId": "string (PK)",
    "userId": "string (FK)",
    "profileName": "string",
    "dob": "timestamp",
    "numerologyData": {
      "moolank": "number",
      "bhagyank": "number",
      "loshuGrid": [2, 9, 4, 7, 5, 3, 6, 1, 8],
      "missingNumbers": [2, 5]
    },
    "fullReportMarkdown": "string (Large text)",
    "createdAt": "timestamp",
    "version": "string (Prompt version used)"
  },
  "chats": {
    "chatId": "string (PK)",
    "reportId": "string (FK)",
    "userId": "string (FK)",
    "title": "string",
    "lastMessageAt": "timestamp",
    "status": "active | archived"
  },
  "chatMessages": {
    "messageId": "string (PK)",
    "chatId": "string (FK)",
    "sender": "user | ai",
    "content": "string",
    "timestamp": "timestamp",
    "tokensUsed": "number",
    "isReasoning": "boolean (Internal thought process)"
  },
  "wallet": {
    "walletId": "string (PK - same as userId)",
    "balance": "number",
    "updatedAt": "timestamp"
  },
  "walletTransactions": {
    "transactionId": "string (PK)",
    "walletId": "string (FK)",
    "type": "credit | debit",
    "amount": "number",
    "referenceId": "string (OrderId or ChatMessageId)",
    "description": "string",
    "status": "success | pending | failed",
    "timestamp": "timestamp"
  },
  "orders": {
    "orderId": "string (PK)",
    "userId": "string",
    "amount": "number",
    "currency": "string",
    "paymentProvider": "string (Stripe/Razorpay)",
    "providerOrderId": "string",
    "status": "created | paid | failed",
    "createdAt": "timestamp"
  },
  "prompts": {
    "promptId": "string (PK)",
    "type": "report_gen | chat_consultant",
    "version": "string (v1.0.1)",
    "content": "string",
    "isActive": "boolean",
    "createdAt": "timestamp"
  },
  "adminLogs": {
    "logId": "string",
    "adminId": "string",
    "action": "string",
    "targetResource": "string",
    "details": "map",
    "timestamp": "timestamp"
  }
}
```

## 2. Wallet & Payment Logic

### Architecture
We use a **Double-Entry Ledger System**. We do not rely on a single `balance` field for truth. The `wallet.balance` field is merely a cached aggregation for UI performance, updated via Cloud Functions/Transactions.

### Logic: Wallet Deduction (Pseudocode)
```typescript
// executed in a secure server environment (Cloud Function / Server Action)
export async function deductWalletBalance(userId: string, amount: number, referenceId: string) {
  const db = admin.firestore();
  
  return db.runTransaction(async (t) => {
    const walletRef = db.collection('wallet').doc(userId);
    const walletDoc = await t.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Wallet not found");
    }

    const currentBalance = walletDoc.data()?.balance || 0;

    if (currentBalance < amount) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // 1. Create Transaction Record
    const newTxRef = db.collection('walletTransactions').doc();
    t.set(newTxRef, {
      walletId: userId,
      type: 'debit',
      amount: amount,
      referenceId: referenceId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'success'
    });

    // 2. Update Wallet Balance (Atomic decrement)
    t.update(walletRef, {
      balance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, newBalance: currentBalance - amount };
  });
}
```

### Payments
- **Provider:** Stripe (Primary), Razorpay (Secondary/Fallback).
- **Flow:** Order Created -> Payment Gateway -> Webhook -> Credit Wallet Transaction.
- **Idempotency:** Webhook handlers must check if the provider's `event_id` has already been processed.

## 3. Next.js + Turborepo Architecture

### Structure
```text
root/
├── apps/
│   ├── web/                # User Facing (Next.js 14, App Router)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   ├── chat/
│   │   │   └── api/        # Route Handlers
│   │   └── components/
│   └── admin/              # Internal Admin Tool (Next.js 14)
├── packages/
│   ├── ui/                 # Shared Shadcn/UI components
│   ├── database/           # Firebase Admin SDK setup, typed schema
│   ├── ai/                 # Vercel AI SDK, Prompts
│   ├── core/               # Numerology Algo, Utilities
│   ├── tsconfig/           # Shared Config
│   └── eslint-config/      # Shared Linting
```

## 4. Security & Compliance

### Firestore Security Rules Strategy
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Wallet: ONLY Backend (Admin SDK) can write. User can read own.
    match /wallet/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; 
    }
    // Transactions: User read-only.
    match /walletTransactions/{txId} {
      allow read: if resource.data.walletId == request.auth.uid;
      allow write: if false;
    }
    // Reports: User can create/read own.
    match /reports/{reportId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```
