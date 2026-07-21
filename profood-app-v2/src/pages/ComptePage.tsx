import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Icon } from '../components/ui/Icon'

const ROWS = [
  { icon: 'receipt_long', label: 'Mes commandes' },
  { icon: 'local_shipping', label: 'Suivi de livraison' },
  { icon: 'location_on', label: 'Mes adresses' },
  { icon: 'favorite', label: 'Mes découpes favorites' },
  { icon: 'help', label: 'Aide & contact' },
]

export function ComptePage() {
  return (
    <>
      <AppBar title="Mon compte" />
      <Page>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-4">
          <div className="flex items-center gap-3 bg-surface border border-sable rounded-card p-4">
            <div className="w-12 h-12 rounded-full bg-terre/15 grid place-items-center text-terre">
              <Icon name="person" size={28} fill />
            </div>
            <div>
              <p className="font-title font-extrabold">Invité</p>
              <p className="text-[13px] text-taupe">Connectez-vous pour retrouver vos commandes</p>
            </div>
          </div>

          <div className="mt-4 bg-surface border border-sable rounded-card overflow-hidden">
            {ROWS.map((r, i) => (
              <button key={r.label} className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-creme-dark text-left ${i ? 'border-t border-sable' : ''}`}>
                <Icon name={r.icon} size={22} className="text-taupe" />
                <span className="flex-1 font-semibold text-[15px]">{r.label}</span>
                <Icon name="chevron_right" size={20} className="text-taupe" />
              </button>
            ))}
          </div>
        </div>
      </Page>
    </>
  )
}
