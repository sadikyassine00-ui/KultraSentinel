/**
 * Google Merchant Center Error Translation Engine
 * Translates raw Google Content API / Merchant API issue codes into human-readable English
 * with clear root cause explanations, actionable guidance, and account-level suspension classification.
 */

export interface StoreTrustChecklist {
  businessTransparency: string;
  legalPages: string;
  paymentAndDomainIntegrity: string;
  gmcVerification: string;
}

export interface TranslatedIssue {
  title: string;
  explanation: string;
  fixAdvice: string;
  category: 'account_suspension' | 'barcode' | 'pricing' | 'inventory' | 'image' | 'policy' | 'shipping' | 'data_feed' | 'general';
  isAccountLevel?: boolean;
  isUndocumented?: boolean;
  documentationUrl?: string;
  storeTrustChecklist?: StoreTrustChecklist;
}

/**
 * Detects whether a Google Merchant Center issue code indicates a store-wide account suspension
 * rather than a single-product copy or attribute defect.
 */
export function isAccountSuspensionCode(issueCode: string): boolean {
  const code = (issueCode || '').toLowerCase().trim();
  return (
    code.includes('policy_enforcement_account_disapproval') ||
    code.includes('account_disapproval') ||
    code.includes('account_suspended') ||
    code.includes('account_level_issue') ||
    code.includes('misrepresentation') ||
    code.includes('untrusted_store') ||
    code.includes('unacceptable_business_practices') ||
    code.includes('coordinated_inauthentic_behavior') ||
    code.includes('site_needs_improvement') ||
    code.includes('counterfeit') ||
    code.includes('malicious_software') ||
    code.startsWith('account_')
  );
}

export function translateGmcIssue(issueCode: string): TranslatedIssue {
  const rawCode = (issueCode || '').trim();
  const code = rawCode.toLowerCase();

  // 1. Account-Level Suspensions (Store-Wide Blocks)
  // CRITICAL: Must be evaluated before general 'policy' or attribute rules.
  // Never advise editing product titles, descriptions, or images for account suspensions.
  if (isAccountSuspensionCode(code)) {
    return {
      title: 'Account-Level Policy Suspension (Store-Wide)',
      explanation: 'Google has paused ad delivery across all products in your catalog due to store-level policy enforcement (such as Misrepresentation or Untrusted Store). This is NOT an isolated product copy or image defect.',
      fixAdvice: 'Do not edit individual product titles, descriptions, or images. Complete Google’s 4 store trust requirements (Business Transparency, Legal Pages, Payment & Domain Integrity, and GMC Verification), then request an account review in Google Merchant Center.',
      category: 'account_suspension',
      isAccountLevel: true,
      documentationUrl: 'https://support.google.com/merchants/answer/2947246',
      storeTrustChecklist: {
        businessTransparency: 'Business Transparency: Add a valid physical address, direct support email, and operational phone number to your website footer and GMC business settings.',
        legalPages: 'Legal Pages: Provide clearly visible Refund and Return Policy, Shipping Policy, Privacy Policy, and Terms of Service links in your website navigation.',
        paymentAndDomainIntegrity: 'Payment and Domain Integrity: Ensure checkout is secured with an active SSL certificate and all prices and currencies on the site match your GMC feed settings exactly.',
        gmcVerification: 'GMC Verification: Ensure domain is verified and claimed in Google Merchant Center Business Information settings.',
      },
    };
  }

  // 2. Barcodes / GTIN / UPC / EAN / ISBN
  if (
    code.includes('gtin') ||
    code.includes('barcode') ||
    code.includes('missing_required_attribute [gtin]') ||
    code.includes('invalid_gtin') ||
    code.includes('upc') ||
    code.includes('ean') ||
    code.includes('isbn')
  ) {
    return {
      title: 'Missing GTIN or Barcode',
      explanation: 'Google requires an authentic UPC, EAN, or ISBN (valid 12- or 14-digit GTIN, UPC, or EAN) for branded products to serve in Google Shopping ads.',
      fixAdvice: 'Add the authentic 12- or 14-digit barcode (GTIN, UPC, EAN, or ISBN) to this product in your Shopify admin or product feed catalog.',
      category: 'barcode',
      documentationUrl: 'https://support.google.com/merchants/answer/6324461',
    };
  }

  // 3. Promotional Watermark or Image Resolution
  if (
    code.includes('watermark') ||
    code.includes('promotional_overlay') ||
    code.includes('image_link') ||
    code.includes('image') ||
    code.includes('photo') ||
    code.includes('thumbnail') ||
    code.includes('resolution')
  ) {
    return {
      title: 'Promotional Watermark or Image Resolution',
      explanation: 'Google rejected the primary image due to overlaid text, promotional badges, or resolution under 800x800 pixels.',
      fixAdvice: 'Upload a clean, high-resolution product image (minimum 800x800 pixels) free of promotional badges, watermarks, or text overlays.',
      category: 'image',
      documentationUrl: 'https://support.google.com/merchants/answer/6324350',
    };
  }

  // 4. Price or Availability Mismatch
  if (
    code.includes('price_mismatch') ||
    code.includes('incorrect_price') ||
    code.includes('price') ||
    code.includes('availability') ||
    code.includes('stock') ||
    code.includes('out_of_stock') ||
    code.includes('availability_mismatch')
  ) {
    return {
      title: 'Price or Availability Mismatch',
      explanation: 'The price or in-stock status scraped from the store landing page differs from the feed data submitted to Google (landing page does not match feed data).',
      fixAdvice: 'Update your product feed to match the current on-page price and inventory status, or review automated schema markup.',
      category: 'pricing',
      documentationUrl: 'https://support.google.com/merchants/answer/6069143',
    };
  }

  // 5. Missing Shipping or Tax Attributes
  if (code.includes('shipping') || code.includes('tax') || code.includes('missing_shipping') || code.includes('delivery')) {
    return {
      title: 'Missing Shipping or Tax Attributes',
      explanation: 'Google rejected the listing because target country shipping rates or tax attributes are undefined.',
      fixAdvice: 'Configure target country shipping rates and tax settings in Google Merchant Center or your product feed.',
      category: 'shipping',
      documentationUrl: 'https://support.google.com/merchants/answer/6324484',
    };
  }

  // 6. Title / Description Formatting
  if (code.includes('title') || code.includes('description') || code.includes('all_caps')) {
    return {
      title: 'Title or Description Formatting',
      explanation: 'Google rejected the product title or description due to excessive capitalization, promotional gimmicks, or invalid characters.',
      fixAdvice: 'Edit the product title to standard sentence case without promotional phrases like "FREE SHIPPING".',
      category: 'data_feed',
      documentationUrl: 'https://support.google.com/merchants/answer/6324415',
    };
  }

  // 7. SKU-Specific Policy Violation (Item-level, NOT account-level)
  if (code.includes('restricted') || code.includes('unsupported') || code.includes('prohibited') || code.includes('policy')) {
    return {
      title: 'Google Shopping Policy Violation',
      explanation: 'This product was flagged under Google Shopping policy rules (e.g. prohibited claims, restricted terms, or sensitive items).',
      fixAdvice: 'Review this product’s title, description, and landing page to remove flagged terminology or claims.',
      category: 'policy',
      documentationUrl: 'https://support.google.com/merchants/answer/6149970',
    };
  }

  // 8. Translation Guardrail: Unrecognized or Undocumented Policy Error
  // Never guess or speculate on unknown errors.
  const cleanCode = rawCode
    .replace(/^item_disapproved:\s*/i, '')
    .replace(/_/g, ' ')
    .trim();

  return {
    title: `Google Policy: ${cleanCode || 'Diagnostics Flag'}`,
    explanation: `Google crawler flagged this listing with error code "${cleanCode || rawCode}". Google has paused ad delivery for this listing.`,
    fixAdvice: 'Inspect the Diagnostics tab in Google Merchant Center for official field-level policy guidance. Do not guess or apply unverified edits.',
    category: 'general',
    isUndocumented: true,
    documentationUrl: 'https://merchants.google.com/mc/products/diagnostics',
  };
}

/**
 * Extracts authentic product metadata from GMC incident details
 */
export function extractProductMeta(sku: string, title?: string, details?: Record<string, unknown> | null) {
  const price = (details?.price as string) || null;
  const variant = (details?.variant as string) || (details?.color ? `${details.color}${details.size ? ` / ${details.size}` : ''}` : null);
  const thumbnailUrl = (details?.image_url as string) || (details?.thumbnail as string) || null;

  return {
    price,
    variant,
    thumbnailUrl,
  };
}

