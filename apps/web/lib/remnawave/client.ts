import "server-only";

const REMNAWAVE_API_URL = (
  process.env.REMNAWAVE_API_URL || "https://panel.detz.fun"
).replace(/\/$/, "");

export type RemnawaveHealth = {
  connected: boolean;
  status: string;
  database?: string;
  error?: string;
};

type RemnawaveEnvelope<T> = { response: T };

export type RemnawaveUser = {
  uuid: string;
  username: string;
  status: string;
  expireAt: string;
  trafficLimitBytes: number;
  usedTrafficBytes: number;
  subscriptionUrl: string;
  onlineAt: string | null;
};

export type RemnawaveNode = {
  uuid: string;
  name: string;
  address: string;
  port: number;
  isConnected: boolean;
  isDisabled: boolean;
  usersOnline: number;
  trafficUsedBytes: number;
  lastStatusMessage: string | null;
  countryCode: string;
};

async function remnawaveFetch<T>(path: string): Promise<T> {
  if (!process.env.REMNAWAVE_API_TOKEN) {
    throw new Error("REMNAWAVE_API_TOKEN is not configured");
  }

  const response = await fetch(`${REMNAWAVE_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${process.env.REMNAWAVE_API_TOKEN}` },
    next: { revalidate: 10 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Remnawave returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as RemnawaveEnvelope<T>;
  return data.response;
}

export async function createRemnawaveUser(input: {
  username: string;
  expireAt: string;
}) {
  if (!process.env.REMNAWAVE_API_TOKEN) {
    throw new Error("REMNAWAVE_API_TOKEN is not configured");
  }

  const squads = await remnawaveFetch<{
    internalSquads: { uuid: string; name: string }[];
  }>("/api/internal-squads");

  const response = await fetch(`${REMNAWAVE_API_URL}/api/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REMNAWAVE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      activeInternalSquads: squads.internalSquads[0]
        ? [squads.internalSquads[0].uuid]
        : [],
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Unable to create subscriber (HTTP ${response.status})`);
  }

  return (await response.json()) as RemnawaveEnvelope<RemnawaveUser>;
}

export async function getRemnawaveUsers() {
  try {
    return await remnawaveFetch<{ total: number; users: RemnawaveUser[] }>(
      "/api/users",
    );
  } catch {
    return { total: 0, users: [] };
  }
}

export async function getRemnawaveNodes() {
  try {
    return await remnawaveFetch<RemnawaveNode[]>("/api/nodes");
  } catch {
    return [];
  }
}

export async function getRemnawaveHealth(): Promise<RemnawaveHealth> {
  try {
    const response = await fetch(`${REMNAWAVE_API_URL}/api/system/health`, {
      headers: process.env.REMNAWAVE_API_TOKEN
        ? { Authorization: `Bearer ${process.env.REMNAWAVE_API_TOKEN}` }
        : undefined,
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return {
        connected: false,
        status: "Unavailable",
        error: `Remnawave returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      status?: string;
      database?: { status?: string } | string;
    };

    return {
      connected: true,
      status: data.status || "Operational",
      database:
        typeof data.database === "string"
          ? data.database
          : data.database?.status,
    };
  } catch (error) {
    return {
      connected: false,
      status: "Connecting",
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
