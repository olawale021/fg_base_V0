import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      location,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      q1_label,
      q2_label,
      q3_label,
      q4_label,
      q5_label,
      q6_label,
      q7_label,
      q8_label,
      q9_label,
      q10_label,
      baseScore,
      scoreBand,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !location ||
      !q1 ||
      !q2 ||
      !q3 ||
      !q4 ||
      !q5 ||
      !q6 ||
      !q7 ||
      !q8 ||
      !q9 ||
      !q10 ||
      !q1_label ||
      !q2_label ||
      !q3_label ||
      !q4_label ||
      !q5_label ||
      !q6_label ||
      !q7_label ||
      !q8_label ||
      !q9_label ||
      !q10_label ||
      baseScore === undefined ||
      !scoreBand
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    ) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Oops! Something went wrong on our end. Please try again later.' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Insert web test response into database 
    const { data, error } = await supabase
      .from('web_test_responses')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        location: location,
        q1,
        q1_label,
        q2,
        q2_label,
        q3,
        q3_label,
        q4,
        q4_label,
        q5,
        q5_label,
        q6,
        q6_label,
        q7,
        q7_label,
        q8,
        q8_label,
        q9,
        q9_label,
        q10,
        q10_label,
        base_score: baseScore,
        score_band: scoreBand,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Handle specific errors
      if (error.code === '23505') {
        // Unique constraint violation (if you add one later)
        return NextResponse.json(
          { error: 'Test response already exists' },
          { status: 400 }
        );
      }

      if (error.code === '23514') {
        // Check constraint violation
        return NextResponse.json(
          { error: 'Invalid test data provided' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Something went wrong. Please try again in a moment.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Test response saved successfully',
        id: data.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
