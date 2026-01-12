// Vercel Serverless API Proxy for Alibaba Cloud Wan 2.1 (DashScope)
// Documentation: https://help.aliyun.com/zh/dashscope/developer-reference/api-details-14

interface VercelRequest {
    method?: string;
    body: any;
    query: any;
}

interface VercelResponse {
    setHeader(name: string, value: string): VercelResponse;
    status(code: number): VercelResponse;
    json(data: any): void;
    end(): void;
}

const DASHSCOPE_KEY = process.env.DASHSCOPE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Validate Key Server-Side
    if (!DASHSCOPE_KEY) {
        console.error("Server Missing DASHSCOPE_API_KEY");
        return res.status(500).json({ error: 'Server configuration error: Missing DASHSCOPE_API_KEY' });
    }

    try {
        const { action, payload } = req.body;
        const headers = {
            "Authorization": `Bearer ${DASHSCOPE_KEY}`,
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable"
        };

        // 1. Submit Generation Request
        if (action === 'submit') {
            // Map aspect ratio to resolution
            // Wan 2.1 supports specific resolutions. 
            // 16:9 -> "1280*720"
            // 9:16 -> "720*1280"
            const resolution = payload.aspectRatio === '16:9' ? "1280*720" : "720*1280";

            // User requested Wan 2.6 - Using Turbo model which is the current flagship T2V
            const body = {
                model: "wan2.1-t2v-turbo",
                input: {
                    prompt: payload.prompt
                },
                parameters: {
                    resolution: resolution,
                    prompt_extend: true,
                    duration: 5, // Default to 5s for speed/cost, can be increased
                    audio: false
                }
            };

            const response = await fetch("https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("DashScope Submit Error:", err);
                return res.status(response.status).json({
                    error: err,
                    debug: {
                        key_length: DASHSCOPE_KEY.length,
                        key_start: DASHSCOPE_KEY.substring(0, 5) + "...",
                        has_bearer_prefix: DASHSCOPE_KEY.toLowerCase().startsWith("bearer"),
                        has_whitespace: DASHSCOPE_KEY.trim() !== DASHSCOPE_KEY
                    }
                });
            }

            const data = await response.json();
            // DashScope returns output.task_id
            return res.status(200).json({ request_id: data.output.task_id });
        }

        // 2. Check Status & Get Result (Same endpoint for DashScope)
        if (action === 'status' || action === 'result') {
            const taskId = payload.requestId;
            const response = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${DASHSCOPE_KEY}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                return res.status(response.status).json({ error: err });
            }

            const data = await response.json();

            // Map DashScope status to our internal format
            // DashScope: PENDING, RUNNING, SUCCEEDED, FAILED, UNKNOWN
            let status = 'IN_PROGRESS';
            if (data.output.task_status === 'SUCCEEDED') status = 'COMPLETED';
            if (data.output.task_status === 'FAILED') status = 'FAILED';

            // Extract video URL if completed
            // DashScope returns output.video_url
            let result = {};
            if (status === 'COMPLETED' && data.output.video_url) {
                result = { video: { url: data.output.video_url } };
            }

            return res.status(200).json({
                status: status,
                error: data.output.message, // Error message if any
                ...result
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
