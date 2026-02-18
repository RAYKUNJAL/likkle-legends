
import { PAYPAL_CONFIG, SUBSCRIPTION_PLANS } from '../lib/paypal';
import { config } from 'dotenv';
config();

console.log("💳 Verifying PayPal Configuration...");

if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.warn("⚠️  NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing. Using 'sb' (Sandbox).");
} else {
    console.log("✅ PayPal Client ID found.");
}

console.log("\n📋 Checking Subscription Plans:");
Object.values(SUBSCRIPTION_PLANS).forEach((plan: any) => {
    if (plan.id === 'plan_free_forever') return;

    if (plan.paypalPlanId.startsWith('P-')) {
        console.warn(`⚠️  Plan '${plan.name}' is using placeholder ID: ${plan.paypalPlanId}`);
        console.warn(`   -> Add NEXT_PUBLIC_PAYPAL_PLAN_${plan.id.toUpperCase().replace('PLAN_', '')} to .env`);
    } else {
        console.log(`✅ Plan '${plan.name}' has configured ID: ${plan.paypalPlanId}`);
    }
});

console.log("\nℹ️  Note: Checkout will simulate success in Sandbox mode if Plan IDs are invalid.");
