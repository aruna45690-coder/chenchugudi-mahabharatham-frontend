import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.statusText}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stats from backend:", error);
    return NextResponse.json({ error: "Failed to fetch stats from backend" }, { status: 500 });
  }
}
