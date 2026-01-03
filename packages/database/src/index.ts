// Only export client-side Firebase from main export
// Admin SDK should be imported via '@destiny-ai/database/admin' for server-side use only
export * from './client';
export * from './repositories';
export * from './collections';
