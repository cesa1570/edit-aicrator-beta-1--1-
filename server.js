import dotenv from 'dotenv';
// Prioritize .env.local for local development (Vite convention)
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env
import express from 'express';
import cors from 'cors';
// import admin from 'firebase-admin'; // Removed
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Stripe requires raw body for webhook verification
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Webhook Endpoint (Must come before other routes if using specific parsers, but here it's fine)
app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.log('⚠️  Webhook Secret not set. Skipping verification (Dev Mode only)');
            // For safety in production, YOU MUST set STRIPE_WEBHOOK_SECRET
            event = req.body;
            // Note: In real prod, use: stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log(`🔔 Webhook received: ${event.type}`);

    try {
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const { userId, planId, credits, type } = paymentIntent.metadata;

            if (userId && credits) {
                await grantCredits(userId, planId, parseInt(credits), type === 'subscription', paymentIntent.id);
            }
        }
        else if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // For Payment Links, user ID comes from ?client_reference_id=...
            const userId = session.client_reference_id || session.metadata?.userId;
            const amount = session.amount_total; // e.g. 39900 or 99900

            if (userId && amount) {
                console.log(`✅ Checkout Session Completed for User: ${userId} (Amount: ${amount})`);

                // Map Amount to Plan (Simple logic for Payment Links)
                let planId = null;
                // Check Subscription Plans first
                if (amount === 39900 || amount === 999) planId = 'sub_lite';
                else if (amount === 99900 || amount === 2499) planId = 'sub_pro';
                else if (amount === 249000 || amount === 6999) planId = 'sub_agency';

                // Check Credit Packages
                else if (amount === 6900 || amount === 199) planId = 'micro';
                else if (amount === 49900 || amount === 1299) planId = 'starter';
                else if (amount === 99900 || amount === 2499) planId = 'creator'; // Warning: duplicate price with sub_pro
                else if (amount === 249900 || amount === 6499) planId = 'agency';

                // Prefer Subscription for 999 if vague, or check mode
                if (amount === 99900 && session.mode === 'payment') planId = 'creator'; // If one-time
                if (amount === 99900 && session.mode === 'subscription') planId = 'sub_pro';

                if (planId) {
                    const isSubscription = planId.startsWith('sub_');
                    const credits = isSubscription ? SUBSCRIPTION_PLANS[planId].credits : CREDIT_PACKAGES[planId];
                    await grantCredits(userId, planId, credits, isSubscription, session.payment_intent || session.id);
                    console.log(`🎉 Granted ${credits} credits for plan ${planId}`);
                } else {
                    console.warn(`⚠️ Could not map amount ${amount} to any plan.`);
                }
            }
        }
    } catch (err) {
        console.error('Error processing webhook:', err);
    }

    res.json({ received: true });
});

// Initialize Supabase Admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase params missing. Check .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

// Pricing Config (Synced with Frontend)
// Prices in smallest currency unit (cents/satang)
// THB 100 = 10000 satang
// USD 1 = 100 cents

const CREDIT_PACKAGES = {
    // Top-up Packages
    'micro': 60,
    'starter': 500,
    'creator': 1200,
    'agency': 3500
};

const SUBSCRIPTION_PLANS = {
    // Subscription Plans
    'sub_lite': { credits: 500, months: 1 },
    'sub_pro': { credits: 2500, months: 1 },
    'sub_agency': { credits: 6000, months: 1 }
};

// Helper: Grant Credits
async function grantCredits(userId, planId, credits, isSubscription, chargeId) {
    try {
        console.log(`Processing credits for user ${userId} (Plan: ${planId}, Credits: ${credits})`);

        // 1. Get current user data
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching user for credits:', fetchError);
            // If user doesn't exist, might need to create stub? But user should exist from auth.
        }

        const currentCredits = userData?.credits || 0;
        const updates = {
            credits: currentCredits + credits,
            updated_at: new Date().toISOString(),
            last_charge_id: chargeId,
            payment_provider: 'stripe'
        };

        if (isSubscription) {
            const planDetails = SUBSCRIPTION_PLANS[planId];
            const now = new Date();
            const nextMonth = new Date(now.setMonth(now.getMonth() + (planDetails?.months || 1)));

            updates.plan = planId;
            updates.status = 'active';
            updates.current_period_end = nextMonth.toISOString();
        }

        // 2. Update User
        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (updateError) throw updateError;

        // 3. Log Transaction
        const { error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                plan_id: planId,
                credits: credits,
                charge_id: chargeId,
                provider: 'stripe',
                type: isSubscription ? 'subscription' : 'topup',
                status: 'completed',
                amount: 0, // We should ideally store amount here too if passed
                created_at: new Date().toISOString(),
                date: new Date().toISOString()
            });

        if (txError) console.error('Error logging transaction:', txError);

        console.log(`✅ Granted ${credits} credits to ${userId}`);
    } catch (err) {
        console.error('Error granting credits:', err);
    }
}

// --- VIDEO GENERATION APIs ---

import { generateAiVideo } from './services/replicateService.js';
import { createKenBurnsVideo, mergeVideoAudio } from './services/ffmpegService.js';
import { uploadMedia, cleanupFile } from './services/storageService.js';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Simple In-Memory Job Store (Use Redis/Db for production)
const jobs = {};

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
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

// 1. Generate Video from Image (AI or Ken Burns)
app.post('/api/generate-video', async (req, res) => {
    const { image, style, prompt, audioUrl } = req.body;
    // Style: 'ai_motion' or 'zoom_pan'

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    jobs[jobId] = { status: 'processing', progress: 10 };

    // Respond immediately with Job ID
    res.json({ jobId, status: 'processing' });

    // Process Async
    (async () => {
        try {
            // Download Input Image
            const tempImage = path.join(process.cwd(), 'uploads', `${jobId}_input.png`);
            if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) fs.mkdirSync(path.join(process.cwd(), 'uploads'));

            await downloadFile(image, tempImage);
            jobs[jobId].progress = 30;

            let videoPath;

            if (style === 'ai_motion') {
                // Use Replicate
                const output = await generateAiVideo(image); // Replicate takes URL directly usually
                // Output is usually a URL, we need to download it to merge with audio later
                const videoUrl = Array.isArray(output) ? output[0] : output;

                videoPath = path.join(process.cwd(), 'renders', `${jobId}_ai.mp4`);
                await downloadFile(videoUrl, videoPath);

            } else {
                // Use FFmpeg Ken Burns
                videoPath = await createKenBurnsVideo(tempImage, 5); // Default 5s
            }

            jobs[jobId].progress = 70;

            // Merge with Audio if provided
            let finalPath = videoPath;
            if (audioUrl) {
                const tempAudio = path.join(process.cwd(), 'uploads', `${jobId}_audio.mp3`);
                await downloadFile(audioUrl, tempAudio);
                finalPath = await mergeVideoAudio(videoPath, tempAudio);

                // Cleanup Audio
                cleanupFile(tempAudio);
            }

            jobs[jobId].progress = 90;

            // Upload to Supabase
            const publicUrl = await uploadMedia(finalPath, `generated/${userId}/${Date.now()}.mp4`);

            jobs[jobId].status = 'completed';
            jobs[jobId].resultUrl = publicUrl;
            jobs[jobId].progress = 100;

            // Cleanup Local Files
            cleanupFile(tempImage);
            if (videoPath !== finalPath) cleanupFile(videoPath);
            cleanupFile(finalPath);

        } catch (error) {
            console.error(`Job ${jobId} failed:`, error);
            jobs[jobId].status = 'failed';
            jobs[jobId].error = error.message;
        }
    })();
});

// 2. Check Job Status
app.get('/api/check-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs[jobId];

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
});

// Start Server
app.listen(PORT, () => {
    console.log(`
    🚀  API Server running on: http://localhost:${PORT}
    👉  Vite Proxy forwarding /api -> http://localhost:${PORT}
    
    Ready via 'npm run dev' (Frontend) + 'node server.js' (Backend)
    `);
});
