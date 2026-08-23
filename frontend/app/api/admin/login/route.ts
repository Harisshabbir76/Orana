import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET || "orana_admin";

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (
      email.trim().toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword
    ) {
      const res = NextResponse.json({ success: true });
      res.cookies.set("admin_auth", adminSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
