import { toast } from "sonner";

// ─── Duration Constants ────────────────────────────────────────────────────────
const DURATION_SUCCESS = 5000;
const DURATION_ERROR   = 6000;
const DURATION_WARNING = 5000;
const DURATION_INFO    = 4000;

// ─── Typed Toast Helpers ───────────────────────────────────────────────────────

/**
 * Show a success toast (green).
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 */
export const toastSuccess = (message, options = {}) =>
  toast.success(message, { duration: DURATION_SUCCESS, ...options });

/**
 * Show an error toast (red). Longer duration so users can read the message.
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 */
export const toastError = (message, options = {}) =>
  toast.error(message, { duration: DURATION_ERROR, ...options });

/**
 * Show a warning toast (amber/yellow).
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 */
export const toastWarning = (message, options = {}) =>
  toast.warning(message, { duration: DURATION_WARNING, ...options });

/**
 * Show an informational toast (blue).
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 */
export const toastInfo = (message, options = {}) =>
  toast.info(message, { duration: DURATION_INFO, ...options });

/**
 * Show a persistent loading toast. Returns the toast ID so it can be
 * updated or dismissed later via toastDismiss(id).
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 * @returns {string|number} Toast ID
 */
export const toastLoading = (message, options = {}) =>
  toast.loading(message, { duration: Infinity, ...options });

/**
 * Dismiss a specific toast by ID, or all toasts if no ID is provided.
 * @param {string|number} [id]
 */
export const toastDismiss = (id) => toast.dismiss(id);

/**
 * Update an existing toast (e.g. resolve a loading toast into success/error).
 * @param {string|number} id   - ID returned by toastLoading()
 * @param {"success"|"error"|"info"|"warning"} type
 * @param {string} message
 * @param {import("sonner").ToastOptions} [options]
 */
export const toastResolve = (id, type, message, options = {}) => {
  const durationMap = {
    success: DURATION_SUCCESS,
    error:   DURATION_ERROR,
    warning: DURATION_WARNING,
    info:    DURATION_INFO,
  };
  toast[type](message, {
    id,
    duration: durationMap[type] ?? DURATION_INFO,
    ...options,
  });
};

// ─── API Error Parser ──────────────────────────────────────────────────────────

/**
 * Parses any type of API/network error and returns a user-friendly string.
 *
 * Handles:
 *  - Fetch Response objects (reads JSON body for .error / .message / .detail)
 *  - Axios error objects  (error.response.data)
 *  - Plain JS Error       (error.message)
 *  - Network / offline    (detects "Failed to fetch" / "network" keywords)
 *
 * @param {unknown} error          - The caught error object
 * @param {Response|null} [response] - Optional raw Fetch response (for non-ok responses)
 * @returns {Promise<string>} Human-readable error message
 */
export const parseApiError = async (error, response = null) => {
  // 1. Fetch non-ok response passed explicitly
  if (response) {
    try {
      const data = await response.clone().json();
      return (
        data?.error ||
        data?.message ||
        data?.detail ||
        `Server error (${response.status})`
      );
    } catch {
      return `Server error (${response.status})`;
    }
  }

  // 2. Axios-style error
  if (error?.response) {
    const data = error.response.data;
    return (
      data?.error ||
      data?.message ||
      data?.detail ||
      `Server error (${error.response.status})`
    );
  }

  // 3. Network / offline errors
  const msg = error?.message ?? "";
  if (
    msg.toLowerCase().includes("failed to fetch") ||
    msg.toLowerCase().includes("networkerror") ||
    msg.toLowerCase().includes("network error") ||
    msg.toLowerCase().includes("load failed")
  ) {
    return "Network error — please check your connection and try again.";
  }

  // 4. Generic JS error message
  return msg || "An unexpected error occurred. Please try again.";
};
