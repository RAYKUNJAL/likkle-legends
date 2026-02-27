import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// PATCH /api/children/[id]
// Updates child's metadata (quiz results, learning preferences)
// Auth: Bearer token; verifies parent_id === authed user
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const childId = params.id;
        const body = await request.json();

        // Verify child belongs to this parent
        const { data: child, error: childError } = await supabaseAdmin
            .from('children')
            .select('id, parent_id')
            .eq('id', childId)
            .single();

        if (childError || !child) return NextResponse.json({ error: 'Child not found' }, { status: 404 });
        if (child.parent_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Only allow updating metadata and safe fields
        const allowedFields = ['metadata', 'favorite_character'];
        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updates[field] = body[field];
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data: updated, error: updateError } = await supabaseAdmin
            .from('children')
            .update(updates)
            .eq('id', childId)
            .select()
            .single();

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

        return NextResponse.json({ success: true, child: updated });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
