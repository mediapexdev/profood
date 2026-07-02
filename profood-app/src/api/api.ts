import axios, { AxiosError } from "axios";

/**
 * Maximum number of retry attempts for failed requests
 */
const MAX_RETRIES = 3;

/**
 * Initial delay in milliseconds before first retry (doubles for each subsequent retry)
 */
const INITIAL_RETRY_DELAY = 1000;

/**
 * HTTP status codes that should trigger a retry attempt
 * - 408: Request Timeout
 * - 429: Too Many Requests
 * - 500: Internal Server Error
 * - 502: Bad Gateway
 * - 503: Service Unavailable
 * - 504: Gateway Timeout
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Determines if a failed request should be retried based on error type and status code
 * @param error - The axios error object
 * @returns true if the request should be retried, false otherwise
 */
const shouldRetry = (error: AxiosError): boolean => {
  // Retry on network errors (no response received)
  if (!error.response) {
    return true;
  }

  // Retry on specific HTTP status codes that indicate transient failures
  const status = error.response.status;
  return RETRYABLE_STATUS_CODES.includes(status);
};

/**
 * Calculates the delay before the next retry using exponential backoff
 * Formula: delay = INITIAL_RETRY_DELAY * (2 ^ retryCount)
 * Example: 1s, 2s, 4s for retries 0, 1, 2
 *
 * @param retryCount - Current retry attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
const getRetryDelay = (retryCount: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
};

/**
 * Delays execution for a specified duration
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the delay
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const apiClient = axios.create({
  baseURL: //"https://api.profood-app.com/api/"
    process.env.NODE_ENV === "production"
    ? "https://api.profood-app.com/api/"
    // : "http://localhost:8000/api/",
    // : "http://192.168.1.4:8000/api/",
    // : "https://api.profood-app.com/api/",
      : "http://localhost:8000/api/",

        // withCredentials: true,
        // headers: {
        //   Accept: "*/*",
        //   "Content-Type": "application/json",
        //   "Access-Control-Allow-Origin" : 'http://127.0.0.1:3000'
        // },
});

/**
 * Response interceptor that implements retry logic with exponential backoff
 *
 * When a request fails due to network issues or specific server errors (5xx, 408, 429),
 * it will automatically retry up to MAX_RETRIES times with increasing delays between attempts.
 *
 * Client errors (4xx except 408 and 429) are not retried as they indicate problems
 * with the request itself that won't be resolved by retrying.
 */
/**
 * Purges the locally stored session when the API reports the token is no
 * longer valid (401), and notifies the app so React state can follow.
 *
 * The user-infos blob is stored under a key equal to the token itself
 * (see UserInfosProvider), so both entries are removed.  UserInfosProvider
 * listens for the event and resets its state, which flips the whole UI
 * back to logged-out.
 */
const purgeExpiredSession = () => {
  const token = localStorage.getItem("token");

  if (token !== null) {
    localStorage.removeItem(token);
    localStorage.removeItem("token");
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
  }
};

apiClient.interceptors.response.use(
  // Success handler - pass through successful responses
  (response) => response,

  // Error handler - implement retry logic
  async (error: AxiosError) => {
    const config = error.config as any;

    // Session expired / token revoked: purge the stale local session so
    // the app returns to a consistent logged-out state.  Only purge when
    // the failing request actually carried the stored token — a 401 from
    // e.g. a wrong-password /signin attempt must not wipe a valid session.
    if (error.response?.status === 401) {
      const storedToken = localStorage.getItem("token");
      const sentAuth = (error.config?.headers as any)?.Authorization;

      if (storedToken !== null && sentAuth === `Bearer ${storedToken}`) {
        purgeExpiredSession();
      }
    }

    // Initialize retry count if not present
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Check if we should retry this request
    if (config.__retryCount >= MAX_RETRIES || !shouldRetry(error)) {
      // Max retries reached or error is not retryable - reject the promise
      return Promise.reject(error);
    }

    // Increment retry count
    config.__retryCount += 1;

    // Calculate delay for this retry attempt (exponential backoff)
    const retryDelay = getRetryDelay(config.__retryCount - 1);

    // Log retry attempt for debugging (can be removed in production)
    console.log(
      `Retrying request (attempt ${config.__retryCount}/${MAX_RETRIES}) ` +
      `after ${retryDelay}ms delay. URL: ${config.url}`
    );

    // Wait for the calculated delay
    await delay(retryDelay);

    // Retry the request with the same configuration
    return apiClient(config);
  }
);

export default apiClient;
