// In-App Messaging System
// Parent-to-Grandparent messaging, notifications, and announcements

import { supabase } from './storage';

// ==========================================
// MESSAGE TYPES
// ==========================================

export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    message_type: 'text' | 'image' | 'video' | 'achievement' | 'milestone';
    content: string;
    media_url?: string;
    metadata?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string;
    notification_type: 'achievement' | 'streak' | 'mission' | 'content' | 'subscription' | 'system';
    action_url?: string;
    is_read: boolean;
    created_at: string;
}

export interface Announcement {
    id: string;
    title: string;
    body: string;
    image_url?: string;
    target_audience: 'all' | 'parents' | 'grandparents' | 'subscribers';
    tier_required?: string;
    is_active: boolean;
    start_date: string;
    end_date?: string;
    created_at: string;
}

// ==========================================
// MESSAGING FUNCTIONS
// ==========================================

export async function sendMessage(
    senderId: string,
    recipientId: string,
    content: string,
    messageType: Message['message_type'] = 'text',
    mediaUrl?: string,
    metadata?: Record<string, unknown>
): Promise<Message | null> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: senderId,
            recipient_id: recipientId,
            message_type: messageType,
            content,
            media_url: mediaUrl,
            metadata,
            is_read: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to send message:', error);
        return null;
    }

    return data;
}

export async function getConversation(userId1: string, userId2: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to get conversation:', error);
        return [];
    }

    return (data || []).reverse();
}

export async function markMessagesAsRead(userId: string, senderId: string): Promise<void> {
    await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('sender_id', senderId)
        .eq('is_read', false);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
    const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    return count || 0;
}

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

export async function createNotification(
    userId: string,
    title: string,
    body: string,
    notificationType: Notification['notification_type'],
    actionUrl?: string
): Promise<Notification | null> {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            body,
            notification_type: notificationType,
            action_url: actionUrl,
            is_read: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create notification:', error);
        return null;
    }

    return data;
}

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to get notifications:', error);
        return [];
    }

    return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return count || 0;
}

// ==========================================
// ANNOUNCEMENT FUNCTIONS
// ==========================================

export async function getActiveAnnouncements(userTier?: string): Promise<Announcement[]> {
    const now = new Date().toISOString();

    let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false });

    if (userTier) {
        query = query.or(`tier_required.is.null,tier_required.eq.${userTier}`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Failed to get announcements:', error);
        return [];
    }

    return data || [];
}

// ==========================================
// STICKY NOTIFICATION TRIGGERS
// ==========================================

export async function notifyAchievement(userId: string, childName: string, badgeName: string): Promise<void> {
    await createNotification(
        userId,
        `🏆 ${childName} earned a badge!`,
        `${childName} just earned the "${badgeName}" badge! Keep up the great work!`,
        'achievement',
        '/dashboard/badges'
    );
}

export async function notifyStreakMilestone(userId: string, childName: string, streakDays: number): Promise<void> {
    const emoji = streakDays >= 30 ? '🔥' : streakDays >= 7 ? '⭐' : '✨';
    await createNotification(
        userId,
        `${emoji} ${streakDays}-Day Streak!`,
        `${childName} has been learning for ${streakDays} days in a row! Amazing dedication!`,
        'streak',
        '/dashboard'
    );
}

export async function notifyNewMission(userId: string): Promise<void> {
    await createNotification(
        userId,
        '🎯 New Mission Available!',
        'A new weekly mission is ready for your little legend to complete!',
        'mission',
        '/dashboard/missions'
    );
}

export async function notifyNewContent(userId: string, contentType: string, contentTitle: string): Promise<void> {
    await createNotification(
        userId,
        `📚 New ${contentType} Added!`,
        `"${contentTitle}" is now available in the digital portal!`,
        'content',
        '/portal'
    );
}

export async function notifySubscriptionRenewal(userId: string, daysRemaining: number): Promise<void> {
    if (daysRemaining <= 3) {
        await createNotification(
            userId,
            '💳 Subscription Renewal Soon',
            `Your subscription will renew in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Make sure your payment method is up to date!`,
            'subscription',
            '/account/billing'
        );
    }
}

// ==========================================
// GRANDPARENT SPECIFIC
// ==========================================

export async function shareChildProgress(
    parentId: string,
    grandparentId: string,
    childName: string,
    progressSummary: string
): Promise<void> {
    await sendMessage(
        parentId,
        grandparentId,
        progressSummary,
        'milestone',
        undefined,
        { childName }
    );
}

export async function sendVideoMessage(
    senderId: string,
    recipientId: string,
    videoUrl: string,
    caption: string
): Promise<Message | null> {
    return sendMessage(senderId, recipientId, caption, 'video', videoUrl);
}
