import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { isAdminEmail } from "./lib/adminAuth";

export async function proxy(request) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute =
  request.nextUrl.pathname.startsWith("/admin") &&
  request.nextUrl.pathname !== "/admin/login";

if (isAdminRoute && !session) {
  return NextResponse.redirect(
    new URL("/admin/login", request.url)
  );
}

if (isAdminRoute && !isAdminEmail(session.user.email)) {
  return NextResponse.redirect(new URL("/customer/login", request.url));
}

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
