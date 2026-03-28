# PayPal Integration Configuration Guide

## Overview
The Likkle Legends checkout system uses PayPal for subscription and one-time payment processing. The integration requires several environment variables to be properly configured.

## Required Environment Variables

### 1. **PayPal Client ID** (Required)
- **Variable Name**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- **Description**: Your PayPal application's client ID
- **Where to Get**:
  - Log in to [PayPal Developer Dashboard](https://developer.paypal.com/)
  - Navigate to Apps & Credentials
  - Select Sandbox (for testing) or Live (for production)
  - Copy your Client ID from the app credentials
- **Example**: `AZS0bXx0xJ8qK9H0L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6`

### 2. **PayPal Client Secret** (Required - Server Only)
- **Variable Name**: `PAYPAL_CLIENT_SECRET`
- **Description**: Your PayPal application's client secret (NEVER expose to frontend)
- **Where to Get**: PayPal Developer Dashboard (next to Client ID)
- **Important**: This should ONLY be in `.env.local` or server-side environment variables, never in `NEXT_PUBLIC_*` variables

### 3. **Subscription Plan IDs** (Required for Paid Plans)
These IDs are created in your PayPal Business Account. Each plan corresponds to a subscription tier:

| Plan | Variable Name | Value Example |
|------|---------------|----------------|
| Digital Legends (Monthly) | `NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL` | `P-abc123def456` |
| Digital Legends (Yearly) | `NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY` | `P-xyz789uvw012` |
| Island Starter (Monthly) | `NEXT_PUBLIC_PAYPAL_PLAN_STARTER` | `P-123abc456def` |
| Island Starter (Yearly) | `NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY` | `P-456def789ghi` |
| Legends Plus (Monthly) | `NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS` | `P-789ghi012jkl` |
| Legends Plus (Yearly) | `NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY` | `P-012jkl345mno` |
| Family Legacy (Monthly) | `NEXT_PUBLIC_PAYPAL_PLAN_FAMILY` | `P-345mno678pqr` |
| Family Legacy (Yearly) | `NEXT_PUBLIC_PLAN_FAMILY_YEARLY` | `P-678pqr901stu` |

## How to Create PayPal Billing Plans

1. **Log in to PayPal Business Account**
   - Go to [paypal.com](https://www.paypal.com)
   - Click "Log In" and select Business Account

2. **Navigate to Billing Plans**
   - Go to Tools > Subscriptions > Create Billing Plans
   - Or visit the [Subscriptions Dashboard](https://www.paypal.com/cgi-bin/customerprofilepmt?cmd=_manage-subscriptions)

3. **Create a Billing Plan**
   - Select "Create a new plan"
   - Fill in plan details:
     - **Name**: e.g., "Digital Legends - Monthly"
     - **Description**: e.g., "Unlimited digital learning"
     - **Billing Frequency**: Monthly or Yearly
     - **Regular Billing Amount**: $4.99 (monthly) or $49.90 (yearly)
     - **Billing Cycle**: Set to appropriate duration
     - **Number of Billing Cycles**: Leave blank for continuous
   - Click "Create Plan"

4. **Copy the Plan ID**
   - After creation, you'll see the Plan ID (format: `P-XXXXXXXXX`)
   - Add this to your environment variables

## Verifying Configuration

### Development Environment
1. Create `.env.local` in the project root:
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL=P-your_digital_plan_id
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY=P-your_digital_yearly_plan_id
# ... add other plan IDs
```

2. Run `npm run dev` and navigate to `/checkout`
3. The checkout page should display payment options

### Production Environment (Vercel)
1. Go to your Vercel project settings
2. Navigate to **Settings > Environment Variables**
3. Add all required variables with production PayPal credentials:
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (production client ID)
   - `PAYPAL_CLIENT_SECRET` (production secret)
   - All `NEXT_PUBLIC_PAYPAL_PLAN_*` variables with production plan IDs

4. Redeploy the project: `vercel --prod`

## Troubleshooting

### "Payment configuration is incomplete" Error
- **Cause**: Missing PayPal Plan IDs for the selected subscription tier
- **Solution**: Add the missing plan ID to environment variables and redeploy

### "Payment System Unavailable" Error
- **Cause**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is not set
- **Solution**: Configure the PayPal Client ID in environment variables

### PayPal Buttons Don't Appear
- **Check Browser Console**: Look for any JavaScript errors
- **Verify Client ID**: Make sure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is not empty
- **Check Script Loading**: PayPal SDK should load from `https://www.paypal.com/sdk/js`

### Test vs Production Credentials
- **Sandbox Mode**: For testing with fake transactions
- **Live Mode**: For real customer payments
- Switch using different credentials in environment variables

## Free Plan Note
The "Free Forever" plan does not require PayPal credentials as it has no payment processing. Users can sign up directly without payment information.

## Support
For PayPal integration issues, contact:
- **Internal**: legends@likklelegends.com
- **PayPal Support**: [developer.paypal.com/support](https://developer.paypal.com/support)
