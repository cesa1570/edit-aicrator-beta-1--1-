// import { adminDb } from '../lib/firebaseAdmin.js'; // Removed

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for extension
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { licenseKey } = req.body;

    if (!licenseKey) {
        res.status(400).json({ valid: false, message: 'Missing license key' });
        return;
    }

    // Key Format: AI-AFF-{uid_substring}-{timestamp}
    // Example: AI-AFF-A1B2C3D4-1725...
    const parts = licenseKey.split('-');
    if (parts.length !== 4 || parts[0] !== 'AI' || parts[1] !== 'AFF') {
        // Fallback for "Demo" keys
        if (licenseKey.startsWith("AI-AFF-DEMO")) {
            res.status(200).json({ valid: true, plan: 'demo' });
            return;
        }
        res.status(200).json({ valid: false, message: 'Invalid key format' });
        return;
    }

    try {
        // In a real app, we would lookup the key in a 'licenses' collection
        // For this prototype, we'll validate the User ID part if possible, 
        // OR just return true since the key generation in frontend is deterministic.

        // TODO: Implement Supabase lookup if strict validation is needed
        // const { data } = await supabaseAdmin.from('licenses').select('*').eq('key', licenseKey).single();

        console.log(`Verifying license: ${licenseKey}`);

        // Simulating success
        res.status(200).json({ valid: true, plan: 'pro' });
    } catch (error) {
        console.error('License verification error:', error);
        res.status(500).json({ valid: false, message: 'Internal Server Error' });
    }
}
