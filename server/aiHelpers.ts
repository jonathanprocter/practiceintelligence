import { Configuration, OpenAIApi } from 'openai';

export async function analyzeWithOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(config);
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });
  return completion.data.choices[0]?.message?.content?.trim() || '';
}

export async function analyzeWithClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
  });
  if (!response.ok) {
    throw new Error(`Claude API error: ${await response.text()}`);
  }
  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || '';
}

export async function analyzeText(prompt: string): Promise<string> {
  try {
    return await analyzeWithOpenAI(prompt);
  } catch (error) {
    console.error('OpenAI failed:', error);
    try {
      return await analyzeWithClaude(prompt);
    } catch (fallbackError) {
      console.error('Claude fallback failed:', fallbackError);
      throw error;
    }
  }
}
