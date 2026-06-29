import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function createClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (request) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    })
  }

  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

export async function getSession(request?: NextRequest) {
  const supabase = await createClient(request)
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return null
  return session
}

export async function getUserId(request?: NextRequest): Promise<string | null> {
  const session = await getSession(request)
  return session?.user?.id ?? null
}

export interface AuthenticatedRequest {
  userId: string
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: false; response: NextResponse } | { authenticated: true; data: AuthenticatedRequest }> {
  const session = await getSession(request)
  if (!session?.user?.id) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication required. Sign in to access this resource.' },
        { status: 401 }
      ),
    }
  }
  return {
    authenticated: true,
    data: { userId: session.user.id, session },
  }
}
