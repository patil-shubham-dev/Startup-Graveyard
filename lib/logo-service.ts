/**
 * Logo acquisition service for Startup Graveyard.
 *
 * Tier 1: Clearbit Logo API (free, no key needed)
 * Tier 2: Alternative domain variations
 * Tier 3: Returns null → UI shows "Logo Not Found" placeholder
 */

// Common domain patterns to try for a given company name
function deriveDomains(companyName: string): string[] {
  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '')  // strip special chars
    .replace(/\.com$/i, '')        // strip .com if already present
    .trim();

  // Already a domain? (e.g. "better.com")
  if (companyName.includes('.') && !companyName.endsWith('.')) {
    const asIs = companyName.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    return [asIs, `www.${asIs}`];
  }

  // Common TLDs to try
  const tlds = ['.com', '.io', '.ai', '.co', '.org', '.net'];
  const domains = tlds.map((tld) => `${base}${tld}`);

  // Handle multi-word names (remove spaces, try both joined and dashed)
  const withSpaces = companyName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (withSpaces.includes(' ')) {
    const joined = withSpaces.replace(/\s+/g, '');
    const dashed = withSpaces.replace(/\s+/g, '-');
    for (const variant of [joined, dashed]) {
      tlds.forEach((tld) => domains.push(`${variant}${tld}`));
    }
  }

  // Deduplicate
  return [...new Set(domains)];
}

const CLEARBIT_URL = 'https://logo.clearbit.com';

// Clearbit serves a gray "logo not found" placeholder SVG (small body) for
// unknown domains — content-type alone is not proof of a real logo.
const MIN_IMAGE_BYTES = 1024;

function isValidLogoUrl(url: string): boolean {
  return url.startsWith('https://') && !url.includes(' ')
    && /^https:\/\/[a-z0-9.-]+(\.[a-z]{2,})/i.test(url);
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch {
    return null;
  }
}

async function verifyImageResponse(url: string): Promise<boolean> {
  if (!isValidLogoUrl(url)) return false;

  // Single GET (HEAD often 405s on logo hosts), then validate the
  // content-type and that the body is not a trivial placeholder.
  const getResponse = await fetchWithTimeout(url);
  if (!getResponse?.ok) return false;

  const contentType = getResponse.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    return false;
  }

  const contentLength = Number(getResponse.headers.get('content-length') || 0);
  if (contentLength > 0 && contentLength < MIN_IMAGE_BYTES) {
    return false; // looks like a placeholder/empty payload
  }

  return true;
}

async function checkClearbit(domain: string): Promise<string | null> {
  // Request specific size to avoid oversized logos
  const url = `${CLEARBIT_URL}/${domain}?size=256`;
  const valid = await verifyImageResponse(url);
  if (valid) return url;
  return null;
}

/** Also try Google favicons service as a fallback */
async function checkGoogleFavicons(domain: string): Promise<string | null> {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const valid = await verifyImageResponse(url);
  if (valid) return url;
  return null;
}

/**
 * Attempt to find a logo URL for the given company name.
 * Returns a Clearbit URL if found, or null to use the placeholder.
 */
export async function acquireLogoUrl(companyName: string): Promise<string | null> {
  const domains = deriveDomains(companyName);

  // Tier 1 & 2: Try all domains against Clearbit
  for (const domain of domains) {
    const logoUrl = await checkClearbit(domain);
    if (logoUrl) return logoUrl;
  }

  // Tier 3: Try Google favicons as a light web-search fallback
  for (const domain of domains) {
    const faviconUrl = await checkGoogleFavicons(domain);
    if (faviconUrl) return faviconUrl;
  }

  // Tier 4: No logo found
  return null;
}
