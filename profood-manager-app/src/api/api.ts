import axios from "axios";

const api = axios.create({
    baseURL:
      process.env.NODE_ENV === "production"
      ? "https://api.profood-app.com/api/"
        : "http://localhost:8000/api/",
});

/**
 * On an expired/invalid session (401 or token_expired), purge the stored
 * session and send the user back to the sign-in page. Without this the app
 * keeps rendering the shell on a dead token and only shows generic error
 * toasts (see RequireAuth, which authorizes on token presence alone).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url ?? "";
        // A failed sign-in / sign-out also returns 401 (wrong credentials).
        // Those must NOT be treated as an expired session, otherwise a user
        // who is already logged in and mistypes on /connexion would have their
        // still-valid token wiped.
        const isAuthRequest = requestUrl.includes("/signin") || requestUrl.includes("/signout");
        const isExpired = !isAuthRequest && (status === 401 || error?.response?.data?.error === "token_expired");

        if (isExpired) {
            const token = localStorage.getItem("token");
            if (token) {
                localStorage.removeItem(token);
                localStorage.removeItem("token");
            }
            if (window.location.pathname !== "/connexion") {
                window.location.assign("/connexion");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
