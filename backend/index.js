import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Envs
dotenv.config({ path: path.join(__dirname, '../.env.local') }); // Prioritize local
dotenv.config({ path: path.join(__dirname, '../.env') });

import videoRoutes from './routes/videoRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Note: Payment Webhook route needs specific parser, usually handled inside the router, 
// OR we apply json parser globally BUT exclude webhook path. 
// However, in paymentRoutes.js we applied `express.raw` specifically to that route.
// Express allows mixing global and router-level middleware, but order matters.
// If we do `app.use(express.json())` here, it might consume the stream before `express.raw` sees it in the router.
// Safer approach: Apply `express.json()` only to paths that aren't the webhook.
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe-webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Routes
app.use('/api', videoRoutes);
app.use('/api', paymentRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('AiCrator Backend Service is Running');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
});
