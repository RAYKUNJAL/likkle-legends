import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';
import { readFile } from 'fs/promises';
import path from 'path';

const DOWNLOAD_FILES: Record<string, {
    bucket: string;
    path: string;
    filename: string;
    /** Optional repo-local PDF under public/ (draft / offline fallback). */
    localPublicPath?: string;
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
    'journey-story-pack': {
        bucket: 'lead-magnets',
        path: 'journey-story-pack.pdf',
        filename: 'Likkle-Legends-Journey-Story-Pack.pdf',
        localPublicPath: 'printables/free-journey-pack.pdf',
    },
};

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    const email = request.nextUrl.searchParams.get('email');

    if (!id || !DOWNLOAD_FILES[id]) {
        return NextResponse.json({ error: 'Invalid download ID' }, { status: 400 });
    }

    const fileConfig = DOWNLOAD_FILES[id];
    let gatePassed = !email;

    try {
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
            gatePassed = true;

            // Track the download (non-blocking if the log table is unavailable)
            await admin.from('system_logs').insert({
                action_type: 'lead_magnet_download',
                description: `Download: ${id} by ${email}`,
                metadata: { download_id: id, email },
            });
        }

        // Prefer Supabase storage when uploaded; fall back to local public/ PDF.
        try {
            const storage = admin.storage?.from?.(fileConfig.bucket);
            if (storage?.download) {
                const { data, error } = await storage.download(fileConfig.path);
                if (!error && data) {
                    const arrayBuffer = await data.arrayBuffer();
                    return new NextResponse(arrayBuffer, {
                        headers: {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': `attachment; filename="${fileConfig.filename}"`,
                            'Cache-Control': 'private, max-age=3600',
                        },
                    });
                }
                if (error) console.error('Download file error:', error);
            }
        } catch (storageErr) {
            console.error('Lead-magnet storage unavailable:', storageErr);
        }
    } catch (adminErr) {
        console.error('Lead-magnet admin unavailable:', adminErr);
        if (email && !gatePassed) {
            return NextResponse.json(
                { error: 'Download is temporarily unavailable. Use the print view instead.' },
                { status: 503 }
            );
        }
    }

    if (!gatePassed) {
        return NextResponse.json({ error: 'Please sign up first to download' }, { status: 403 });
    }

    if (fileConfig.localPublicPath) {
        try {
            const localPath = path.join(process.cwd(), 'public', fileConfig.localPublicPath);
            const buf = await readFile(localPath);
            return new NextResponse(buf, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${fileConfig.filename}"`,
                    'Cache-Control': 'private, max-age=3600',
                },
            });
        } catch (localErr) {
            console.error('Local lead-magnet PDF missing:', localErr);
        }
    }

    return NextResponse.json(
        { error: 'File not found. Please contact support.' },
        { status: 404 }
    );
}
