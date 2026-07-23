/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Clé applicative envoyée à l'API Laravel comme `app_key` (rôle CUSTOMER).
   * Doit valoir le PROFOOD_APP_KEY du serveur. Secret prod — cf. .env.example.
   */
  readonly VITE_APP_KEY?: string
  /**
   * Bascule le catalogue sur l'API Laravel ('true') au lieu des données
   * locales (défaut). Bascule progressive — cf. src/contexts/CatalogContext.
   */
  readonly VITE_USE_API_CATALOG?: string
  /**
   * Commandes réelles via l'API ('true') : localités + frais serveur,
   * guest-order / add-order-*, PayTech. Défaut : commandes locales de démo.
   */
  readonly VITE_USE_API_ORDERS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
