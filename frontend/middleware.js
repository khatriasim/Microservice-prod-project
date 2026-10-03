import { NextResponse } from "next/server";

export async function middleware(request) {
  let user = null;

  try {
    const res = await fetch("http://localhost/api/verify-token/", {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (res.ok) {
      user = await res.json();
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user.is_agent) {
    return NextResponse.redirect(new URL("/view_estate", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create_property/:path*", "/agent_prop/:path*", "/view_estate"],
};