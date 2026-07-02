import axios from "axios";

/**
 * Auth endpoints client — same environment detection as api.ts, so
 * sign-in/sign-up hit the local API during development instead of
 * the production database.
 */
export default axios.create({
    baseURL:
        process.env.NODE_ENV === "production"
            ? "https://api.profood-app.com/api/"
            : "http://localhost:8000/api/",
});
