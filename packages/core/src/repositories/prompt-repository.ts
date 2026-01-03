import { SystemPrompt } from '../entities/prompt';

export interface IPromptRepository {
  getPrompts(type?: 'report_gen' | 'chat_consultant'): Promise<SystemPrompt[]>;
  getActivePrompt(type: 'report_gen' | 'chat_consultant'): Promise<SystemPrompt | null>;
  savePrompt(prompt: Omit<SystemPrompt, 'id'>): Promise<string>;
  updatePrompt(id: string, data: Partial<SystemPrompt>): Promise<void>;
  subscribeToPrompts(callback: (prompts: SystemPrompt[]) => void): () => void;
  subscribeToActivePrompt(type: 'report_gen' | 'chat_consultant', callback: (prompt: SystemPrompt | null) => void): () => void;
}
