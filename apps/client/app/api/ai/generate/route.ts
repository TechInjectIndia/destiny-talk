import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@destiny-ai/utils/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, systemInstruction, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await generateContent(
      prompt,
      systemInstruction,
      model || 'gemini-2.5-flash'
    );

    return NextResponse.json({ text: result.text });
  } catch (error) {
    const err = error as Error;
    console.error('AI generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

