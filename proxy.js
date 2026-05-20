import { NextResponse } from "next/server";

export async function proxy(request) {
  const response = NextResponse.next({
    request,
  });

  response.headers.set("Cache-Control", "private, no-store, max-age=0");

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
