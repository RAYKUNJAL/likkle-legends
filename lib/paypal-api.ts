/**
 * PayPal API Helper - Handles subscription management API calls
 * All subscription changes must be committed to PayPal BEFORE updating local DB
 */

const PAYPAL_API = process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Get PayPal OAuth access token
 */
export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("CRITICAL: Missing PayPal credentials (NEXT_PUBLIC_PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET)");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (!response.ok) {
        throw new Error(`PayPal OAuth failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Cancel a PayPal subscription
 * @param subscriptionId - PayPal subscription ID (e.g., I-XXXXX)
 * @returns Success confirmation from PayPal
 */
export async function cancelPayPalSubscription(subscriptionId: string): Promise<{ success: boolean; details?: string }> {
    if (!subscriptionId) {
        throw new Error("Missing subscription ID for cancellation");
    }

    try {
        const accessToken = await getPayPalAccessToken();

        const response = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason: "Customer requested cancellation"
                }),
            }
        );

        // PayPal returns 204 No Content on success
        if (response.status === 204) {
            console.log(`[PayPal] Successfully cancelled subscription: ${subscriptionId}`);
            return { success: true };
        }

        // Handle error responses
        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.message || errorData.details?.[0]?.description || "Unknown error";
            console.error(`[PayPal] Cancel subscription failed: ${errorMsg}`, errorData);
            throw new Error(`PayPal cancel failed: ${errorMsg}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error(`[PayPal] Cancellation error for ${subscriptionId}:`, error.message);
        throw error;
    }
}

/**
 * Update a PayPal subscription plan (upgrade/downgrade)
 * @param subscriptionId - PayPal subscription ID (e.g., I-XXXXX)
 * @param newPlanId - New PayPal plan ID to switch to
 * @returns Success confirmation from PayPal
 */
export async function updatePayPalSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string
): Promise<{ success: boolean; details?: string }> {
    if (!subscriptionId || !newPlanId) {
        throw new Error("Missing subscription ID or plan ID for update");
    }

    try {
        const accessToken = await getPayPalAccessToken();

        const response = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/revise`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan_id: newPlanId,
                    reason: "Customer requested plan change"
                }),
            }
        );

        // PayPal returns 204 No Content on success
        if (response.status === 204) {
            console.log(`[PayPal] Successfully updated subscription ${subscriptionId} to plan ${newPlanId}`);
            return { success: true };
        }

        // Handle error responses
        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.message || errorData.details?.[0]?.description || "Unknown error";
            console.error(`[PayPal] Update subscription failed: ${errorMsg}`, errorData);
            throw new Error(`PayPal update failed: ${errorMsg}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error(`[PayPal] Update error for ${subscriptionId}:`, error.message);
        throw error;
    }
}

/**
 * Get PayPal subscription details
 * @param subscriptionId - PayPal subscription ID (e.g., I-XXXXX)
 * @returns Subscription details from PayPal
 */
export async function getPayPalSubscriptionDetails(subscriptionId: string): Promise<any> {
    if (!subscriptionId) {
        throw new Error("Missing subscription ID");
    }

    try {
        const accessToken = await getPayPalAccessToken();

        const response = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.message || "Unknown error";
            throw new Error(`Failed to fetch subscription: ${errorMsg}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error(`[PayPal] Fetch error for ${subscriptionId}:`, error.message);
        throw error;
    }
}
