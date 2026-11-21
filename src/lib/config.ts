/** Base URL of the CityFix REST API (server side only: the browser talks to /api/proxy). */
export const API_URL = (process.env.API_URL ?? "https://cityfix-b7a6.netlify.app/api/v1").replace(/\/+$/, "");

/** Public origin of this frontend, used for metadata and Open Graph URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "CityFix";

/** httpOnly cookies holding the API tokens. JavaScript in the browser never sees them. */
export const COOKIES = {
  access: "cf_at",
  refresh: "cf_rt",
} as const;

/** Refresh-token lifetime on the API (JWT_REFRESH_EXPIRES_IN = 7d). */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
