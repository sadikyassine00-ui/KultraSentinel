/**
 * Google Merchant Center Error Translation Engine
 * Translates raw Google Content API / Merchant API issue codes into human-readable English
 * with clear root cause explanations and actionable guidance.
 */

export interface TranslatedIssue {
  title: string;
  explanation: string;
  fixAdvice: string;
  category: 'barcode' | 'pricing' | 'inventory' | 'image' | 'policy' | 'shipping' | 'data_feed' | 'general';
}

export function translateGmcIssue(issueCode: string): TranslatedIssue {
  const code = (issueCode || '').toLowerCase().trim();

  // 1. Barcodes / GTIN / UPC
  if (code.includes('gtin') || code.includes('barcode') || code.includes('missing_required_attribute [gtin]') || code.includes('invalid_gtin') || code.includes('upc') || code.includes('ean')) {
    return {
      title: 'Missing Barcode (GTIN / UPC)',
      explanation: 'Google requires a valid 12- or 14-digit GTIN, UPC, or EAN for branded products to serve in Google Shopping ads.',
      fixAdvice: 'Add the valid 12- or 14-digit barcode (GTIN, UPC, or EAN) in your Shopify admin or product feed data.',
      category: 'barcode',
    };
  }

  // 2. Promotional Watermark or Image Crawl Errors
  if (code.includes('watermark') || code.includes('promotional_overlay') || code.includes('image_link') || code.includes('image') || code.includes('photo') || code.includes('thumbnail') || code.includes('resolution')) {
    return {
      title: 'Promotional Watermark or Image Crawl Error',
      explanation: 'The product image was rejected due to text overlays, promotional logos, watermarks, or resolution lower than 800x800 pixels.',
      fixAdvice: 'Upload a clean, high-resolution product image (minimum 800x800px) free of promotional text overlays or watermarks.',
      category: 'image',
    };
  }

  // 3. Price or Availability Mismatch
  if (code.includes('price_mismatch') || code.includes('incorrect_price') || code.includes('price') || code.includes('availability') || code.includes('stock') || code.includes('out_of_stock') || code.includes('availability_mismatch')) {
    return {
      title: 'Price or Availability Mismatch',
      explanation: 'The price or in-stock status on the landing page does not match the feed data submitted to Google.',
      fixAdvice: 'Update your product feed to match the current on-page price and inventory status, or review automated schema markup.',
      category: 'pricing',
    };
  }

  // 4. Missing Shipping or Tax Attributes
  if (code.includes('shipping') || code.includes('tax') || code.includes('missing_shipping') || code.includes('delivery')) {
    return {
      title: 'Missing Shipping or Tax Attributes',
      explanation: 'Google rejected the listing because target country shipping rates or tax attributes are undefined.',
      fixAdvice: 'Configure target country shipping rates and tax settings in Google Merchant Center or your product feed.',
      category: 'shipping',
    };
  }

  // 5. Google Shopping Policy Violation
  if (code.includes('policy') || code.includes('restricted') || code.includes('unsupported') || code.includes('prohibited')) {
    return {
      title: 'Google Policy Violation',
      explanation: 'This product was flagged under Google Shopping policy rules (e.g. prohibited claims, restricted terms, or medical references).',
      fixAdvice: 'Review product title, description, and landing page to remove flagged terminology.',
      category: 'policy',
    };
  }

  // 6. Title / Description Formatting
  if (code.includes('title') || code.includes('description') || code.includes('all_caps')) {
    return {
      title: 'Title or Description Formatting',
      explanation: 'Google rejected the product title or description due to excessive capitalization, promotional gimmicks, or invalid characters.',
      fixAdvice: 'Edit the product title to standard sentence case without promotional phrases like "FREE SHIPPING".',
      category: 'data_feed',
    };
  }

  // Default fallback
  const cleanCode = issueCode.replace(/^item_disapproved:\s*/i, '').replace(/_/g, ' ');
  return {
    title: 'Policy Disapproval',
    explanation: `Google crawler flagged this SKU: "${cleanCode}". Ads for this product are currently paused.`,
    fixAdvice: 'Inspect product diagnostics in Google Merchant Center to view the exact field requiring updates.',
    category: 'general',
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
