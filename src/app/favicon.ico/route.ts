import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const setting = await Setting.findOne({ key: "brand_favicon" }).lean();
    const favicon = String(setting?.value || "");

    if (favicon) {
      return NextResponse.redirect(favicon, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  } catch {
    // Use the inline fallback below if settings are unavailable.
  }

  return new NextResponse(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0A0A0F"/><text x="32" y="42" text-anchor="middle" font-family="serif" font-size="34" font-weight="700" fill="#f59e0b">V</text></svg>',
    {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
