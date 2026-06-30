/**
 * Admin API Service — Calls the administrator endpoints on the shared backend.
 *
 * All requests include the X-Admin-Key header for the POC.
 */
import config from "../config/appSettings";

const { API_BASE_URL, ADMIN_API_KEY } = config;

/**
 * Make an authenticated admin API request.
 */
const adminRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Admin-Key": ADMIN_API_KEY,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, detail: data.detail || "An error occurred" };
  }
  return data;
};

/**
 * Fetch all device records.
 */
export const listDevices = async () => {
  return await adminRequest("/admin/devices", { method: "GET" });
};

/**
 * Generate a one-time invitation token for a device.
 */
export const generateInvitationToken = async (deviceId) => {
  return await adminRequest("/admin/generate-token", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId }),
  });
};

/**
 * Revoke an unused invitation token.
 */
export const revokeInvitationToken = async (deviceId) => {
  return await adminRequest("/admin/revoke-token", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId }),
  });
};

/**
 * Reset a device registration (clears credential, session, returns to not_registered).
 */
export const resetDevice = async (deviceId) => {
  return await adminRequest("/admin/reset-device", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId }),
  });
};
