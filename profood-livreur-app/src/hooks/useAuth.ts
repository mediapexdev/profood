/**
 * Re-export from AuthContext for backward compatibility.
 *
 * The canonical auth hook and provider live in src/contexts/AuthContext.tsx.
 * Components should import directly from there. This shim exists only to
 * avoid breaking any future import that targets this path.
 */
export { useAuth, AuthProvider } from '../contexts/AuthContext'
export type { } from '../contexts/AuthContext'
