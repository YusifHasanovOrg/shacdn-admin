import { apiRequest } from "@/lib/api/client";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
};

export type UserListParams = {
  name?: string;
  email?: string;
  limit?: number;
  offset?: number;
};

export type UserListResponse = {
  items: User[];
  total: number;
  limit: number;
  offset: number;
};

export type UserCreateBody = {
  name: string;
  email: string;
  password: string;
};

function toQueryString(params: UserListParams) {
  const search = new URLSearchParams();
  if (params.name) search.set("name", params.name);
  if (params.email) search.set("email", params.email);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const usersApi = {
  list(params: UserListParams = {}) {
    return apiRequest<UserListResponse>(`/api/v1/users${toQueryString(params)}`);
  },

  getById(id: string) {
    return apiRequest<User>(`/api/v1/users/${id}`);
  },

  create(body: UserCreateBody) {
    return apiRequest<User>("/api/v1/users", {
      method: "POST",
      body,
    });
  },

  delete(id: string) {
    return apiRequest<void>(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
  },

  setRoles(userId: string, roles: string[]) {
    return apiRequest<{ user_id: string; roles: string[] }>(`/api/v1/rbac/users/${userId}/roles`, {
      method: "PUT",
      body: { roles },
    });
  },

  getRoles(userId: string) {
    return apiRequest<{ user_id: string; roles: string[] }>(`/api/v1/rbac/users/${userId}/roles`);
  },
};
