import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  let next = searchParams.get('next') ?? '/ask'

  // Handle auth errors from Supabase (e.g. user cancelled, expired link)
  if (error) {
    const reason = errorDescription || error
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(reason)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=no-code`)
  }

  // Prevent open redirect: only allow relative paths
  if (!next.startsWith('/')) {
    next = '/ask'
  }

  // Let the client-side SDK (createBrowserClient from @supabase/ssr) handle the
  // PKCE code exchange. It stores the session in cookies which the server-side
  // createServerClient can read on subsequent API requests.
  const redirectUrl = new URL(`${origin}${next}`)
  redirectUrl.searchParams.set('code', code)
  return NextResponse.redirect(redirectUrl)
}
