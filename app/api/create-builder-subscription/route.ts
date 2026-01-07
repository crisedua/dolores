import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: NextRequest) {
    // Initialize MercadoPago client inside function to avoid build-time errors
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    try {
        const { userId, userEmail } = await request.json();

        console.log('📦 Create Builder subscription request:', { userId, userEmail });

        if (!userId || !userEmail) {
            console.error('❌ Missing user data:', { userId, userEmail });
            return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://veta.lat';

        // Create preference for $19 USD Builder subscription
        const preferenceData = {
            items: [
                {
                    id: 'veta-builder-monthly',
                    title: 'Veta Builder - Monthly Subscription',
                    description: 'Unlimited searches + Prototype Prompt Generator',
                    quantity: 1,
                    unit_price: 19,
                    currency_id: 'USD'
                }
            ],
            back_urls: {
                success: `${appUrl}/payment/success?plan=builder`,
                failure: `${appUrl}/payment/failure`,
                pending: `${appUrl}/payment/pending`
            },
            auto_return: 'approved' as const,
            notification_url: `${appUrl}/api/webhook/mercadopago`,
            external_reference: `${userId}:builder`,
            payer: {
                email: userEmail
            },
            payment_methods: {
                installments: 1
            },
            statement_descriptor: 'VETA BUILDER',
            binary_mode: true
        };

        const response = await preference.create({ body: preferenceData });

        console.log('✅ MercadoPago Builder preference created:', {
            preferenceId: response.id,
            external_reference: response.external_reference,
            initPoint: response.init_point
        });

        return NextResponse.json({
            preferenceId: response.id,
            initPoint: response.init_point
        });

    } catch (error: any) {
        console.error('MercadoPago API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error creating payment' },
            { status: 500 }
        );
    }
}
