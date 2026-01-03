import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '@destiny-ai/database';

// Initialize the Gemini Developer API backend service using Firebase
// Note: This uses Firebase's AI SDK which doesn't require a separate API key
const firebaseAI = getAI(app, { backend: new GoogleAIBackend() });

// Get the Gemini model
export const getGeminiModel = (modelName: string = 'gemini-2.5-flash') => {
  return getGenerativeModel(firebaseAI, { model: modelName });
};

// Helper function to generate content (maintains compatibility with existing code)
export const generateContent = async (
  prompt: string, 
  systemInstruction?: string, 
  modelName: string = 'gemini-2.5-flash'
): Promise<{ text: string }> => {
  const model = getGeminiModel(modelName);
  
  // If system instruction is provided, use it
  if (systemInstruction) {
    const result = await model.generateContent({
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction,
    });
    const response = await result.response;
    return { text: response.text() };
  }

  // Otherwise, just use the prompt
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return { text: response.text() };
};

// Legacy compatibility export for existing code
export const ai = {
  models: {
    generateContent: async (options: { 
      model: string; 
      contents: Array<{ role: 'user' | 'model' | 'system' | 'function'; parts: Array<{ text: string }> }>; 
      config?: { systemInstruction?: string } 
    }): Promise<{ text: string }> => {
      const model = getGeminiModel(options.model);
      const systemInstruction = options.config?.systemInstruction;
      
      // Map contents to ensure role is properly typed
      const typedContents = options.contents.map(c => ({
        role: c.role as 'user' | 'model' | 'system' | 'function',
        parts: c.parts,
      }));

      if (systemInstruction) {
        const result = await model.generateContent({
          contents: typedContents,
          systemInstruction: systemInstruction,
        });
        const response = await result.response;
        return { text: response.text() };
      }

      // Extract the prompt text from contents if no system instruction
      const promptText = options.contents
        .map(c => c.parts.map(p => p.text).join(' '))
        .join('\n');

      const result = await model.generateContent(promptText);
      const response = await result.response;
      return { text: response.text() };
    },
  },
};
