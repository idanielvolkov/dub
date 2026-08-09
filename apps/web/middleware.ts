import { APP_HOSTNAMES } from "@dub/utils";
import { NextRequest, NextResponse } from "next/server";
import { AppMiddleware } from "./lib/middleware/app";
import { parse } from "./lib/middleware/utils/parse";

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (proxies for third-party services)
     * 4. Metadata files: favicon.ico, icon.svg, sitemap.xml, robots.txt, manifest.webmanifest
     */
    "/((?!api/|_next/|_proxy/|favicon.ico|icon.svg|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const { domain } = parse(req);

  if (APP_HOSTNAMES.has(domain)) {
    return AppMiddleware(req);
  }

  return NextResponse.next();
}
