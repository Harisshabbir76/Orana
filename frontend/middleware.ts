import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get("admin_auth");
  const secret = process.env.ADMIN_SECRET || "orana_admin";

  if (!cookie || cookie.value !== secret) {
    const url = req.nextUrl.clone();
    url.pathname = "/orana/admin-panel";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orana/admin-panel/:path+"],
};
