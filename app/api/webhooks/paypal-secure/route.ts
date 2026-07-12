// This route previously contained a FAKE signature verification function that
// always returned `true`, meaning anyone could POST forged webhook events to it
// and activate/cancel subscriptions at will.
//
// The secure, properly-verified PayPal webhook handler lives at:
//   /api/payments/paypal/webhooks
//
// That handler uses PayPal's official verify-webhook-signature API endpoint.
// This route now simply re-exports that handler so any PayPal dashboard URL
// configured to point here still works, but with REAL verification.
export { POST } from '@/app/api/payments/paypal/webhooks/route';
