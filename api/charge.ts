// Omise charge API endpoint
// This endpoint receives a token and creates a charge

export default async function handler(req: Request): Promise<Response> {
    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Parse request body
    const { token, packageId } = await req.json();

    if (!token || !packageId) {
        return new Response(JSON.stringify({ error: 'Missing token or packageId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Get secret key from environment
    const secretKey = process.env.OMISE_SECRET_KEY;
    if (!secretKey) {
        return new Response(JSON.stringify({ error: 'Omise secret key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Package pricing (in satang)
    const packages: Record<string, { credits: number; amount: number }> = {
        starter: { credits: 50, amount: 9900 },
        pro: { credits: 200, amount: 29900 },
        unlimited: { credits: 500, amount: 59900 },
    };

    const pkg = packages[packageId];
    if (!pkg) {
        return new Response(JSON.stringify({ error: 'Invalid package' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Create charge via Omise API
        const response = await fetch('https://api.omise.co/charges', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(secretKey + ':')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                amount: pkg.amount.toString(),
                currency: 'thb',
                card: token,
                description: `LazyCreator ${packageId} package - ${pkg.credits} credits`,
            }),
        });

        const charge = await response.json();

        if (charge.status === 'successful' || charge.status === 'pending') {
            return new Response(JSON.stringify({
                success: true,
                credits: pkg.credits,
                chargeId: charge.id,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (charge.failure_code) {
            return new Response(JSON.stringify({
                error: charge.failure_message || 'Payment failed',
                code: charge.failure_code,
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Payment failed' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (err: any) {
        console.error('Omise charge error:', err);
        return new Response(JSON.stringify({ error: 'Payment processing error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
