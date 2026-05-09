import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "../../../lib/prisma";
import { encrypt } from "../../../lib/crypto";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

function hashValue(val: string) {
  return crypto.createHash("sha256").update(val).digest("hex");
}

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

  if (keyId) {
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId, userId: user.id },
    });
    if (!key) return new Response("Invalid key", { status: 400 });
  }

  const token = `__FORCED_${uuidv4()}__`;
  const valueHash = hashValue(value);

  const existing = await prisma.tokenVault.findFirst({
    where: { userId: user.id, valueHash },
  });

  if (existing) {
    await prisma.tokenVault.update({
      where: { id: existing.id },
      data: { lastUsed: new Date() },
    });
  } else {
    await prisma.tokenVault.create({
      data: {
        token,
        userId: user.id,
        realValue: encrypt(value),
        valueHash,
        type: "FORCED",
        lastUsed: new Date(),
      },
    });
  }

  await prisma.userForcedMaskValue.create({
    data: {
      userId: user.id,
      keyId: keyId || null,
      label: label || null,
      token: existing ? existing.token : token,
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

  // Only delete vault entry if no other forced values reference the same token
  const otherRefs = await prisma.userForcedMaskValue.count({
    where: { token: forcedValue.token },
  });

  if (otherRefs === 0) {
    await prisma.tokenVault.deleteMany({ where: { token: forcedValue.token } });
  }

  return Response.json({ success: true });
}