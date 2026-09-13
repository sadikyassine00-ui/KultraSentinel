import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, accountType, website, catalogSize } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid work email address is required.' },
        { status: 400 }
      );
    }

    // Validate website / store URL
    if (!website || typeof website !== 'string' || website.trim().length === 0) {
      return NextResponse.json(
        { error: 'Primary store URL or agency website is required.' },
        { status: 400 }
      );
    }

    // Log the lead for telemetry & record
    console.log('[Kultra Pilot Lead]', {
      email,
      accountType: accountType || 'merchant',
      website,
      catalogSize: catalogSize || 'Not specified',
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Pilot application recorded successfully.',
      bookingUrl: 'https://cal.com/kultra/15min-audit',
    });
  } catch (error) {
    console.error('[Kultra Pilot Lead Error]', error);
    return NextResponse.json(
      { error: 'Internal server error processing application.' },
      { status: 500 }
    );
  }
}
