export async function geminiComplete(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ 
          text: "System Instruction: You are a professional bank customer service assistant. You write sharp, actionable, complete, and concise responses. Do not hallucinate or stop mid-sentence.\n\nPrompt: " + prompt 
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
