import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
});

const preference = new Preference(client);

export async function POST(request: Request) {
    try {
        const { userId, userEmail } = await request.json();

        console.log('📦 Create subscription request:', { userId, userEmail });

        if (!userId || !userEmail) {
            console.error('❌ Missing user data:', { userId, userEmail });
            return Response.json({ error: 'Missing user data' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://veta.lat';

        // Create preference for $10/month subscription
        const preferenceData = {
            items: [
                {
                    id: 'veta-pro-monthly',
                    title: 'Veta Pro - Suscripción Mensual',
                    description: 'Búsquedas ilimitadas de problemas de negocio',
                    quantity: 1,
                    unit_price: 9900,
                    currency_id: 'CLP'
                }
            ],
            back_urls: {
                success: `${appUrl}/payment/success`,
                failure: `${appUrl}/payment/failure`,
                pending: `${appUrl}/payment/pending`
            },
            auto_return: 'approved' as const,
            notification_url: `${appUrl}/api/webhook/mercadopago`,
            external_reference: userId,
            payer: {
                email: userEmail
            },
            payment_methods: {
                installments: 1 // No installments for subscriptions
            },
            statement_descriptor: 'VETA PRO',
            binary_mode: true
        };

        const response = await preference.create({ body: preferenceData });

        console.log('✅ MercadoPago preference created:', {
            preferenceId: response.id,
            external_reference: response.external_reference,
            initPoint: response.init_point
        });

        return Response.json({
            preferenceId: response.id,
            initPoint: response.init_point
        });

    } catch (error: any) {
        console.error('MercadoPago API Error:', error);
        return Response.json(
            { error: error.message || 'Error creating payment' },
            { status: 500 }
        );
    }
}
