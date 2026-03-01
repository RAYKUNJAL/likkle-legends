import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';

const client = supabaseAdmin;

// Get notifications for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!userId) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Verify the caller owns this user_id
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = client
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data: notifications, error } = await query;

        if (error) {
            console.error('Notifications fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
        }

        // Get unread count
        const { count: unreadCount } = await client
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        return NextResponse.json({
            notifications: notifications || [],
            unread_count: unreadCount || 0,
        });
    } catch (error) {
        console.error('Notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Mark notification(s) as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { notification_id, user_id, mark_all } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Verify the caller owns this user_id
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (mark_all) {
            // Mark all notifications as read
            const { error } = await client
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user_id)
                .eq('read', false);

            if (error) {
                console.error('Mark all read error:', error);
                return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
            }
        } else if (notification_id) {
            // Mark single notification as read
            const { error } = await client
                .from('notifications')
                .update({ read: true })
                .eq('id', notification_id)
                .eq('user_id', user_id);

            if (error) {
                console.error('Mark read error:', error);
                return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Delete notification
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');
        const userId = searchParams.get('user_id');

        if (!notificationId || !userId) {
            return NextResponse.json({ error: 'Missing id or user_id' }, { status: 400 });
        }

        // Verify the caller owns this user_id
        const supabaseAuth = createClient();
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (!user || user.id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        const { error } = await client
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) {
            console.error('Delete notification error:', error);
            return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
