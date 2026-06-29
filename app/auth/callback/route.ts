import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/ask'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=no-code`)
  }

  // Let the client-side SDK (createBrowserClient from @supabase/ssr) handle the
  // PKCE code exchange. It stores the session in cookies which the server-side
  // createServerClient can read on subsequent API requests.
  const redirectUrl = new URL(`${origin}${next}`)
  redirectUrl.searchParams.set('code', code)
  return NextResponse.redirect(redirectUrl)
}
