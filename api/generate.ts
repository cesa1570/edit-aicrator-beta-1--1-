// Vercel Serverless API Proxy for Gemini
// This hides your API key on the server side

// Inline types for Vercel (no external package needed)
interface VercelRequest {
    method?: string;
    body: any;
}

interface VercelResponse {
    setHeader(name: string, value: string): VercelResponse;
    status(code: number): VercelResponse;
    json(data: any): void;
    end(): void;
}

// Get API key from environment (set in Vercel Dashboard)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Rate limiting (simple in-memory, resets on cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = requestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        requestCounts.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT) {
        return false;
    }

    userLimit.count++;
    return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, payload, userId } = req.body;

        // Check rate limit
        if (!checkRateLimit(userId || 'anonymous')) {
            return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
        }

        // Validate API key exists
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Route to appropriate Gemini endpoint
        let endpoint = '';
        let requestPayload = {};

        switch (action) {
            case 'generateScript':
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
                requestPayload = {
                    contents: [{ parts: [{ text: payload.prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 4096
                    }
                };
                break;

            case 'generateImage':
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;
                requestPayload = {
                    instances: [{ prompt: payload.prompt }],
                    parameters: { sampleCount: 1, aspectRatio: payload.aspectRatio || '9:16' }
                };
                break;

            case 'generateVoice':
                endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`;
                requestPayload = {
                    input: { text: payload.text },
                    voice: { languageCode: payload.language || 'en-US', name: payload.voiceName || 'en-US-Neural2-D' },
                    audioConfig: { audioEncoding: 'MP3' }
                };
                break;

            default:
                return res.status(400).json({ error: 'Unknown action' });
        }

        // Make the API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('API Proxy Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
