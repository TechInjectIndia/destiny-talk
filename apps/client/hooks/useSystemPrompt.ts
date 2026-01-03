import { useState, useEffect } from 'react';
import { FirebasePromptRepository, isConfigured } from '@destiny-ai/database';
import { DEFAULT_REPORT_PROMPT, DEFAULT_CHAT_PROMPT } from '@destiny-ai/core';

const promptRepo = new FirebasePromptRepository();

export const useSystemPrompt = (type: 'report_gen' | 'chat_consultant') => {
  const [promptContent, setPromptContent] = useState<string>('');

  useEffect(() => {
    setPromptContent(type === 'report_gen' ? DEFAULT_REPORT_PROMPT : DEFAULT_CHAT_PROMPT);
    if (!isConfigured) return;

    const unsubscribe = promptRepo.subscribeToActivePrompt(type, (prompt) => {
      if (prompt) {
        setPromptContent(prompt.content);
      }
    });
    return () => unsubscribe();
  }, [type]);

  return promptContent;
};

