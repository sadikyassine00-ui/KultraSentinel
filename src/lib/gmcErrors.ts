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
  if (code.includes('gtin') || code.includes('barcode') || code.includes('missing_required_attribute [gtin]')) {
    return {
      title: 'Missing Barcode (GTIN / UPC)',
      explanation: 'Google requires a valid GTIN or UPC for branded products to match them across search results.',
      fixAdvice: 'Add the 12- or 14-digit barcode (GTIN/UPC/EAN) in your product catalog or Shopify admin.',
      category: 'barcode',
    };
  }

  // 2. Pricing Mismatch
  if (code.includes('price_mismatch') || code.includes('incorrect_price') || code.includes('price')) {
    return {
      title: 'Price Mismatch Detected',
      explanation: 'The price in your Google Shopping feed does not match the price shown on your checkout or landing page.',
      fixAdvice: 'Update your product feed to reflect the current on-site price or check currency conversion settings.',
      category: 'pricing',
    };
  }

  // 3. Stock / Availability Mismatch
  if (code.includes('availability') || code.includes('stock') || code.includes('out_of_stock')) {
    return {
      title: 'Stock Status Mismatch',
      explanation: 'Your product is marked out of stock on your website but is still listed as available in Google Merchant Center.',
      fixAdvice: 'Sync inventory levels from your Shopify or eCommerce platform to update Google availability.',
      category: 'inventory',
    };
  }

  // 4. Image Quality / Broken Link
  if (code.includes('image') || code.includes('photo') || code.includes('thumbnail')) {
    return {
      title: 'Product Image Issue',
      explanation: 'Google crawler could not access the product image URL, or the image violates resolution/watermark guidelines.',
      fixAdvice: 'Ensure the image URL is publicly accessible, at least 800x800px, and free of promotional watermarks.',
      category: 'image',
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

  // 6. Shipping / Tax Calculation
  if (code.includes('shipping') || code.includes('tax') || code.includes('delivery')) {
    return {
      title: 'Shipping Rate Mismatch',
      explanation: 'The shipping cost provided in your feed does not match what the Google crawler observed during checkout.',
      fixAdvice: 'Review shipping settings in Merchant Center to align delivery rates with your store checkout.',
      category: 'shipping',
    };
  }

  // 7. Title / Description Formatting
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
