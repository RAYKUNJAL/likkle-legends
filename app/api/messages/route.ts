import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

const client = supabaseAdmin;

// Get messages for a conversation
export async function GET(request: NextRequest) {
    try {
        // Verify caller is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const contactId = searchParams.get('contact_id');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!userId) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Callers can only read their own messages
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }




        let query = client
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(limit)
            .range(offset, offset + limit - 1);

        if (contactId) {
            query = client
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${userId})`)
                .order('created_at', { ascending: true })
                .limit(limit);
        }

        const { data: messages, error } = await query;

        if (error) {
            console.error('Messages fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error('Messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Send a new message
export async function POST(request: NextRequest) {
    try {
        // Verify caller is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { sender_id, recipient_id, content, message_type = 'text', child_id } = body;

        if (!sender_id || !recipient_id || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Callers can only send messages as themselves
        if (sender_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }




        // Create the message
        const { data: message, error: insertError } = await client
            .from('messages')
            .insert({
                sender_id,
                recipient_id,
                content,
                message_type,
                child_id,
                read: false,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Message insert error:', insertError);
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
        }

        // Create a notification for the recipient
        await client.from('notifications').insert({
            user_id: recipient_id,
            title: '💌 New Message',
            body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            notification_type: 'message',
            action_url: '/messages',
        });

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Mark messages as read
export async function PATCH(request: NextRequest) {
    try {
        // Verify caller is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { user_id, contact_id } = body;

        if (!user_id || !contact_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Callers can only mark their own messages as read
        if (user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }




        // Mark all messages from contact as read
        const { error } = await client
            .from('messages')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('sender_id', contact_id)
            .eq('recipient_id', user_id)
            .eq('read', false);

        if (error) {
            console.error('Mark read error:', error);
            return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
