import { prisma } from "@/lib/prisma";
import { getRemnawaveHealth } from "@/lib/remnawave/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REQUIRED_ENVIRONMENT = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "REMNAWAVE_API_TOKEN",
  "REMNAWAVE_API_URL",
  "RESEND_API_KEY",
  "UPSTASH_REDIS_REST_TOKEN",
  "UPSTASH_REDIS_REST_URL",
] as const;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const missingEnvironment = REQUIRED_ENVIRONMENT.filter(
    (key) => !process.env[key],
  );
  let database = false;
  let databaseError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    databaseError =
      error instanceof Error
        ? error.message.slice(0, 240)
        : "Connection failed";
  }

  const remnawave = await getRemnawaveHealth();
  const ready =
    missingEnvironment.length === 0 && database && remnawave.connected;

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      checks: {
        environment: {
          ready: missingEnvironment.length === 0,
          missing: missingEnvironment,
        },
        database: { ready: database, error: databaseError },
        remnawave: {
          ready: remnawave.connected,
          status: remnawave.status,
          database: remnawave.database,
          error: remnawave.error,
        },
      },
    },
    { status: ready ? 200 : 503 },
  );
}
