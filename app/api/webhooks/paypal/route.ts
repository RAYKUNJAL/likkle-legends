// Re-export the PayPal webhook handler so PayPal's registered URL
// (https://www.likklelegends.com/api/webhooks/paypal) resolves correctly.
export { POST } from '@/app/api/payments/paypal/webhooks/route';
