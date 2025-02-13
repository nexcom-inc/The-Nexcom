// middleware.js
import { NextRequest, NextResponse } from "next/server";

export function middleware(request : NextRequest) {
  // ✅ Vérifie la présence du cookie de session Passport
  const sessionId = request.cookies.get("connect.sid");




  // ✅ Exclure les routes `/auth/*` et `/api/*`
  if (request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ Redirection si le cookie `connect.sid` n'existe pas
  if (!sessionId) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=${request.nextUrl.pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico).*)"],
}
