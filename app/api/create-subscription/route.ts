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

        if (!userId || !userEmail) {
            return Response.json({ error: 'Missing user data' }, { status: 400 });
        }

        // Create preference for $10/month subscription
        const preferenceData = {
            items: [
                {
                    id: 'veta-pro-monthly',
                    title: 'Veta Pro - Suscripción Mensual',
                    description: 'Búsquedas ilimitadas de problemas de negocio',
                    quantity: 1,
                    unit_price: 10,
                    currency_id: 'USD'
                }
            ],
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
                failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
            },
            auto_return: 'approved' as const,
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
            external_reference: userId,
            payer: {
                email: userEmail
            },
            payment_methods: {
                installments: 1 // No installments for subscriptions
            },
            statement_descriptor: 'VETA PRO'
        };

        const response = await preference.create({ body: preferenceData });

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
