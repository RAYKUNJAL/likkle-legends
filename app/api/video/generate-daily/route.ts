import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export async function POST(request: NextRequest) {
  try {
    const { title, description, ageTrack } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Check if daily video already exists for today
    const today = new Date().toISOString().split('T')[0];

    const { data: existingVideo } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('created_at', `ge.${today}T00:00:00`)
      .eq('created_at', `lt.${today}T23:59:59`)
      .single();

    if (existingVideo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Daily video already generated',
          videoId: existingVideo.id,
        },
        { status: 200 }
      );
    }

    // Create video record
    const { data: newVideo, error } = await supabaseAdmin
      .from('videos')
      .insert({
        title,
        description,
        age_track: ageTrack || 'general',
        tier_required: 'free',
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Video creation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate video' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        videoId: newVideo.id,
        message: 'Daily video generated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Video generation failed' },
      { status: 500 }
    );
  }
}
