import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth");
  const secret = process.env.ADMIN_SECRET || "orana_admin";
  if (!token || token.value !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ secret });
}
