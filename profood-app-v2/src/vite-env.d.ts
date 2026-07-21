/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Clé applicative envoyée à l'API Laravel comme `app_key` (rôle CUSTOMER).
   * Doit valoir le PROFOOD_APP_KEY du serveur. Secret prod — cf. .env.example.
   */
  readonly VITE_APP_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
