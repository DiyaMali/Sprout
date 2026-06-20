/**
 * Tests for the insight API route logic.
 * These tests validate the behaviour of the route handler using
 * a lightweight mock of the NextResponse & Request globals so we
 * don't need the full Next.js edge runtime.
 */

// Provide minimal web-API polyfills for Next.js route handler imports
export {};

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          insight: 'Test insight.',
          suggestion: 'Test suggestion.',
          title: 'Test Title',
          quote: 'Test quote.',
        }),
      }),
    },
  })),
}));

jest.mock('@/lib/carbonData', () => ({
  EQUIVALENCIES: [{ co2e: 1.0, equivalent: 'laptop usage', source: 'EPA' }],
}));

const INSIGHT_FAKE_KEY = 'test-gemini-key-insight';

const validActivity = {
  id: '1',
  timestamp: Date.now(),
  categoryId: 'transport',
  label: 'Walked or Biked',
  emissionsValue: 0,
};

describe('/api/insight — route handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = INSIGHT_FAKE_KEY;
  });

  async function callRoute(body: unknown) {
    const { POST } = await import('../../src/app/api/insight/route');
    const req = new Request('http://localhost/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as unknown as globalThis.Request);
  }

  it('returns 200 with correct shape when activity is provided', async () => {
    const res = await callRoute({ activity: validActivity, weeklyEmissions: 5, score: 60 });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.insight).toBe('string');
    expect(typeof data.suggestion).toBe('string');
    expect(typeof data.title).toBe('string');
    expect(typeof data.quote).toBe('string');
  });

  it('returns 400 when activity field is missing', async () => {
    const res = await callRoute({ weeklyEmissions: 5, score: 60 });
    expect(res.status).toBe(400);
  });

  it('returns fallback response when Gemini throws', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
      models: { generateContent: jest.fn().mockRejectedValue(new Error('fail')) },
    }));
    const res = await callRoute({ activity: validActivity, weeklyEmissions: 0, score: 0 });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.insight).toBe('string');
  });

  it('does not include the API key in the response body', async () => {
    const res = await callRoute({ activity: validActivity, weeklyEmissions: 5, score: 60 });
    const text = await res.text();
    expect(text).not.toContain(INSIGHT_FAKE_KEY);
  });

  it('returns a fallback when no API key is set', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await callRoute({ activity: validActivity, weeklyEmissions: 5, score: 60 });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.insight).toBe('string');
  });
});
