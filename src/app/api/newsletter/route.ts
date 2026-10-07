import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Footer newsletter → MailerLite. Proxies to the same MailerLite form the live
 *  site uses (account 995100), so no API key is required. If MAILERLITE_API_KEY
 *  is set, the official API is used instead. */
const MAILERLITE_FORM_URL =
  process.env.MAILERLITE_FORM_URL ||
  "https://assets.mailerlite.com/jsonp/995100/forms/194792070698763427/subscribe";

export async function POST(request: NextRequest) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email || "").trim();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "Invalid email" }, { status: 422 });
  }

  // Preferred: official MailerLite API when a key is configured.
  if (process.env.MAILERLITE_API_KEY) {
    try {
      const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          groups: process.env.MAILERLITE_GROUP_ID ? [process.env.MAILERLITE_GROUP_ID] : undefined,
        }),
      });
      return NextResponse.json({ success: res.ok });
    } catch {
      return NextResponse.json({ success: false }, { status: 502 });
    }
  }

  // Fallback: the embedded MailerLite form endpoint (mirrors the live site).
  try {
    const fd = new URLSearchParams();
    fd.append("fields[email]", email);
    fd.append("ml-submit", "1");
    fd.append("anticsrf", "true");
    const res = await fetch(MAILERLITE_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return NextResponse.json({ success: data.success !== false });
  } catch {
    return NextResponse.json({ success: false }, { status: 502 });
  }
}
