
import { supabase } from '@/lib/storage';

export async function createOrder(orderData: {
    profile_id: string;
    tier: string;
    amount_cents: number;
    currency: string;
    shipping_name: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    fulfillment_hub: string;
    child_name: string;
    child_age: number;
    selected_island: string;
}) {
    const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getOrders(profileId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const updates: Record<string, unknown> = { fulfillment_status: status };

    if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
        if (trackingNumber) updates.tracking_number = trackingNumber;
    } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getAllOrders(status?: string, limit = 100, offset = 0) {
    let query = supabase
        .from('orders')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('fulfillment_status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { orders: data || [], total: count || 0 };
}
