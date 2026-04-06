// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/beverages/:path*",
    "/dry-goods/:path*",
    "/transactions/:path*",
    "/api/products/:path*",
    "/api/transactions/:path*",
  ],
};