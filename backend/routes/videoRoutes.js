const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Import Services (ESM import in CJS? No, services were written as ESM)
// Wait, the services I created earlier (ffmpegService.js, etc.) were written with `import/export` syntax (ESM).
// But backend/index.js uses `require` (CommonJS).
// Checking package.json... "type": "module" is NOT in backend/package.json, but it IS in root package.json.
// Let's check backend/package.json again.
// It does NOT have "type": "module".
// However, the services I wrote:
// "export const ..." (ESM)
// This will fail if I just require them in a CJS environment without babel or type: module.
// But wait, the previous `index.js` was using `require`. 
// The services (replicateService, ffmpegService, storageService) were created in STEP 155-157.
// They used `import ...` and `export const ...`.
// If I try to access them from `index.js` (which uses `require`), it would crash if `type: module` isn't set.
// The `server.js` (root) was using `import` (ESM) because root package.json has `"type": "module"`.
// BUT `backend/index.js` (user provided content in Step 229) uses `require`.
// AND `backend/package.json` (Step 233) does NOT have `"type": "module"`.
// So the `services/*.js` files I created earlier are likely ESM, but the `backend/` folder is running as CJS?
// Actually, `server.js` in root IS running as ESM.
// But `backend/index.js` is what usually runs on Render if we deploy `backend/`.
// The user asked to "separate backend files".
// I should make sure consistency.
// Since `server.js` (root) is ESM, I should probably stick to ESM if possible, OR convert services to CJS.
// BUT `backend/package.json` shows main: "index.js" and scripts "start": "node index.js".
// References `require` in `backend/index.js` suggest CJS.
// The `services` I created were:
// `export const generateAiVideo = ...`
// `export const createKenBurnsVideo = ...`
// THESE ARE ESM.
// If I run `node index.js` in `backend/` (which uses `require`), and if I tried to `require('./services/ffmpegService.js')`, Node would complain about `export`.
// 
// CORRECTION: The `server.js` (Root) I was editing in Step 161 DOES import them:
// `import { generateAiVideo } from './services/replicateService.js';`
// This confirms ROOT is ESM.
// 
// BUT the user asked to refactor `backend/` specifically.
// And `backend/index.js` (the file I viewed in Step 229) is CommonJS (`require`).
// 
// CRITICAL DECISION:
// I should convert `backend/` to ESM to match the root `server.js` and the services I already wrote.
// Implementation: Add `"type": "module"` to `backend/package.json`.
// Then write new routes using `import/export`.

// Let's stick to ESM for the new files.

import { generateAiVideo } from '../services/replicateService.js';
import { createKenBurnsVideo, mergeVideoAudio } from '../services/ffmpegService.js';
import { uploadMedia, cleanupFile } from '../services/storageService.js';
import https from 'https';
import http from 'http';

// In-Memory Job Store (Consider Redis for production)
const jobs = {};

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(dest);
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(dest));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

// POST /api/generate-video
router.post('/generate-video', async (req, res) => {
    try {
        const { imageUrl, useMotion, aspectRatio, audioUrl } = req.body;

        // Respond immediately with Job ID for async processing
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        jobs[jobId] = { status: 'processing', progress: 10 };

        res.json({ jobId, status: 'processing' });

        // Process Async
        (async () => {
            try {
                // Ensure upload dir
                if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

                // Download Input Image
                const tempImage = path.join(process.cwd(), 'uploads', `${jobId}_input.png`);
                await downloadFile(imageUrl, tempImage);
                jobs[jobId].progress = 30;

                let videoPath;

                if (useMotion) {
                    // AI Motion (Replicate)
                    console.log(`Job ${jobId}: Generating AI Motion...`);
                    const output = await generateAiVideo(imageUrl);
                    // Replicate usually returns a URL
                    const videoUrl = Array.isArray(output) ? output[0] : output;

                    videoPath = path.join(process.cwd(), 'renders', `${jobId}_ai.mp4`);
                    await downloadFile(videoUrl, videoPath);
                } else {
                    // Static Ken Burns (FFmpeg)
                    console.log(`Job ${jobId}: Generating Ken Burns...`);
                    videoPath = await createKenBurnsVideo(tempImage, 5);
                }

                jobs[jobId].progress = 70;

                // Merge with Audio if provided
                let finalPath = videoPath;
                if (audioUrl) {
                    console.log(`Job ${jobId}: Merging Audio...`);
                    const tempAudio = path.join(process.cwd(), 'uploads', `${jobId}_audio.mp3`);
                    await downloadFile(audioUrl, tempAudio);
                    finalPath = await mergeVideoAudio(videoPath, tempAudio);

                    cleanupFile(tempAudio);
                }

                jobs[jobId].progress = 90;

                // Upload to Supabase
                console.log(`Job ${jobId}: Uploading Result...`);
                // Using a relative path helper or assuming storageService handles it
                const fileName = `generated/${Date.now()}_${path.basename(finalPath)}`;
                const publicUrl = await uploadMedia(finalPath, fileName);

                jobs[jobId].status = 'succeeded';
                jobs[jobId].output = publicUrl; // Align with frontend expectation (videoUrl)
                jobs[jobId].progress = 100;

                // Cleanup
                cleanupFile(tempImage);
                if (videoPath !== finalPath) cleanupFile(videoPath);
                cleanupFile(finalPath);

            } catch (error) {
                console.error(`Job ${jobId} failed:`, error);
                jobs[jobId].status = 'failed';
                jobs[jobId].error = error.message;
            }
        })();

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/check-status/:jobId
router.get('/check-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs[jobId];
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// POST /api/render-final (Direct Sync Render)
router.post('/render-final', async (req, res) => {
    try {
        const { videoUrl, audioUrl, aspectRatio } = req.body;
        // ... (Logic handled by async route above mostly, but keeping for compatibility if needed)
        // Re-implementing simplified version using the services

        const tempVideo = `uploads/temp_v_${Date.now()}.mp4`;
        const tempAudio = `uploads/temp_a_${Date.now()}.mp3`;

        await downloadFile(videoUrl, tempVideo);
        await downloadFile(audioUrl, tempAudio);

        const finalPath = await mergeVideoAudio(tempVideo, tempAudio);
        const publicUrl = await uploadMedia(finalPath, `renders/final_${Date.now()}.mp4`);

        cleanupFile(tempVideo);
        cleanupFile(tempAudio);
        cleanupFile(finalPath);

        res.json({ url: publicUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
