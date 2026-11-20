import { User } from 'firebase/auth';
import { AlertCircle, ArrowLeft, Clock, Package } from 'lucide-react';
import { OrderRecord } from '../types';

interface MyOrdersViewProps {
  user: User | null;
  orders: OrderRecord[];
  loading: boolean;
  error: string | null;
  onSignIn: () => void;
  onBackToStore: () => void;
}

function formatOrderTime(timeMs: number): string {
  if (!timeMs) return 'Just now';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timeMs));
  } catch {
    return new Date(timeMs).toLocaleString();
  }
}

export function MyOrdersView({
  user,
  orders,
  loading,
  error,
  onSignIn,
  onBackToStore,
}: MyOrdersViewProps) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your CampusKart order history in Dehradun, newest first
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Store</span>
        </button>
      </div>

      {!user ? (
        <div className="bg-white rounded-2xl border border-emerald-950/10 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 mb-1.5">
            Sign in to see your orders
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            Orders are linked to your Google account so only you can view your past purchases.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Unable to load orders</p>
            <p className="text-xs mt-1 text-rose-700">{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-emerald-950/10 p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-40 bg-slate-100 rounded" />
              <div className="h-3 w-64 bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-emerald-950/10 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 mb-1.5">
            No orders yet
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            Once you place an order on CampusKart, it will appear right here.
          </p>
          <button
            type="button"
            onClick={onBackToStore}
            className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white rounded-2xl border border-emerald-950/10 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span className="font-medium text-slate-700">
                    {formatOrderTime(order.timeMs)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">
                    #{order.id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-800">
                  Confirmed
                </span>
              </div>

              <ul className="py-3 divide-y divide-slate-50">
                {order.items.map((item, idx) => (
                  <li
                    key={`${order.id}-${item.id}-${idx}`}
                    className="py-2 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span className="font-medium text-slate-800 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums shrink-0">
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Delivery fee:{' '}
                  <strong className="font-semibold text-slate-700 tabular-nums">
                    {order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}
                  </strong>
                </span>
                <span className="font-display text-base font-bold text-slate-900 tabular-nums">
                  Total ₹{order.total}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
