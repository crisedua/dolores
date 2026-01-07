import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    // Initialize Supabase Admin Client inside function to avoid build-time errors
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { fullName, email, mobile } = body;

        console.log('📝 New workshop registration:', { fullName, email, mobile });

        if (!fullName || !email || !mobile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already registered
        const { data: existingUser } = await supabase
            .from('workshop_registrations')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('ℹ️ User already registered, updating details');
            const { data, error } = await supabase
                .from('workshop_registrations')
                .update({ full_name: fullName, mobile: mobile })
                .eq('email', email)
                .select()
                .single();

            return NextResponse.json({ success: true, data }, { status: 200 });
        }

        const { data, error } = await supabase
            .from('workshop_registrations')
            .insert({
                full_name: fullName,
                email: email,
                mobile: mobile
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving registration:', error);
            return NextResponse.json({ error: 'Error saving registration' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        console.error('❌ API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
