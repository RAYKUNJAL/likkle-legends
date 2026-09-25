
import { readFileSync } from 'fs';
import { PAYPAL_CONFIG, SUBSCRIPTION_PLANS } from '../lib/paypal';
import { config } from 'dotenv';
config();

const paypalSource = readFileSync(new URL('../lib/paypal.ts', import.meta.url), 'utf8');
if (paypalSource.includes('process.env[')) {
    throw new Error('lib/paypal.ts must use static process.env.NEXT_PUBLIC_PAYPAL_* reads so Next can inline them');
}
for (const key of [
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL',
    'NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY',
    'NEXT_PUBLIC_PAYPAL_PLAN_STARTER',
    'NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY',
    'NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS',
    'NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY',
    'NEXT_PUBLIC_PAYPAL_PLAN_FAMILY',
    'NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY',
]) {
    if (!paypalSource.includes(`process.env.${key}`)) {
        throw new Error(`lib/paypal.ts is missing a static read of ${key}`);
    }
}

console.log("💳 Verifying PayPal Configuration...");

if (!PAYPAL_CONFIG.clientId) {
    console.warn("⚠️  NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing. Checkout stays closed.");
} else {
    console.log("✅ PayPal Client ID found.");
}

console.log("\n📋 Checking Subscription Plans:");
Object.values(SUBSCRIPTION_PLANS).forEach((plan: any) => {
    if (plan.id === 'plan_free_forever') return;

    if (!plan.paypalPlanId) {
        console.warn(`⚠️  Plan '${plan.name}' has no PayPal plan id. Checkout stays closed for that plan.`);
    } else if (!plan.paypalPlanId.startsWith('P-')) {
        console.warn(`⚠️  Plan '${plan.name}' plan id does not look like a PayPal billing plan.`);
    } else {
        console.log(`✅ Plan '${plan.name}' has a PayPal plan id configured.`);
    }
});

console.log("\nℹ️  Checkout fails closed when a required PayPal var or plan id is missing. It does not simulate a successful payment.");
