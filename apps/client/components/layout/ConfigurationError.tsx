'use client';

import React from 'react';

export const ConfigurationError = () => (
  <div className="font-sans p-10 max-w-2xl mx-auto text-center">
    <h1 className="text-red-500 text-3xl mb-4">⚠️ Configuration Missing</h1>
    <p className="mb-5">The application cannot start because Firebase configuration is missing.</p>
    <div className="bg-gray-100 p-5 rounded-lg text-left mt-5">
      <strong className="block mb-2">Missing Environment Variables:</strong>
      <pre className="overflow-x-auto text-sm">NEXT_PUBLIC_FIREBASE_API_KEY</pre>
      <pre className="overflow-x-auto text-sm">NEXT_PUBLIC_FIREBASE_PROJECT_ID</pre>
      <pre className="overflow-x-auto text-sm">NEXT_PUBLIC_API_KEY (Gemini)</pre>
    </div>
  </div>
);

