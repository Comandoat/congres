import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Handle both application/json and text/plain (sendBeacon sometimes sends text/plain)
    let body: Record<string, unknown>;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // sendBeacon may send as text/plain — parse the raw text as JSON
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { player_name, score, correct_answers, total_questions } = body;

    // Validate input
    if (
      typeof player_name !== "string" ||
      typeof score !== "number" ||
      typeof correct_answers !== "number" ||
      typeof total_questions !== "number" ||
      !player_name.trim()
    ) {
      console.error("Invalid data received:", JSON.stringify(body));
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { data, error } = await supabase.from("scores").insert({
      player_name: player_name.trim(),
      score,
      correct_answers,
      total_questions,
    }).select();

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Score saved successfully:", JSON.stringify(data));
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("API error:", e instanceof Error ? e.message : String(e));
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
