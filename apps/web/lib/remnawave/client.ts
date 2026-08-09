import "server-only";

const REMNAWAVE_API_URL = (
  process.env.REMNAWAVE_API_URL || "https://panel.detz.fun"
).replace(/\/$/, "");

export type RemnawaveHealth = {
  connected: boolean;
  status: string;
  database?: string;
  error?: string;
  metrics?: RemnawaveRuntimeMetric[];
};

export type RemnawaveRuntimeMetric = {
  instanceType: string;
  rss: number;
  heapUsed: number;
  heapTotal: number;
  eventLoopDelayMs: number;
  activeHandles: number;
  uptime: number;
};

type RemnawaveEnvelope<T> = { response: T };

export type RemnawaveUser = {
  uuid: string;
  username: string;
  status: string;
  expireAt: string;
  trafficLimitBytes: number;
  usedTrafficBytes: number | null;
  trafficLimitStrategy: string;
  hwidDeviceLimit: number | null;
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

export type RemnawaveHost = {
  uuid: string;
  remark: string;
  address: string;
  port: number | null;
  isDisabled: boolean;
  isHidden: boolean;
  securityLayer: string | null;
  nodes: { uuid: string; name: string }[];
};

export type RemnawaveConfigProfile = {
  uuid: string;
  name: string;
  inbounds: unknown[];
  nodes: unknown[];
  updatedAt: string;
};

export type RemnawaveSquad = {
  uuid: string;
  name: string;
  info: string | null;
  inbounds: unknown[];
  updatedAt: string;
};

export type RemnawaveSubscriptionTemplate = {
  uuid: string;
  name: string;
  templateType: string;
  viewPosition: number;
};

export type RemnawaveSubscriptionSettings = {
  uuid: string;
  randomizeHosts: boolean;
  isShowCustomRemarks: boolean;
  serveJsonAtBaseSubscription: boolean;
  updatedAt: string;
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
  trafficLimitBytes?: number;
  trafficLimitStrategy?: "NO_RESET" | "DAY" | "WEEK" | "MONTH";
  hwidDeviceLimit?: number;
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

export async function getRemnawaveHosts() {
  try {
    return await remnawaveFetch<RemnawaveHost[]>("/api/hosts");
  } catch {
    return [];
  }
}

export async function getRemnawaveConfigProfiles() {
  try {
    return await remnawaveFetch<{
      total: number;
      configProfiles: RemnawaveConfigProfile[];
    }>("/api/config-profiles");
  } catch {
    return { total: 0, configProfiles: [] };
  }
}

export async function getRemnawaveSquads() {
  try {
    return await remnawaveFetch<{
      total: number;
      internalSquads: RemnawaveSquad[];
    }>("/api/internal-squads");
  } catch {
    return { total: 0, internalSquads: [] };
  }
}

export async function getRemnawaveSubscriptionTemplates() {
  try {
    return await remnawaveFetch<{
      total: number;
      templates: RemnawaveSubscriptionTemplate[];
    }>("/api/subscription-templates");
  } catch {
    return { total: 0, templates: [] };
  }
}

export async function getRemnawaveSubscriptionSettings() {
  try {
    return await remnawaveFetch<RemnawaveSubscriptionSettings>(
      "/api/subscription-settings",
    );
  } catch {
    return null;
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
      response?: { runtimeMetrics?: RemnawaveRuntimeMetric[] };
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
      metrics: data.response?.runtimeMetrics || [],
    };
  } catch (error) {
    return {
      connected: false,
      status: "Connecting",
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
