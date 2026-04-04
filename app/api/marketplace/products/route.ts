import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = createClient();
    let query = supabase
      .from('marketplace_products')
      .select('*')
      .eq('status', 'active');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query.order('total_sales', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ products: data });
  } catch (err) {
    console.error('Marketplace fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { title, description, category, price, image_url } = await req.json();

    const { data, error } = await supabase
      .from('marketplace_products')
      .insert({
        creator_id: user.id,
        title,
        description,
        category,
        price,
        image_url,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    console.error('Product creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
