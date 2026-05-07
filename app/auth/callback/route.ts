import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabse/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);

  const code =
    requestUrl.searchParams.get("code");

  const supabase =
    await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(
      code
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const existingUser =
      await prisma.user.findUnique({
        where: {
          supabaseId: user.id,
        },
      });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          supabaseId: user.id,

          email: user.email,
        },
      });
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/dashboard`
  );
}