export interface SystemPrompt {
  id?: string;
  type: 'report_gen' | 'chat_consultant';
  version: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
}
