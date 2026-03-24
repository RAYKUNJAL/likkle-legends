import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

const DOWNLOAD_FILES: Record<string, {
    bucket: string;
    path: string;
    filename: string;
}> = {
    'caribbean-abc-coloring-pack': {
        bucket: 'lead-magnets',
        path: 'caribbean-abc-coloring-pack.pdf',
        filename: 'Caribbean-ABC-Coloring-Pack.pdf',
    },
    'classroom-activity-pack': {
        bucket: 'lead-magnets',
        path: 'classroom-activity-pack.pdf',
        filename: 'Caribbean-Classroom-Activity-Pack.pdf',
    },
};

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    const email = request.nextUrl.searchParams.get('email');

    if (!id || !DOWNLOAD_FILES[id]) {
        return NextResponse.json({ error: 'Invalid download ID' }, { status: 400 });
    }

    const fileConfig = DOWNLOAD_FILES[id];
    const admin = createAdminClient();

    // Verify the email exists in leads table (basic gate)
    if (email) {
        const { data: lead } = await admin
            .from('leads')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!lead) {
            return NextResponse.json({ error: 'Please sign up first to download' }, { status: 403 });
        }

        // Track the download
        await admin.from('system_logs').insert({
            action_type: 'lead_magnet_download',
            description: `Download: ${id} by ${email}`,
            metadata: { download_id: id, email },
        });
    }

    // Fetch the file from Supabase storage
    const { data, error } = await admin.storage
        .from(fileConfig.bucket)
        .download(fileConfig.path);

    if (error || !data) {
        console.error('Download file error:', error);
        return NextResponse.json(
            { error: 'File not found. Please contact support.' },
            { status: 404 }
        );
    }

    // Return the file as a downloadable response
    const arrayBuffer = await data.arrayBuffer();
    return new NextResponse(arrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileConfig.filename}"`,
            'Cache-Control': 'private, max-age=3600',
        },
    });
}
