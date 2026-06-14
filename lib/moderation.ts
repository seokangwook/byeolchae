const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type ModerationResult = 'approved' | 'flagged';

export async function moderateText(text: string): Promise<ModerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 'approved';

  const prompt = `You are a content moderator for a Korean mini-homepage community.
Analyze the following text and determine if it should be flagged.
Flag if it contains: hate speech, explicit sexual content, severe profanity/insults, spam, self-harm promotion, or malicious URLs.
Korean community context: casual slang is OK; mild complaints are OK; flag only clearly harmful content.
Respond with ONLY "approved" or "flagged".

Text: ${text}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 10 },
      }),
    });
    if (!res.ok) return 'approved';
    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? '';
    return answer === 'flagged' ? 'flagged' : 'approved';
  } catch {
    return 'approved';
  }
}
