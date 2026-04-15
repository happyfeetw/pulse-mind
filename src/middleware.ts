import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect /admin routes - only admins
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    const role = (req.auth.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /settings - only logged in users
  if (pathname.startsWith("/settings")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/settings/:path*"],
};
