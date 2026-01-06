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

        console.log('📦 Create workshop payment request:', { userId, userEmail });

        if (!userId || !userEmail) {
            console.error('❌ Missing user data:', { userId, userEmail });
            return Response.json({ error: 'Missing user data' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://veta.lat';

        // Create preference for $19 USD workshop
        const preferenceData = {
            items: [
                {
                    id: 'veta-workshop-validacion',
                    title: 'Workshop: Cómo elegir un buen problema y validarlo',
                    description: 'Workshop en vivo sobre selección y validación de problemas usando Veta',
                    quantity: 1,
                    unit_price: 19,
                    currency_id: 'USD'
                }
            ],
            back_urls: {
                success: `${appUrl}/workshop/success`,
                failure: `${appUrl}/workshop?payment=failed`,
                pending: `${appUrl}/workshop?payment=pending`
            },
            auto_return: 'approved' as const,
            external_reference: `workshop-${userId}`,
            payer: {
                email: userEmail
            },
            payment_methods: {
                installments: 1
            },
            statement_descriptor: 'VETA WORKSHOP',
            binary_mode: true
        };

        const response = await preference.create({ body: preferenceData });

        console.log('✅ MercadoPago workshop preference created:', {
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
