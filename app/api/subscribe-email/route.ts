import { NextRequest, NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, location } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !location) {
      return NextResponse.json(
        { error: 'Please fill in all fields to continue' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID || !process.env.MAILCHIMP_SERVER_PREFIX) {
      console.error('Missing Mailchimp environment variables');
      return NextResponse.json(
        { error: 'Oops! Something went wrong on our end. Please try again later.' },
        { status: 500 }
      );
    }

    // Add subscriber to Mailchimp
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_LIST_ID,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          COUNTRY: location,
        },
        tags: process.env.MAILCHIMP_TAG ? [process.env.MAILCHIMP_TAG] : [],
      }
    ) as { id: string; email_address: string };

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to the mailing list',
        subscriberId: response.id
      },
      { status: 200 }
    );

  } catch (error) {
    // Type guard for Mailchimp API errors
    const mailchimpError = error as {
      status?: number;
      title?: string;
      detail?: string;
      message?: string;
      response?: {
        body?: {
          title?: string;
          detail?: string;
          status?: number;
        };
      };
    };

    // Extract error details from response body if available
    const errorTitle = mailchimpError.title || mailchimpError.response?.body?.title;
    const errorDetail = mailchimpError.detail || mailchimpError.response?.body?.detail;
    const errorStatus = mailchimpError.status || mailchimpError.response?.body?.status;

    // Log detailed error for debugging
    console.error('Mailchimp subscription error:', {
      status: errorStatus,
      title: errorTitle,
      detail: errorDetail,
      message: mailchimpError.message,
    });

    // Handle specific Mailchimp errors with user-friendly messages
    if (errorStatus === 400 && errorTitle === 'Member Exists') {
      return NextResponse.json(
        { error: 'Good news! You\'re already subscribed to our mailing list.' },
        { status: 400 }
      );
    }

    // Check if error message or detail contains "already a list member"
    const errorText = `${errorTitle} ${errorDetail} ${mailchimpError.message}`.toLowerCase();
    if (errorText.includes('already') || errorText.includes('member exists') || errorText.includes('is already a list member')) {
      return NextResponse.json(
        { error: 'Good news! You\'re already subscribed to our mailing list.' },
        { status: 400 }
      );
    }

    if (errorStatus === 400 && errorTitle === 'Invalid Resource') {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (errorStatus === 401 || errorStatus === 403) {
      console.error('Authentication error - check API credentials');
      return NextResponse.json(
        { error: 'Oops! Something went wrong. Please try again later.' },
        { status: 500 }
      );
    }

    // Generic user-friendly error
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
