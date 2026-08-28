import { apiRequest } from "@/lib/api/client";

export type AuditAction = "create" | "update" | "delete";

export type AuditLog = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: AuditAction | string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AuditListParams = {
  action?: string;
  resource_type?: string;
  resource_id?: string;
  actor?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type AuditListResponse = {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
};

function toQueryString(params: AuditListParams) {
  const search = new URLSearchParams();
  if (params.action) search.set("action", params.action);
  if (params.resource_type) search.set("resource_type", params.resource_type);
  if (params.resource_id) search.set("resource_id", params.resource_id);
  if (params.actor) search.set("actor", params.actor);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const auditApi = {
  list(params: AuditListParams = {}) {
    return apiRequest<AuditListResponse>(`/api/v1/audit/logs${toQueryString(params)}`);
  },
};
