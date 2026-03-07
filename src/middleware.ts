import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;

    // Protect all routes under (dashboard), essentially everything except /login and static files
    if (request.nextUrl.pathname.startsWith("/login")) {
        if (sessionCookie) {
            try {
                await decrypt(sessionCookie);
                return NextResponse.redirect(new URL("/", request.url));
            } catch (error) {
                // Invalid session, let them login
            }
        }
        return NextResponse.next();
    }

    // Except /login, require auth
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const payload = await decrypt(sessionCookie);
        // If valid, continue
        return NextResponse.next();
    } catch (error) {
        // If invalid token, redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("session");
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA)
         * - icons (PWA icons)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
    ],
};
