# Environment Variables Setup

Copy these values to your `.env.local` file:

```env
# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# MercadoPago Configuration (TEST credentials) ✅ READY
MERCADOPAGO_ACCESS_TOKEN=TEST-2631614545715044-010119-b187f911f3985cdbc4d18d9399fb8e04-26769867
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-020ecc81-0b92-48bc-b348-7532ba356b10

# App URL (change to your production URL when deploying)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Perplexity API (you should already have this)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Still Missing:

### 1. **MercadoPago Public Key**
On the same credentials page where you found the Access Token, you should see:
- **Public key** (starts with `TEST-` for testing)
- Copy it and replace `TEST-your-public-key-here` above

### 2. **Supabase Service Role Key**
Go to your Supabase project:
1. Click **Settings** → **API**
2. Under "Project API keys", find **service_role** key
3. Copy it (it's the long secret key, NOT the anon key)

### 3. **Update .env.local**
Add or update these variables in your existing `.env.local` file.

## After Setup:

Run the subscription schema in Supabase:
```sql
-- Run: supabase/subscriptions_schema.sql
```

Then restart your dev server:
```bash
npm run dev
```
