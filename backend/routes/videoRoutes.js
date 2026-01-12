import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import https from 'https';
import http from 'http';
import { generateAiVideo } from '../services/replicateService.js';
import { createKenBurnsVideo, mergeVideoAudio } from '../services/ffmpegService.js';
import { uploadMedia, cleanupFile } from '../services/storageService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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
