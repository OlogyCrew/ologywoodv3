export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
// Increased timeout for mobile network compatibility
// OAuth calls can take longer on slower connections
export const AXIOS_TIMEOUT_MS = 60_000; // 60 seconds for OAuth operations
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
