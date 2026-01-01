# MercadoPago Subscription Setup

## Environment Variables Required

Add these to your `.env.local` file:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Change to your production URL

# Supabase Service Role (for webhook)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Getting MercadoPago Credentials

1. Go to [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Create an application
3. Get your **Access Token** and **Public Key** from the credentials section
4. For testing, use **TEST** credentials
5. For production, switch to **PRODUCTION** credentials

## Database Setup

Run the subscription schema in Supabase SQL Editor:

```sql
-- Located in: supabase/subscriptions_schema.sql
```

This creates tables for:
- `subscriptions` - User subscription status
- `payments` - Payment history
- `usage_tracking` - Free tier usage limits (5 searches/month)

## Testing the Flow

### 1. Visit Pricing Page
```
http://localhost:3000/pricing
```

### 2. Click "Actualizar a Pro"
- You'll be redirected to MercadoPago checkout
- Use test cards for testing

### 3. Test Cards (MercadoPago)
- **Approved**: 5031 7557 3453 0604
- **Rejected**: 5031 4332 1540 6351
- Use any future expiry date and CVV

### 4. After Payment
- Success: Redirects to `/payment/success`
- Failure: Redirects to `/payment/failure`
- Pending: Redirects to `/payment/pending`

### 5. Webhook Activation
- MercadoPago sends webhook to `/api/webhook/mercadopago`
- Subscription is activated in database
- User can now make unlimited searches

## Webhook Configuration

In MercadoPago dashboard:
1. Go to Your Application → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhook/mercadopago`
3. Select events: `payment`

## Features Implemented

### Free Plan
- 5 searches per month
- Basic results
- Limited history

### Pro Plan ($10/month)
- Unlimited searches
- Full AI analysis
- Unlimited history
- Saved reports
- Custom templates
- Priority support

## Next Steps

1. Add `.env.local` variables
2. Run subscription schema in Supabase
3. Test with MercadoPago test credentials
4. Configure webhook in MercadoPago dashboard
5. Update `NEXT_PUBLIC_APP_URL` for production
6. Switch to production credentials when ready

## Usage Tracking

The system automatically:
- Tracks search count per user per month
- Blocks free users after 5 searches
- Resets count monthly
- Allows unlimited for Pro users

## Cancel Subscription

Users can cancel by:
1. Logging into MercadoPago account
2. Managing subscriptions
3. Canceling "Veta Pro"

*Note: Implement a cancel button in your app settings for better UX*
