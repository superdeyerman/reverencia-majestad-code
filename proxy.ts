import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "rm_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "development-secret-change-me");

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProfessionalRoute = pathname.startsWith("/professional");
  const isHotelRoute = pathname.startsWith("/hotel");
  const isLoginPage = pathname.startsWith("/login");

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let session: { id: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload as { id: string; role: string };
    } catch {
      // expired / invalid — unauthenticated
    }
  }

  if (isAdminRoute && (!session || session.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isProfessionalRoute && (!session || session.role !== "PROFESSIONAL")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isHotelRoute && (!session || session.role !== "HOTEL_MANAGER")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoginPage && session) {
    const dest = session.role === "ADMIN" ? "/admin"
      : session.role === "PROFESSIONAL" ? "/professional/dashboard"
      : session.role === "HOTEL_MANAGER" ? "/hotel/dashboard"
      : "/";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
