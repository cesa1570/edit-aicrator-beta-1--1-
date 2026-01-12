
interface WanVideoResponse {
    request_id?: string;
    error?: any;
}

interface WanStatusResponse {
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    video?: {
        url: string;
    };
    error?: any;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideoWan = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    onProgress?: (pollingCount: number) => void
): Promise<string> => {
    try {
        // 1. Submit Request
        const submitRes = await fetch('/api/wan-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submit',
                payload: {
                    prompt,
                    aspectRatio
                }
            })
        });

        if (!submitRes.ok) {
            const errorData = await submitRes.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Wan Submission Failed: ${submitRes.status}`);
        }

        const submitData: WanVideoResponse = await submitRes.json();
        const requestId = submitData.request_id;

        if (!requestId) {
            throw new Error("No request ID returned from Wan API");
        }

        // 2. Poll for Completion
        let status = 'IN_PROGRESS';
        let videoUrl = '';
        let pollCount = 0;
        const maxPolls = 60; // 60 * 5s = 5 minutes timeout

        while (status === 'IN_PROGRESS' && pollCount < maxPolls) {
            pollCount++;
            if (onProgress) onProgress(pollCount);

            await wait(5000); // Poll every 5 seconds

            const statusRes = await fetch('/api/wan-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'status',
                    payload: { requestId }
                })
            });

            if (!statusRes.ok) {
                // Continue polling on transient errors, or break? 
                // Let's assume transient and wait, but maybe log
                console.warn("Wan Status Check non-200");
                continue;
            }

            const statusData: WanStatusResponse = await statusRes.json();
            status = statusData.status;

            if (status === 'COMPLETED' && statusData.video?.url) {
                videoUrl = statusData.video.url;
                break; // Success!
            }

            if (status === 'FAILED') {
                throw new Error(statusData.error || "Wan Generation Failed during processing");
            }
        }

        if (!videoUrl) {
            throw new Error("Wan Generation Timed Out");
        }

        return videoUrl;

    } catch (error: any) {
        console.error("Wan Service Error:", error);
        throw error;
    }
};
