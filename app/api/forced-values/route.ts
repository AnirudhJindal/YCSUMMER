import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "../../../lib/prisma";
import { encrypt } from "../../../lib/crypto";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const forcedValues = await prisma.userForcedMaskValue.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      key: { select: { id: true, name: true } },
    },
  });

  return Response.json({
    values: forcedValues.map((fv) => ({
      id: fv.id,
      label: fv.label,
      keyId: fv.keyId,
      keyName: fv.key?.name ?? null,
      createdAt: fv.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { value, label, keyId } = await req.json();
  if (!value) return new Response("Missing value", { status: 400 });

  // validate keyId belongs to this user if provided
  if (keyId) {
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId, userId: user.id },
    });
    if (!key) return new Response("Invalid key", { status: 400 });
  }

  const token = `__FORCED_${uuidv4()}__`;

  await prisma.tokenVault.create({
    data: {
      token,
      userId: user.id,
      realValue: encrypt(value),
      type: "FORCED",
      lastUsed: new Date(),
    },
  });

  await prisma.userForcedMaskValue.create({
    data: {
      userId: user.id,
      keyId: keyId || null,
      label: label || null,
      token,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await req.json();
  if (!id) return new Response("Missing id", { status: 400 });

  const forcedValue = await prisma.userForcedMaskValue.findUnique({
    where: { id, userId: user.id },
  });

  if (!forcedValue) return new Response("Not found", { status: 404 });

  await prisma.userForcedMaskValue.delete({ where: { id } });
  await prisma.tokenVault.delete({ where: { token: forcedValue.token } });

  return Response.json({ success: true });
}