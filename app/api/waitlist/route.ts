import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    if (error) {
      console.error("SUPABASE ERROR:", error); // 🔥 log real issue

      if (error.code === "23505") {
        return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "Server crash" }, { status: 500 });
  }
}