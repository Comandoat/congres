import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { player_name, score, correct_answers, total_questions } = body;

    // Validate input
    if (
      typeof player_name !== "string" ||
      typeof score !== "number" ||
      typeof correct_answers !== "number" ||
      typeof total_questions !== "number" ||
      !player_name.trim()
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { error } = await supabase.from("scores").insert({
      player_name: player_name.trim(),
      score,
      correct_answers,
      total_questions,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
