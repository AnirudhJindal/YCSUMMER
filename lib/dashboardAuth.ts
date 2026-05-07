import { prisma } from "@/lib/prisma";

import { createClient }
from "@/lib/supabse/server";

export async function getDashboardUser() {
  const supabase =
    await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const dbUser =
    await prisma.user.findUnique({
      where: {
        supabaseId: user.id,
      },
    });

  return dbUser;
}