import { adminDb, FieldValue } from '../lib/firebaseAdmin.js';

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const event = req.body;

        if (event.object !== 'event' || !event.key) {
            return res.status(400).json({ error: 'Invalid event format' });
        }

        if (event.key === 'charge.complete') {
            const chargeId = event.data.id;
            console.log(`Verifying charge: ${chargeId}`);

            // SECURITY: Verify the charge directly with Omise API
            // This prevents spoofed webhooks from granting credits
            if (!process.env.OMISE_SECRET_KEY) {
                console.error("OMISE_SECRET_KEY missing");
                return res.status(500).json({ error: "Server Configuration Error" });
            }

            const omiseResponse = await fetch(`https://api.omise.co/charges/${chargeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(process.env.OMISE_SECRET_KEY + ':').toString('base64')
                }
            });

            if (!omiseResponse.ok) {
                console.error(`Failed to verify charge ${chargeId} with Omise`);
                return res.status(400).json({ error: 'Charge verification failed' });
            }

            const verifiedCharge = await omiseResponse.json();

            // Check if status is truly successful
            if (verifiedCharge.status === 'successful') {
                const metadata = verifiedCharge.metadata || {};
                const { userId, planId, credits, type } = metadata;

                if (!userId) {
                    console.error('No userId in metadata');
                    return res.status(200).json({ received: true, error: 'No userId' });
                }

                const userRef = adminDb.collection('users').doc(userId);

                // Idempotency Check
                const userDoc = await userRef.get();
                if (userDoc.exists && userDoc.data()?.lastChargeId === verifiedCharge.id) {
                    console.log(`Charge ${verifiedCharge.id} already processed. Skipping.`);
                    return res.status(200).json({ received: true, status: 'already_processed' });
                }

                const batch = adminDb.batch();
                const creditsToAdd = Number(credits) || 0;

                if (type === 'subscription') {
                    // Subscription Logic
                    const now = new Date();
                    let months = 1;
                    if (planId === 'sub_pro_3m') months = 3;

                    const nextMonth = new Date(now.setMonth(now.getMonth() + months));

                    batch.set(userRef, {
                        plan: planId || 'pro',
                        status: 'active',
                        currentPeriodEnd: nextMonth,
                        updatedAt: new Date(),
                        paymentProvider: 'omise',
                        lastChargeId: verifiedCharge.id,
                        credits: FieldValue.increment(creditsToAdd)
                    }, { merge: true });

                } else {
                    // Top-up Logic
                    batch.update(userRef, {
                        credits: FieldValue.increment(creditsToAdd),
                        updatedAt: new Date(),
                        lastChargeId: verifiedCharge.id
                    });
                }

                await batch.commit();
                console.log(`Successfully processed charge ${verifiedCharge.id} for user ${userId}. Added ${creditsToAdd} credits.`);
            } else {
                console.warn(`Charge ${chargeId} verification returned status: ${verifiedCharge.status}`);
            }
        }

        res.status(200).json({ received: true });
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
}
