import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      slug,
      title,
      description,
      format,
      content,
      category_slug,
      tags,
      is_premium,
      is_published,
      estimated_duration_minutes,
      author,
      display_order,
    } = body;

    // Validate required fields
    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Slug and title are required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('content_items')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A content item with this slug already exists' },
        { status: 400 }
      );
    }

    // Insert new content item
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        slug,
        title,
        description,
        format: format || 'lesson',
        content,
        category_slug,
        tags: tags || [],
        is_premium: is_premium || false,
        is_published: is_published ?? true,
        estimated_duration_minutes: estimated_duration_minutes || 5,
        author: author || 'Founder Groundworks Team',
        display_order: display_order || 1,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      id,
      slug,
      title,
      description,
      format,
      content,
      category_slug,
      tags,
      is_premium,
      is_published,
      estimated_duration_minutes,
      author,
      display_order,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Slug and title are required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug (excluding current item)
    const { data: existing } = await supabase
      .from('content_items')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A content item with this slug already exists' },
        { status: 400 }
      );
    }

    // Update content item
    const { data, error } = await supabase
      .from('content_items')
      .update({
        slug,
        title,
        description,
        format: format || 'lesson',
        content,
        category_slug,
        tags: tags || [],
        is_premium: is_premium || false,
        is_published: is_published ?? true,
        estimated_duration_minutes: estimated_duration_minutes || 5,
        author: author || 'Founder Groundworks Team',
        display_order: display_order || 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
