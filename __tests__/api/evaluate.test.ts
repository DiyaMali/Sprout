/**
 * Tests for the evaluate API route logic.
 */

export {};

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({ label: 'Bike Repair', emissionsValue: 0.5 }),
      }),
    },
  })),
}));

const EVAL_FAKE_KEY = 'test-gemini-key-eval';

describe('/api/evaluate — route handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = EVAL_FAKE_KEY;
  });

  async function callRoute(body: unknown) {
    const { POST } = await import('../../src/app/api/evaluate/route');
    const req = new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as unknown as globalThis.Request);
  }

  it('returns label and emissionsValue with correct types on success', async () => {
    const res = await callRoute({ customAction: 'Repaired my jacket' });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.label).toBe('string');
    expect(typeof data.emissionsValue).toBe('number');
  });

  it('returns a fallback when Gemini throws', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
      models: { generateContent: jest.fn().mockRejectedValue(new Error('fail')) },
    }));
    const res = await callRoute({ customAction: 'Something' });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.label).toBe('string');
  });

  it('response body does not contain the literal API key string', async () => {
    const res = await callRoute({ customAction: 'Test action' });
    const text = await res.text();
    expect(text).not.toContain(EVAL_FAKE_KEY);
  });

  it('returns 401 when no API key is available', async () => {
    delete process.env.GEMINI_API_KEY;
    jest.resetModules();
    const { POST } = await import('../../src/app/api/evaluate/route');
    const req = new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customAction: 'Test' }),
    });
    const res = await POST(req as unknown as globalThis.Request);
    expect(res.status).toBe(401);
    process.env.GEMINI_API_KEY = EVAL_FAKE_KEY;
  });
});
