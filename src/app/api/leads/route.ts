import { NextResponse } from 'next/server';
import { createLead } from '@/lib/db';

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

    // Persist to Neon Postgres DB
    const savedLead = await createLead({
      email: email.trim().toLowerCase(),
      accountType: accountType === 'agency' ? 'agency' : 'merchant',
      website: website.trim(),
      catalogSize: catalogSize || 'Not specified',
    });

    // Log the lead for telemetry & server record
    console.log('[Kultra Pilot Lead Recorded]', {
      id: savedLead.id,
      email: savedLead.email,
      accountType: savedLead.account_type,
      website: savedLead.website,
      catalogSize: savedLead.catalog_size,
      receivedAt: savedLead.created_at,
    });

    return NextResponse.json({
      success: true,
      leadId: savedLead.id,
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

