import { type NextRequest, NextResponse } from "next/server";

const AUTH_PATH_PREFIX = "/auth";
const DASHBOARD_PATH_PREFIX = "/dashboard";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const isAuthenticated = Boolean(accessToken);

  if (pathname.startsWith(DASHBOARD_PATH_PREFIX) && !isAuthenticated) {
    const loginUrl = new URL("/auth/v2/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname.startsWith(AUTH_PATH_PREFIX)) {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
