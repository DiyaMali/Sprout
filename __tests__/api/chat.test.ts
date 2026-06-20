/**
 * Tests for the chat API route logic.
 */

export {};

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'Mocked eco-coach response.',
      }),
    },
  })),
}));

const CHAT_FAKE_KEY = 'test-gemini-key-chat';

describe('/api/chat — route handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = CHAT_FAKE_KEY;
  });

  async function callRoute(body: unknown) {
    const { POST } = await import('../../src/app/api/chat/route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as unknown as globalThis.Request);
  }

  it('returns a mocked assistant message on success', async () => {
    const res = await callRoute({
      messages: [{ role: 'user', content: 'How do I reduce waste?' }],
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.role).toBe('assistant');
    expect(data.content).toBe('Mocked eco-coach response.');
  });

  it('returns poetic offline reflection when no API key is available', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await callRoute({
      messages: [{ role: 'user', content: 'What is my carbon footprint?' }],
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.role).toBe('assistant');
    expect(data.content).toContain('offline mode');
  });

  it('returns a fallback message when Gemini API throws', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
      models: {
        generateContent: jest.fn().mockRejectedValue(new Error('API failed')),
      },
    }));

    const res = await callRoute({
      messages: [{ role: 'user', content: 'Save energy tips' }],
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.role).toBe('assistant');
    expect(data.content).toContain('snag');
  });

  it('response body does not leak the API key', async () => {
    const res = await callRoute({
      messages: [{ role: 'user', content: 'Test key security' }],
    });
    const text = await res.text();
    expect(text).not.toContain(CHAT_FAKE_KEY);
  });
});
