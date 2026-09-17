import { NextResponse } from 'next/server';
import {
  hashPassword,
  isAllowedAdminEmail,
  createSessionToken,
  getSessionCookieHeader,
  validatePasswordStrength,
} from '@/lib/auth';
import { findAdminByEmail, createOrUpdateAdmin, createTenant, createLead } from '@/lib/db';
import { checkRegistrationRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRegistrationRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many registration attempts from this IP address. Please retry in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password, companyName, accountType, website, agreedToTerms } = body;

    // 1. Mandatory Legal Terms Verification
    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the Terms of Service and acknowledge the Privacy Policy.' },
        { status: 400 }
      );
    }

    // 2. Strict Input Bounds & Schema Validation
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 255) {
      return NextResponse.json({ error: 'A valid email address (max 255 characters) is required.' }, { status: 400 });
    }

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0 || companyName.length > 100) {
      return NextResponse.json({ error: 'Store or agency name is required (max 100 characters).' }, { status: 400 });
    }

    if (website && (typeof website !== 'string' || website.length > 255)) {
      return NextResponse.json({ error: 'Website URL cannot exceed 255 characters.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length > 128) {
      return NextResponse.json({ error: 'Password is required and cannot exceed 128 characters.' }, { status: 400 });
    }

    // 3. Strict Password Entropy & Anti-Breach Validation
    const passwordEvaluation = validatePasswordStrength(password);
    if (!passwordEvaluation.valid) {
      return NextResponse.json(
        { error: passwordEvaluation.error || 'Password does not meet enterprise security criteria.' },
        { status: 400 }
      );
    }

    // 4. Email Normalization
    const cleanEmail = email.trim().toLowerCase();
    const cleanCompany = companyName.trim();
    const cleanAccountType = (accountType === 'agency' ? 'agency' : 'merchant') as 'merchant' | 'agency';

    // 5. Check for duplicate account
    const existing = await findAdminByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    // 6. Hash password with bcrypt work factor 12
    const passwordHash = await hashPassword(password);
    const isAdmin = isAllowedAdminEmail(cleanEmail);
    const userRole = isAdmin ? 'admin' : 'user';

    // 7. Create user record
    const user = await createOrUpdateAdmin({
      email: cleanEmail,
      passwordHash,
      name: cleanCompany,
      role: userRole,
    });

    // 8. Create tenant record with consistent defaults
    const tenant = await createTenant({
      email: cleanEmail,
      companyName: cleanCompany,
      planTier: 'Trial',
      accountType: cleanAccountType,
      accountPlan: cleanAccountType === 'agency' ? 'agency' : 'solo',
      subscriptionStatus: 'active trial',
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      website: website || cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    });

    // 9. Record lead for platform CRM telemetry
    await createLead({
      email: cleanEmail,
      accountType: cleanAccountType,
      website: website || cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      catalogSize: '1,000 - 5,000 SKUs',
    });

    // 10. Issue session token with session ID and tracking metadata
    const userAgent = request.headers.get('user-agent');
    const token = await createSessionToken(
      {
        email: user.email,
        role: userRole,
        name: user.name,
        id: user.id,
      },
      {
        ipAddress: clientIp,
        userAgent,
      }
    );

    const cookieHeader = getSessionCookieHeader(token, 60 * 60 * 24 * 7, request);
    const redirectUrl = isAdmin ? '/admin/dashboard' : '/dashboard?just_connected=true';

    const response = NextResponse.json({
      success: true,
      isAdmin,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
      },
      tenant: {
        id: tenant.id,
        user_id: tenant.user_id,
        company_name: tenant.company_name,
        plan_tier: tenant.plan_tier,
      },
      message: isAdmin
        ? 'Platform owner registered. Redirecting to Mission Control.'
        : 'Platform account provisioned. 14-day free trial active.',
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Registration service encountered an error. Please try again.' }, { status: 500 });
  }
}
