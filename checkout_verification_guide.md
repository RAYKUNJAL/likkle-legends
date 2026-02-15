# Checkout Verification Guide

Use this guide to manually verify the checkout flow for the new 5-tier pricing structure.

## prerequisite
- Ensure the app is running: `npm run dev`
- Open your browser to: `http://localhost:3000`

## Test Scenarios

### 1. "Free Forever" Plan
**Goal**: Verify seamless signup without payment.
1. Navigate to `/pricing`.
2. Find the **"Free Forever"** card and click "Start Free".
3. **Verify**:
   - You are redirected to `/checkout?plan=plan_free_forever`.
   - The "Shipping" step should be **SKIPPED**.
   - The price should show **$0.00**.
   - The primary button should say "Start My Free Forever Plan".
4. **Action**: Click the button.
5. **Expected Result**:
   - Success message appears.
   - Redirects to `/onboarding/welcome`.
   - (Optional) Check database `profiles` table: `subscription_tier` should be `plan_free_forever`.

### 2. "Digital Legends" Plan ($4.99/mo)
**Goal**: Verify payment flow for digital-only plan (No Shipping).
1. Navigate to `/pricing`.
2. Select **"Digital Legends"**.
3. **Verify**:
   - Redirects to `/checkout`.
   - **Upsell**: Toggle "Grandparent Dashboard". Price should update (+ Free for launch).
   - "Shipping" step should be **SKIPPED**.
   - PayPal buttons should load.
4. **Action**: Complete payment (using PayPal Sandbox if configured, otherwise mock success).

### 3. "Legend Mail Intro" or "Legends Plus" (Physical Plans)
**Goal**: Verify shipping address collection.
1. Navigate to `/pricing`.
2. Select **"Starter Mailer"** (Mail Intro) or **"Legends Plus"**.
3. **Verify**:
   - "Shipping" step should be **VISIBLE** after the Upsell step.
   - You cannot proceed to payment without filling in the address.
4. **Action**: Fill in dummy address and proceed.
5. **Verify**:
   - Payment step shows the correct total.
   - PayPal buttons load.

### 4. "Family Legacy" (Annual Only)
**Goal**: Verify forced annual billing.
1. Navigate to `/pricing`.
2. Select **"Family Legacy"**.
3. **Verify**:
   - The billing toggle should be locked to **Annual**.
   - Price should reflect the yearly amount ($349.00).

## Troubleshooting
- If PayPal buttons don't load, check the console for `NEXT_PUBLIC_PAYPAL_CLIENT_ID` errors.
- If the "Shipping" step appears for digital plans, check the logic in `CheckoutFlow.tsx`.
