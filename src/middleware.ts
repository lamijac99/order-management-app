import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isOrders = pathname.startsWith("/orders");
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogs = pathname.startsWith("/logs");
  const isProducts = pathname.startsWith("/products");
  const isUsers = pathname.startsWith("/users");
  const isAuth = pathname.startsWith("/auth");

  if (!user && (isOrders || isDashboard || isLogs || isProducts || isUsers)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/orders";
    return NextResponse.redirect(url);
  }

  if (user && (isDashboard || isLogs || isProducts || isUsers)) {
    const { data: me, error } = await supabase
      .from("korisnici")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = !error && me?.role === "admin";

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/orders";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/orders/:path*", "/dashboard/:path*", "/logs/:path*", "/products/:path*", "/users/:path*", "/auth/:path*"],
};
