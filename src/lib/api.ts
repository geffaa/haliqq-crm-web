const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include", // send/receive the httpOnly session cookie
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type User = { id: string; name: string; email: string };
export type Workspace = { id: string; name: string; industry: string; role: string; arr: number; openDeals: number };

export type Stage = { id: string; label: string; position: number; prob: number; kind: "open" | "won" | "lost" };
export type Source = { id: string; label: string; marketing: boolean; position: number };

export type Account = {
  id: string;
  name: string;
  segment: string;
  arr: number;
  health: number;
  lifecycle: "Prospect" | "Customer" | "Lost" | "Churned";
  renewalDate: string | null;
  ownerId: string | null;
};
export type AccountInput = Omit<Account, "id">;

export type Contact = {
  id: string;
  accountId: string | null;
  name: string;
  role: string;
  email: string;
  phone: string;
  note: string;
};
export type ContactInput = Omit<Contact, "id">;

export type Rep = { id: string; name: string; role: string; quota: number; since: string | null };
export type RepInput = Omit<Rep, "id">;

export type Deal = {
  id: string;
  accountId: string | null;
  contactId: string | null;
  ownerId: string | null;
  title: string;
  value: number;
  stageId: string;
  closeDate: string | null;
  sourceId: string | null;
  scope: string;
  note: string;
  lostReason: string | null;
  createdAt: string;
  stageSince: string;
};
export type DealInput = Omit<Deal, "id" | "createdAt" | "stageSince">;

// CRUD helper: builds list/create/update/delete calls for one workspace-scoped
// entity so each resource below is a one-liner instead of four repeats.
function crud<T, TInput>(resource: string) {
  const base = (wsId: string) => `/workspaces/${wsId}/${resource}`;
  return {
    list: (wsId: string) => request<T[]>(base(wsId)),
    create: (wsId: string, data: TInput) =>
      request<T>(base(wsId), { method: "POST", body: JSON.stringify(data) }),
    update: (wsId: string, id: string, data: TInput) =>
      request<T>(`${base(wsId)}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (wsId: string, id: string) =>
      request<void>(`${base(wsId)}/${id}`, { method: "DELETE" }),
  };
}

export const api = {
  signup: (data: { email: string; name: string; password: string }) =>
    request<User>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<User>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/me"),
  listWorkspaces: () => request<Workspace[]>("/workspaces"),
  createWorkspace: (data: { name: string; industry: string }) =>
    request<Workspace>("/workspaces", { method: "POST", body: JSON.stringify(data) }),

  listStages: (wsId: string) => request<Stage[]>(`/workspaces/${wsId}/stages`),
  listSources: (wsId: string) => request<Source[]>(`/workspaces/${wsId}/sources`),

  accounts: crud<Account, AccountInput>("accounts"),
  contacts: crud<Contact, ContactInput>("contacts"),
  reps: crud<Rep, RepInput>("reps"),
  deals: crud<Deal, DealInput>("deals"),
};
