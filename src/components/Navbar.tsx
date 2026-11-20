import { User } from 'firebase/auth';
import { LogOut, Package, ShoppingBag } from 'lucide-react';
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../data/products';
import { getFirstName } from '../lib/firebase';

export type ActivePage = 'store' | 'orders';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  cartSubtotal: number;
  cartCount: number;
}

export function Navbar({
  activePage,
  onNavigate,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  cartSubtotal,
  cartCount,
}: NavbarProps) {
  const firstName = getFirstName(user);
  const amountRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD + 1 - cartSubtotal);
  const isFreeDelivery = cartSubtotal > FREE_DELIVERY_THRESHOLD;

  return (
    <>
      {/* Top delivery fee banner */}
      <div className="bg-emerald-900 text-emerald-50 text-xs sm:text-[13px] font-medium py-2 px-4 text-center">
        {cartCount === 0 ? (
          <span>
            Dehradun Campus Delivery · Free delivery above ₹{FREE_DELIVERY_THRESHOLD}, otherwise ₹{STANDARD_DELIVERY_FEE}
          </span>
        ) : isFreeDelivery ? (
          <span>
            Free delivery unlocked on your order (above ₹{FREE_DELIVERY_THRESHOLD})
          </span>
        ) : (
          <span>
            Free delivery above ₹{FREE_DELIVERY_THRESHOLD}, otherwise ₹{STANDARD_DELIVERY_FEE} · Add ₹{amountRemaining} more for free delivery
          </span>
        )}
      </div>

      {/* Sticky 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('store')}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-md"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Campus<span className="text-emerald-700">Kart</span>
            </span>
          </button>

          {/* Zone 2: Desktop single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden sm:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => onNavigate('store')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'store'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Store
            </button>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'orders'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              My Orders
            </button>
          </nav>

          {/* Zone 3: Auth action */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {authLoading ? (
              <div className="h-9 w-28 rounded-lg bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-semibold text-emerald-900 truncate max-w-[110px] sm:max-w-[160px]">
                  Hi {firstName}!
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile sub-navigation (non-overlapping, 44px touch targets) */}
        <div className="sm:hidden border-t border-emerald-950/5 px-4 py-1.5 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => onNavigate('store')}
            className={`flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activePage === 'store'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Store</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={`flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activePage === 'orders'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" aria-hidden="true" />
            <span>My Orders</span>
          </button>
        </div>
      </header>
    </>
  );
}
