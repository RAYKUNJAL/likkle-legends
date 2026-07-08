/**
 * Meta Pixel Integration Example for Checkout Page
 * 
 * This file shows how to integrate Meta Pixel events into the checkout flow.
 * Copy these patterns into your actual checkout/page.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import {
  trackViewContent,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  setUserData,
} from '@/lib/meta-pixel';

interface CheckoutFormData {
  email: string;
  phone?: string;
  planId: string;
  planPrice: number;
  planName: string;
}

export default function CheckoutPageExample() {
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({});
  const [planId] = useState('monthly_9.99');
  const [planPrice] = useState(9.99);
  const [planName] = useState('Monthly Subscription');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * PATTERN 1: Track when user arrives at checkout
   * Fire on component mount
   */
  useEffect(() => {
    console.log('[Checkout] Page loaded - tracking ViewContent');

    trackViewContent('checkout', planId, {
      value: planPrice,
      currency: 'USD',
      content_name: planName,
    });
  }, [planId, planPrice, planName]);

  /**
   * PATTERN 2: Track when user fills email
   * Set user data for lookalike audiences
   */
  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));

    // Optional: Track user data for Meta matching
    if (email && email.includes('@')) {
      setUserData(email);
    }
  };

  /**
   * PATTERN 3: Track when user adds payment info
   * Fire when card is entered/validated
   */
  const handlePaymentInfoEntered = (cardBrand?: string) => {
    console.log('[Checkout] Payment info entered');

    trackAddPaymentInfo(cardBrand, {
      value: planPrice,
      currency: 'USD',
    });
  };

  /**
   * PATTERN 4: Track InitiateCheckout when form is submitted
   * Fire right before payment processing
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Checkout] Form submitted - tracking InitiateCheckout');

    // Track that user is initiating checkout
    trackInitiateCheckout(planPrice, 'USD', {
      content_name: planName,
      content_type: 'subscription',
      email: formData.email,
    });

    setIsProcessing(true);

    try {
      // Process payment (via PayPal or Stripe)
      const result = await processPayment(formData as CheckoutFormData);

      if (result.success) {
        /**
         * PATTERN 5: Track Purchase after payment succeeds
         * CRITICAL: This is the most important event for ROAS tracking
         * Send both client-side and server-side (Conversions API)
         */

        // Client-side pixel
        trackPurchase(planPrice, 'USD', planName, {
          transaction_id: result.transactionId,
          email: formData.email,
        });

        // Server-side conversion (MORE RELIABLE)
        await fetch('/api/meta/track-conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: 'Purchase',
            user_email: formData.email,
            user_phone: formData.phone,
            value: planPrice,
            currency: 'USD',
            content_name: planName,
            content_type: 'subscription',
            user_id: result.userId, // Optional: user ID for matching
          }),
        });

        console.log('[Checkout] Purchase completed and tracked');

        // Redirect to success page
        window.location.href = '/dashboard?subscription=success';
      } else {
        console.error('[Checkout] Payment failed:', result.error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1>Checkout - {planName}</h1>
      <p className="text-2xl font-bold mb-6">${planPrice}/month</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="parent@example.com"
          />
          <small className="text-gray-500">
            Used for your account and receipt
          </small>
        </div>

        {/* Phone Field (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-2 border rounded"
            placeholder="+1 (555) 123-4567"
          />
          <small className="text-gray-500">For important account updates</small>
        </div>

        {/* Payment Info Section */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Payment Information</h3>

          {/* Card Input Placeholder */}
          <div>
            <label htmlFor="card" className="block text-sm font-medium mb-2">
              Card Number
            </label>
            <input
              id="card"
              type="text"
              placeholder="1234 5678 9012 3456"
              onFocus={() => handlePaymentInfoEntered('visa')}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <small className="text-gray-500">
              We accept Visa, Mastercard, and American Express
            </small>
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              placeholder="MM/YY"
              className="px-4 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="CVV"
              className="px-4 py-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-100 p-4 rounded">
          <div className="flex justify-between mb-2">
            <span>Subscription</span>
            <span>${planPrice}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>${planPrice}/month</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : `Subscribe - $${planPrice}/month`}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Cancel anytime. No questions asked.
        </p>
      </form>

      {/* Debug Info (Remove in production) */}
      <details className="mt-8 p-4 bg-gray-50 rounded text-xs">
        <summary className="cursor-pointer font-semibold">Debug Info</summary>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify(
            {
              formData,
              planId,
              planPrice,
              planName,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}

/**
 * Mock payment processing function
 * Replace with your actual PayPal/Stripe integration
 */
async function processPayment(
  data: CheckoutFormData
): Promise<{ success: boolean; error?: string; transactionId?: string; userId?: string }> {
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `txn_${Date.now()}`,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      });
    }, 2000);
  });
}

/**
 * INTEGRATION CHECKLIST:
 * 
 * [ ] Copy patterns from this file to your actual checkout/page.tsx
 * [ ] Ensure Meta Pixel is initialized in layout.tsx
 * [ ] Test ViewContent fires when checkout page loads
 * [ ] Test InitiateCheckout fires when form submitted
 * [ ] Test AddPaymentInfo fires when card field interacted
 * [ ] Test Purchase fires after payment succeeds
 * [ ] Verify events appear in Meta Events Manager within 30 seconds
 * [ ] Test server-side Conversions API at /api/meta/track-conversion
 * [ ] Monitor conversion ROAS in Ads Manager after 100+ conversions
 */
