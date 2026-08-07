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
  // First do a HEAD to check availability
  const headResponse = await fetchWithTimeout(url);
  if (!headResponse?.ok) return false;

  // Then do a lightweight GET to verify content type
  // We only read headers, not the body, to keep it fast
  const getResponse = await fetchWithTimeout(url);
  if (!getResponse?.ok) return false;

  const contentType = getResponse.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    return false;
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
