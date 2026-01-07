import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PlanType, PLANS } from '@/lib/plans';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
});

const preference = new Preference(client);

// Plan pricing configuration
const PLAN_PRICES: Record<Exclude<PlanType, 'free'>, { price: number; title: string; description: string }> = {
    pro: {
        price: 10,
        title: 'Veta Pro - Monthly Subscription',
        description: '5 scans per month, unlimited pain points'
    },
    advanced: {
        price: 29,
        title: 'Veta Advanced - Monthly Subscription',
        description: '15 scans per month, priority support'
    }
};

export async function POST(request: Request) {
    try {
        const { userId, userEmail, planType = 'pro' } = await request.json();

        console.log('📦 Create subscription request:', { userId, userEmail, planType });

        if (!userId || !userEmail) {
            console.error('❌ Missing user data:', { userId, userEmail });
            return Response.json({ error: 'Missing user data' }, { status: 400 });
        }

        // Validate plan type
        if (planType !== 'pro' && planType !== 'advanced') {
            console.error('❌ Invalid plan type:', planType);
            return Response.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        const planConfig = PLAN_PRICES[planType as Exclude<PlanType, 'free'>];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://veta.lat';

        // Create preference for subscription
        const preferenceData = {
            items: [
                {
                    id: `veta-${planType}-monthly`,
                    title: planConfig.title,
                    description: planConfig.description,
                    quantity: 1,
                    unit_price: planConfig.price,
                    currency_id: 'USD'
                }
            ],
            back_urls: {
                success: `${appUrl}/payment/success?plan=${planType}`,
                failure: `${appUrl}/payment/failure`,
                pending: `${appUrl}/payment/pending`
            },
            auto_return: 'approved' as const,
            notification_url: `${appUrl}/api/webhook/mercadopago`,
            // Include plan type in external reference for webhook processing
            external_reference: JSON.stringify({ userId, planType }),
            payer: {
                email: userEmail
            },
            payment_methods: {
                installments: 1 // No installments for subscriptions
            },
            statement_descriptor: `VETA ${planType.toUpperCase()}`,
            binary_mode: true
        };

        const response = await preference.create({ body: preferenceData });

        console.log('✅ MercadoPago preference created:', {
            preferenceId: response.id,
            external_reference: response.external_reference,
            initPoint: response.init_point,
            planType
        });

        return Response.json({
            preferenceId: response.id,
            initPoint: response.init_point,
            planType
        });

    } catch (error: any) {
        console.error('MercadoPago API Error:', error);
        return Response.json(
            { error: error.message || 'Error creating payment' },
            { status: 500 }
        );
    }
}
