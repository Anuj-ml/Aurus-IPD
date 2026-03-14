import { geminiComplete } from './gemini';
import { useSettingsStore } from '../stores/settingsStore';

export const PROMPT_ANALYZE_COMPLAINT = `You are an AI banking assistant. Analyze the following complaint and return a JSON object with this exact structure (no preamble, no markdown, just JSON):
{
  "summary": "1 sentence string",
  "severity": "low|medium|high|critical",
  "sentimentScore": number between 0.0 (very negative) and 1.0 (positive),
  "category": "string (e.g. Fraud, Service, Tech)",
  "subcategory": "string",
  "keyIssues": ["exactly", "3", "issues"],
  "urgencyReason": "string describing urgency",
  "regulatoryRisk": "none|low|medium|high",
  "recommendedAction": "string"
}
Rules:
- severity is critical if fraud/unauthorized or >₹50k or ombudsman threat.
- sentimentScore 0=very negative 1=positive.
- regulatoryRisk is high if RBI guidelines apply (unauthorized txn, ombudsman mentioned).`;

export const PROMPT_DRAFT_RESPONSE = `You are a professional bank customer service agent. Draft a response to the customer.
Rules:
- Address the customer by name.
- Be empathetic but professional.
- Use fewer than 180 words.
- NEVER start with "We apologize for the inconvenience".
- Mention RBI zero-liability for unauthorized transactions if relevant.
- End with a specific commitment and direct contact (1800-XXX-XXXX).`;

export const PROMPT_TRANSLATE = `You are a language translator. Translate the provided text into the requested language. Return ONLY the translation, no explanation, no quotes.`;

export const PROMPT_CUSTOMER_SUMMARY = `You are an AI assistant. Generate a 2-sentence briefing about the customer for the agent. Review their data and provide concise, actionable context.`;

export async function groqStream(
  apiKey: string,
  messages: { role: string; content: string }[],
  onChunk: (partialText: string) => void,
  options?: { signal?: AbortSignal }
): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
        stream: true
      }),
      signal: options?.signal
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    if (!reader) throw new Error('No readable stream from Groq');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.choices && data.choices[0]?.delta?.content) {
              const textChunk = data.choices[0].delta.content;
              fullText += textChunk;
              onChunk(textChunk);
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
    }

    return fullText;
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    console.warn("Groq streaming failed, falling back to Gemini:", error);
    const geminiKey = useSettingsStore.getState().geminiKey;
    if (geminiKey) {
      const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const result = await geminiComplete(geminiKey, prompt);
      onChunk(result);
      return result;
    }
    throw error;
  }
}

export async function groqComplete(apiKey: string, system: string, user: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.warn("Groq failed, falling back to Gemini:", error);
    const geminiKey = useSettingsStore.getState().geminiKey;
    if (geminiKey) {
      return geminiComplete(geminiKey, `${system}\n\n${user}`);
    }
    throw error;
  }
}

export async function groqJSON<T>(apiKey: string, system: string, user: string): Promise<T> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content as string;

    // Strip JSON markdown fences
    content = content.trim();
    if (content.startsWith('```json')) content = content.slice(7);
    else if (content.startsWith('```')) content = content.slice(3);
    if (content.endsWith('```')) content = content.slice(0, -3);

    return JSON.parse(content.trim()) as T;
  } catch (error) {
    console.warn("Groq JSON failed, falling back to Gemini:", error);
    const geminiKey = useSettingsStore.getState().geminiKey;
    if (geminiKey) {
      const fallbackResult = await geminiComplete(geminiKey, `${system}\n\nReturn EXACT JSON as requested.\n\n${user}`);
      let content = fallbackResult.trim();
      if (content.startsWith('```json')) content = content.slice(7);
      else if (content.startsWith('```')) content = content.slice(3);
      if (content.endsWith('```')) content = content.slice(0, -3);
      return JSON.parse(content.trim()) as T;
    }
    throw error;
  }
}
