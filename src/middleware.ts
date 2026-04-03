import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // any custom logic
  },
  {
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (auth page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}
