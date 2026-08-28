import { deleteClientCookie, getClientCookie, setClientCookie } from "@/lib/cookie.client";

import { AUTH_COOKIE_KEYS } from "./constants";

const ACCESS_TOKEN_DAYS = 1;
const REFRESH_TOKEN_DAYS = 7;

export function getAccessToken() {
  return getClientCookie(AUTH_COOKIE_KEYS.accessToken);
}

export function getRefreshToken() {
  return getClientCookie(AUTH_COOKIE_KEYS.refreshToken);
}

export function setTokens(accessToken: string, refreshToken: string) {
  setClientCookie(AUTH_COOKIE_KEYS.accessToken, accessToken, ACCESS_TOKEN_DAYS);
  setClientCookie(AUTH_COOKIE_KEYS.refreshToken, refreshToken, REFRESH_TOKEN_DAYS);
}

export function clearTokens() {
  deleteClientCookie(AUTH_COOKIE_KEYS.accessToken);
  deleteClientCookie(AUTH_COOKIE_KEYS.refreshToken);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}
