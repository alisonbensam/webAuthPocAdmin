/**
 * Application Configuration — Admin Portal
 *
 * Points to the shared backend API.
 */
const config = {
  // Shared backend API base URL
  API_BASE_URL: "http://localhost:8000",

  // Admin API key (POC only — sent in the X-Admin-Key header).
  // In production this would NEVER live in frontend code; the admin panel
  // would authenticate via a proper admin login and scoped token.
  ADMIN_API_KEY: "admin-secret-key",

  // Auto-refresh interval (milliseconds)
  AUTO_REFRESH_INTERVAL_MS: 30000,
};

export default config;
