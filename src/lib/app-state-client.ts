import { normalizeAppStateKeys, type AppStateEntry } from "./app-state";

const APP_STATE_API_PATH = "/api/app-state";

function toRequestError(message: string): Error {
  return new Error(message || "App state request failed.");
}

export async function readAppState(
  keys: string[]
): Promise<Record<string, unknown>> {
  const normalizedKeys = normalizeAppStateKeys(keys);

  if (normalizedKeys.length === 0) {
    return {};
  }

  const params = new URLSearchParams();
  normalizedKeys.forEach((key) => params.append("key", key));

  const response = await fetch(`${APP_STATE_API_PATH}?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({ values: {} }))) as {
    error?: string;
    values?: Record<string, unknown>;
  };

  if (!response.ok) {
    throw toRequestError(payload.error || "Failed to load app state.");
  }

  return payload.values ?? {};
}

export async function writeAppState(entries: AppStateEntry[]): Promise<void> {
  const normalizedEntries = entries
    .map((entry) => ({
      key: entry.key.trim(),
      value: entry.value,
    }))
    .filter((entry) => normalizeAppStateKeys([entry.key]).length > 0);

  if (normalizedEntries.length === 0) {
    return;
  }

  const response = await fetch(APP_STATE_API_PATH, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ entries: normalizedEntries }),
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({ error: undefined }))) as {
      error?: string;
    };
    throw toRequestError(payload.error || "Failed to save app state.");
  }
}

export async function deleteAppState(keys: string[]): Promise<void> {
  const normalizedKeys = normalizeAppStateKeys(keys);

  if (normalizedKeys.length === 0) {
    return;
  }

  const response = await fetch(APP_STATE_API_PATH, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ keys: normalizedKeys }),
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({ error: undefined }))) as {
      error?: string;
    };
    throw toRequestError(payload.error || "Failed to delete app state.");
  }
}
