/**
 * Tests for the feedback API route logic.
 */

export {};

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          type: 'good',
          praise: 'Excellent work walking today!',
          bonusTips: ['Invite a friend', 'Try a new route'],
        }),
      }),
    },
  })),
}));

const FEEDBACK_FAKE_KEY = 'test-gemini-key-feedback';

describe('/api/feedback — route handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = FEEDBACK_FAKE_KEY;
  });

  async function callRoute(body: unknown) {
    const { POST } = await import('../../src/app/api/feedback/route');
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return POST(req as unknown as globalThis.Request);
  }

  it('returns celebration text for a good action on success', async () => {
    const res = await callRoute({
      activity: { categoryId: 'transport', label: 'Walked', emissionsValue: 0.1 },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.type).toBe('good');
    expect(data.praise).toBe('Excellent work walking today!');
    expect(Array.isArray(data.bonusTips)).toBe(true);
  });

  it('returns compassion/reality check for a bad action when Gemini mocks are modified', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            type: 'bad',
            reality: 'Solo driving has a high impact.',
            alternatives: ['Carpool', 'Take the bus'],
          }),
        }),
      },
    }));

    const res = await callRoute({
      activity: { categoryId: 'transport', label: 'Drove solo', emissionsValue: 5.0 },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.type).toBe('bad');
    expect(data.reality).toBe('Solo driving has a high impact.');
  });

  it('returns category-specific offline fallback for good action when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await callRoute({
      activity: { categoryId: 'meal', label: 'Vegan Burger', emissionsValue: 0.5 },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.type).toBe('good');
    expect(data.praise).toContain('plant-powered meal');
  });

  it('returns category-specific offline fallback for bad action when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await callRoute({
      activity: { categoryId: 'energy', label: 'Left AC running', emissionsValue: 4.0 },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.type).toBe('bad');
    expect(data.reality).toContain('overnight');
  });

  it('returns safe fallback when Gemini fails', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
      models: {
        generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
      },
    }));

    const res = await callRoute({
      activity: { categoryId: 'custom', label: 'Recycled paper', emissionsValue: 0.1 },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, unknown>;
    expect(data.type).toBe('good');
    expect(data.praise).toContain('conscious choice');
  });

  it('does not leak API key in response', async () => {
    const res = await callRoute({
      activity: { categoryId: 'transport', label: 'Biked', emissionsValue: 0 },
    });
    const text = await res.text();
    expect(text).not.toContain(FEEDBACK_FAKE_KEY);
  });
});
