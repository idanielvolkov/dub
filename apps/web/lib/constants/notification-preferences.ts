// User-level notification preferences for email communications
export const NOTIFICATION_PREFERENCE_TYPES = [
  "dubLinks", // VPN operations updates
  "dubPartners", // Business and growth updates
  "partnerAccount", // Workspace membership updates
] as const;

export type NotificationPreferenceType =
  (typeof NOTIFICATION_PREFERENCE_TYPES)[number];

// Mapping from preference type to UserNotificationPreferences schema field names
// (1:1 mapping since we're using the same names as the schema)
export const NOTIFICATION_PREFERENCE_FIELD_MAP: Record<
  NotificationPreferenceType,
  "dubLinks" | "dubPartners" | "partnerAccount"
> = {
  dubLinks: "dubLinks",
  dubPartners: "dubPartners",
  partnerAccount: "partnerAccount",
};

// Default all preferences to true (opted in)
export const DEFAULT_NOTIFICATION_PREFERENCES: Record<
  NotificationPreferenceType,
  boolean
> = {
  dubLinks: true,
  dubPartners: true,
  partnerAccount: true,
};

export const NOTIFICATION_PREFERENCE_LABELS: Record<
  NotificationPreferenceType,
  { title: string; description: string; link: string }
> = {
  dubLinks: {
    title: "VPN Operations",
    description: "Remnawave, node, subscription, and service updates",
    link: "https://app.detz.fun",
  },
  dubPartners: {
    title: "Business & Growth",
    description: "Business, billing, campaign, and growth workspace updates",
    link: "https://app.detz.fun",
  },
  partnerAccount: {
    title: "Workspace Account",
    description: "Workspace invitations, access changes, and account notices",
    link: "https://app.detz.fun/account/settings",
  },
};
