import { NextResponse } from 'next/server';
import { hashPassword, isAllowedAdminEmail, createSessionToken, getSessionCookieHeader } from '@/lib/auth';
import { findAdminByEmail, createOrUpdateAdmin, createTenant, createLead } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, companyName, accountType, website } = body;

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json({ error: 'Company or agency name is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCompany = companyName.trim();
    const cleanAccountType = (accountType === 'agency' ? 'agency' : 'merchant') as 'merchant' | 'agency';

    // 2. Check for duplicate account
    const existing = await findAdminByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);
    const isAdmin = isAllowedAdminEmail(cleanEmail);
    const userRole = isAdmin ? 'admin' : 'tenant';

    // 4. Create user record
    const user = await createOrUpdateAdmin({
      email: cleanEmail,
      passwordHash,
      name: cleanCompany,
      role: userRole,
    });

    // 5. Create tenant record
    const tenant = await createTenant({
      email: cleanEmail,
      companyName: cleanCompany,
      planTier: 'Trial',
      accountType: cleanAccountType,
      website: website || cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    });

    // 6. Record lead for platform CRM telemetry
    await createLead({
      email: cleanEmail,
      accountType: cleanAccountType,
      website: website || cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      catalogSize: '1,000 - 5,000 SKUs',
    });

    // 7. Issue session token
    const token = await createSessionToken({
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const cookieHeader = getSessionCookieHeader(token);

    const response = NextResponse.json({
      success: true,
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        user_id: tenant.user_id,
        company_name: tenant.company_name,
        plan_tier: tenant.plan_tier,
      },
      message: isAdmin
        ? 'Platform owner registered. Redirecting to Mission Control.'
        : 'Platform account provisioned. 14-day trial active.',
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Registration service encountered an error. Please try again.' }, { status: 500 });
  }
}
