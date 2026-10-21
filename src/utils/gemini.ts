export interface GeminiResponse {
  success: boolean;
  reply: string;
  model: string;
  timestamp: string;
  error?: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

function unavailable(error = 'AI_SERVICE_UNAVAILABLE'): GeminiResponse {
  return {
    success: false, model: 'unavailable', error,
    reply: 'AI service unavailable. No model response was received. Browser AI access requires a configured service with user authorization.',
    timestamp: new Date().toISOString(),
  };
}

export async function askGeminiAgent(
  prompt: string, systemInstruction?: string, role?: string,
  imageBase64?: string, history: ChatHistoryItem[] = [],
): Promise<GeminiResponse> {
  if (typeof prompt !== 'string' || (!prompt.trim() && !imageBase64)) return unavailable('INVALID_AI_REQUEST');
  const body = JSON.stringify({
    message: prompt, systemInstruction, role, imageBase64, history,
  });
  if (new TextEncoder().encode(body).byteLength > 900 * 1024) return unavailable('AI_REQUEST_TOO_LARGE');
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body, redirect: 'error', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return unavailable();
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return unavailable();
    const result = data as Partial<GeminiResponse>;
    if (result.success !== true || typeof result.reply !== 'string' || !result.reply.trim() ||
        result.reply.length > 16000 || typeof result.model !== 'string' || !result.model.trim() ||
        typeof result.timestamp !== 'string' || !Number.isFinite(Date.parse(result.timestamp))) return unavailable();
    return { success: true, reply: result.reply.trim(), model: result.model, timestamp: result.timestamp };
  } catch {
    return unavailable();
  }
}

export async function runGeminiRegulatoryAudit() {
  return {
    success: false, status: 'UNAVAILABLE', isLegalCertification: false,
    disclaimer: 'No legal assessment has been performed. A generated response or test result cannot establish regulatory approval.',
    assessmentScope: [], howeyAnalysis: {}, auditTimestamp: null, evaluator: null,
  };
}
