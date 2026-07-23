import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { DELIVERY_ZONES, zoneById } from '../lib/delivery'
import { getProfile, upsertAddress, removeAddress, setDefaultAddress } from '../lib/profile'
import type { SavedAddress } from '../lib/profile'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

export function AdressesPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(getProfile)
  const [editing, setEditing] = useState<SavedAddress | 'new' | null>(null)

  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [touched, setTouched] = useState(false)

  const openNew = () => { haptic('light'); setEditing('new'); setLabel(''); setAddress(''); setZoneId(''); setTouched(false) }
  const openEdit = (a: SavedAddress) => { haptic('light'); setEditing(a); setLabel(a.label); setAddress(a.address); setZoneId(a.zoneId); setTouched(false) }
  const close = () => setEditing(null)

  const valid = address.trim().length >= 4 && !!zoneId
  const save = () => {
    setTouched(true)
    if (!valid) return
    const zone = zoneById(zoneId)!
    const next = upsertAddress({
      id: editing !== 'new' && editing ? editing.id : undefined,
      label: label.trim() || zone.commune,
      address: address.trim(),
      zoneId,
      commune: zone.commune,
    })
    setProfile(next)
    close()
  }
  const del = (id: string) => { haptic('medium'); setProfile(removeAddress(id)) }
  const makeDefault = (id: string) => { haptic('light'); setProfile(setDefaultAddress(id)) }

  return (
    <>
      <AppBar title={t('account.addresses')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-4 flex flex-col gap-3">
          {profile.addresses.length === 0 && !editing && (
            <div className="flex flex-col items-center text-center gap-3 pt-16 text-taupe">
              <span className="opacity-40"><Icon name="location_on" size={54} /></span>
              <p className="font-title font-extrabold text-lg text-ink">{t('adresses.emptyTitle')}</p>
              <p className="text-[14px]">{t('adresses.emptyHint')}</p>
            </div>
          )}

          {profile.addresses.map((a) => {
            const isDefault = a.id === profile.defaultAddressId
            return (
              <div key={a.id} className="bg-surface border border-sable rounded-card p-4">
                <div className="flex items-start gap-3">
                  <Icon name="location_on" size={22} className="text-terre mt-0.5" fill />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-title font-bold truncate">{a.commune}</p>
                      {isDefault && <span className="text-[10px] font-bold uppercase tracking-wide text-terre bg-terre/12 rounded-full px-2 py-0.5">{t('adresses.default')}</span>}
                    </div>
                    <p className="text-[13px] text-taupe">{a.address}</p>
                    <p className="text-[12px] text-taupe mt-0.5 tabular-nums">{t('adresses.deliveryFee', { amount: fmtFcfa(zoneById(a.zoneId)?.fee ?? 0) })}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-sable">
                  {!isDefault && <button onClick={() => makeDefault(a.id)} className="text-[13px] font-bold text-taupe active:text-terre">{t('adresses.setDefault')}</button>}
                  <button onClick={() => openEdit(a)} className="ml-auto text-[13px] font-bold text-taupe active:text-ink inline-flex items-center gap-1"><Icon name="edit" size={16} /> {t('common.edit')}</button>
                  <button onClick={() => del(a.id)} className="text-[13px] font-bold text-taupe active:text-alerte inline-flex items-center gap-1"><Icon name="delete" size={16} /> {t('common.delete')}</button>
                </div>
              </div>
            )
          })}

          {editing ? (
            <div className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
              <h2 className="font-title font-extrabold text-lg">{editing === 'new' ? t('adresses.newTitle') : t('adresses.editTitle')}</h2>
              <label className="block">
                <span className="text-[13px] font-bold text-taupe">{t('adresses.labelField')}</span>
                <input className={`${inputCls} mt-1`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('adresses.labelPlaceholder')} />
              </label>
              <label className="block">
                <span className="text-[13px] font-bold text-taupe">{t('checkout.fieldZone')}</span>
                <select className={`${inputCls} mt-1`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                  <option value="">{t('checkout.chooseCommune')}</option>
                  {DELIVERY_ZONES.map((z) => <option key={z.id} value={z.id}>{z.commune} · {fmtFcfa(z.fee)}</option>)}
                </select>
                {touched && !zoneId && <span className="text-[12px] font-semibold text-alerte">{t('checkout.errorZone')}</span>}
              </label>
              <label className="block">
                <span className="text-[13px] font-bold text-taupe">{t('checkout.fieldAddress')}</span>
                <input className={`${inputCls} mt-1`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('checkout.addressPlaceholder')} />
                {touched && address.trim().length < 4 && <span className="text-[12px] font-semibold text-alerte">{t('checkout.errorAddress')}</span>}
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={close}>{t('common.cancel')}</Button>
                <Button className="flex-1" onClick={save}>{t('common.save')}</Button>
              </div>
            </div>
          ) : (
            <Button full variant="ghost" className="mt-1" onClick={openNew}>
              <Icon name="add" size={20} /> {t('adresses.addNew')}
            </Button>
          )}

          <Button full className="mt-2 mb-2" onClick={() => navigate('/compte')}>{t('adresses.done')}</Button>
        </div>
      </Page>
    </>
  )
}
