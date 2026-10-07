import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Certificate verification. Proxies to a read-only WordPress REST endpoint
 *  (teflai/v1/verify-certificate) that wraps the existing LearnDash
 *  verification logic. Certificate format: TEFL-YYYY-XXXXX. */
const WP_BASE = process.env.WP_API_BASE || "https://tefl.ai/wp-json";
const VERIFY_URL = process.env.CERT_VERIFY_URL || `${WP_BASE}/teflai/v1/verify-certificate`;

export async function POST(request: NextRequest) {
  let number = "";
  try {
    const body = (await request.json()) as { certificateNumber?: string };
    number = (body.certificateNumber || "").trim();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  if (!number) {
    return NextResponse.json(
      { success: false, error: "Please enter a certificate number." },
      { status: 422 }
    );
  }

  try {
    const res = await fetch(`${VERIFY_URL}?number=${encodeURIComponent(number)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const data = (await res.json()) as {
        verified?: boolean;
        student_name?: string;
        course_title?: string;
        issue_date?: string;
        certificate_number?: string;
      };
      if (data.verified) {
        return NextResponse.json({
          success: true,
          data: {
            studentName: data.student_name || "N/A",
            courseTitle: data.course_title || "N/A",
            issueDate: data.issue_date || "N/A",
            certificateNumber: data.certificate_number || number,
          },
        });
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: "Certificate not found. Please check the number and try again.",
      },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification is temporarily unavailable. Please try again later." },
      { status: 502 }
    );
  }
}
