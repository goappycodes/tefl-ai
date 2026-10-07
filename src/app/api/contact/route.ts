import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";

/** Contact form → the existing Contact Form 7 form (id 672) via the CF7 REST API,
 *  so submissions land in the same inbox/flow as the live site. Fields mirror
 *  CF7: your-name, your-email, enquiry-type, your-message. */
const WP_BASE = process.env.WP_API_BASE || "https://tefl.ai/wp-json";
const FORM_ID = process.env.CF7_CONTACT_FORM_ID || "672";

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    enquiryType?: string;
    message?: string;
    recaptchaToken?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const enquiry = (body.enquiryType || "General enquiry").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: "Please complete all required fields." },
      { status: 422 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  const human = await verifyRecaptcha(body.recaptchaToken, "contact");
  if (!human) {
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 403 }
    );
  }

  try {
    const fd = new FormData();
    fd.append("your-name", name);
    fd.append("your-email", email);
    fd.append("enquiry-type", enquiry);
    fd.append("your-message", message);
    fd.append("_wpcf7", FORM_ID);
    fd.append("_wpcf7_version", "6.1.6");
    fd.append("_wpcf7_locale", "en_GB");
    fd.append("_wpcf7_unit_tag", `wpcf7-f${FORM_ID}-o1`);
    fd.append("_wpcf7_container_post", "0");

    const res = await fetch(
      `${WP_BASE}/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`,
      { method: "POST", body: fd }
    );
    const data = (await res.json().catch(() => ({}))) as { status?: string; message?: string };

    if (data.status === "mail_sent") {
      return NextResponse.json({ success: true, message: data.message });
    }
    return NextResponse.json(
      { success: false, error: data.message || "Message could not be sent. Please try again." },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Message could not be sent. Please email us directly." },
      { status: 502 }
    );
  }
}
