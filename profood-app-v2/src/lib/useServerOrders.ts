import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ordersApiEnabled, fetchCustomerOrders, fetchGuestOrderStatus } from '../api/orders'
import type { ServerOrder } from '../api/orders'
import { listOrders, patchOrder } from './orders'
import { currentToken } from './auth'

/**
 * Statut réel des commandes (client connecté, commandes API activées) :
 * récupère l'historique serveur, reporte le statut sur les commandes locales
 * correspondantes (par référence) et expose celles passées depuis un autre
 * appareil (aucun enregistrement local). `version` change quand un statut a
 * été mis à jour — à utiliser comme dépendance de relecture.
 */
export function useServerOrders(): { serverOnly: ServerOrder[]; version: number } {
  const { user, isAuthenticated, mode } = useAuth()
  const [serverOnly, setServerOnly] = useState<ServerOrder[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const token = currentToken()
    if (!ordersApiEnabled || mode !== 'api' || !isAuthenticated) return
    if (!user?.userId || !token || token.startsWith('local:')) return
    let alive = true
    fetchCustomerOrders(user.userId, token).then((rows) => {
      if (!alive || !rows.length) return
      const locals = listOrders()
      const extra: ServerOrder[] = []
      for (const r of rows) {
        const local = locals.find((o) => o.serverRef === r.serverRef || o.ref === r.serverRef)
        if (local) patchOrder(local.token, { serverStage: r.stage, paid: r.paid })
        else extra.push(r)
      }
      setServerOnly(extra)
      setVersion((v) => v + 1)
    })
    return () => {
      alive = false
    }
  }, [user, isAuthenticated, mode])

  // Commandes INVITÉ locales : rafraîchit leur statut via l'endpoint public
  // (réf + téléphone). Les commandes d'un compte y répondent 404 (inoffensif) ;
  // les statuts terminaux ne bougent plus, donc on ne les re-demande pas.
  useEffect(() => {
    if (!ordersApiEnabled) return
    let alive = true
    const pending = listOrders()
      .filter((o) => o.serverRef && o.customer?.phone && o.serverStage !== 'delivered' && o.serverStage !== 'cancelled')
      .slice(0, 10)
    if (!pending.length) return
    Promise.all(
      pending.map(async (o) => {
        const st = await fetchGuestOrderStatus(o.serverRef!, o.customer.phone)
        if (st && alive && (st.stage !== o.serverStage || st.paid !== o.paid)) {
          patchOrder(o.token, { serverStage: st.stage, paid: st.paid })
          return true
        }
        return false
      }),
    ).then((changed) => {
      if (alive && changed.some(Boolean)) setVersion((v) => v + 1)
    })
    return () => {
      alive = false
    }
  }, [])

  return { serverOnly, version }
}
