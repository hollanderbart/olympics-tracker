const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled_v1";
const DEDUPE_STORAGE_PREFIX = "notif_sent_v1:";

const inMemorySent = new Set<string>();

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures.
  }
}

export function supportsNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationsEnabled(): boolean {
  return safeLocalStorageGet(NOTIFICATIONS_ENABLED_KEY) === "true";
}

export function setNotificationsEnabled(enabled: boolean): void {
  safeLocalStorageSet(NOTIFICATIONS_ENABLED_KEY, enabled ? "true" : "false");
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) return "denied";
  return Notification.requestPermission();
}

function isDuplicate(dedupeKey: string): boolean {
  if (inMemorySent.has(dedupeKey)) return true;
  return safeLocalStorageGet(`${DEDUPE_STORAGE_PREFIX}${dedupeKey}`) === "1";
}

function markSent(dedupeKey: string): void {
  inMemorySent.add(dedupeKey);
  safeLocalStorageSet(`${DEDUPE_STORAGE_PREFIX}${dedupeKey}`, "1");
}

export function sendNotification(
  title: string,
  options: NotificationOptions,
  dedupeKey: string
): boolean {
  if (!supportsNotifications()) return false;
  if (Notification.permission !== "granted") return false;
  if (!getNotificationsEnabled()) return false;
  if (isDuplicate(dedupeKey)) return false;

  new Notification(title, options);
  markSent(dedupeKey);
  return true;
}

export function sendTestNotification(): boolean {
  const timestamp = new Date().toLocaleTimeString("nl-NL");
  return sendNotification(
    "Team NL testmelding",
    {
      body: `Dit is een testmelding (${timestamp}).`,
    },
    `notif_test_${Date.now()}`
  );
}
