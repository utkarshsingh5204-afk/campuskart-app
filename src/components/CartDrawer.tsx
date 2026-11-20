import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../data/products';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  user: User | null;
  isPlacingOrder: boolean;
  orderError: string | null;
  lastOrderId: string | null;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onClearCart: () => void;
  onSignIn: () => void;
  onPlaceOrder: () => void;
  onViewOrders: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotal,
  deliveryFee,
  total,
  user,
  isPlacingOrder,
  orderError,
  lastOrderId,
  onIncrement,
  onDecrement,
  onClearCart,
  onSignIn,
  onPlaceOrder,
  onViewOrders,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const isFreeDelivery = subtotal > FREE_DELIVERY_THRESHOLD;
  const amountForFree = Math.max(0, FREE_DELIVERY_THRESHOLD + 1 - subtotal);
  const progressPct = Math.min(
    100,
    Math.round((subtotal / (FREE_DELIVERY_THRESHOLD + 1)) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-full">
        {/* Drag handle on mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {lastOrderId ? 'Order Placed' : 'Your Cart'}
            </h2>
            {!lastOrderId && items.length > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                {items.reduce((sum, i) => sum + i.quantity, 0)} items · Dehradun Campus
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!lastOrderId && items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                aria-label="Clear cart"
                className="min-w-[40px] min-h-[40px] rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="min-w-[44px] min-h-[44px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Order Success State */}
        {lastOrderId ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
              Order confirmed!
            </h3>
            <p className="text-sm text-slate-600 max-w-xs mb-2">
              Your campus order has been saved and is being prepared for delivery in Dehradun.
            </p>
            <p className="text-xs font-mono text-slate-500 mb-6">
              Order ID: {lastOrderId.slice(0, 10)}
            </p>
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={onViewOrders}
                className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-semibold text-sm transition-colors"
              >
                Go to My Orders
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-colors"
              >
                Continue shopping
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mb-5">
              Add snacks, drinks, stationery, or toiletries from the store to get started.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
            >
              Browse items
            </button>
          </div>
        ) : (
          <>
            {/* Free delivery threshold meter */}
            <div className="px-5 py-3 bg-[#F4FAF6] border-b border-emerald-950/5">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                {isFreeDelivery ? (
                  <span className="text-emerald-800 font-semibold">
                    Free delivery unlocked!
                  </span>
                ) : (
                  <span className="text-slate-700">
                    Add <strong className="text-emerald-800 tabular-nums">₹{amountForFree}</strong> more for free delivery
                  </span>
                )}
                <span className="text-slate-500 tabular-nums">
                  Above ₹{FREE_DELIVERY_THRESHOLD}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-emerald-950/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl bg-[#F0F7F2] flex items-center justify-center text-2xl shrink-0 select-none"
                      aria-hidden="true"
                    >
                      {product.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        ₹{product.price} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <button
                        type="button"
                        onClick={() => onDecrement(product.id)}
                        aria-label={`Decrease ${product.name}`}
                        className="min-w-[34px] min-h-[36px] flex items-center justify-center hover:bg-emerald-100 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrement(product.id)}
                        aria-label={`Increase ${product.name}`}
                        className="min-w-[34px] min-h-[36px] flex items-center justify-center hover:bg-emerald-100 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <span className="w-12 text-right text-sm font-bold text-slate-900 tabular-nums">
                      ₹{product.price * quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary & Checkout CTA */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Items subtotal</span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Delivery fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-emerald-700">
                      Free
                    </span>
                  ) : (
                    <span className="font-medium text-slate-900 tabular-nums">
                      ₹{STANDARD_DELIVERY_FEE}
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="font-display font-bold text-slate-900">
                    Total to pay
                  </span>
                  <span className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
                    ₹{total}
                  </span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{orderError}</span>
                </div>
              )}

              {user ? (
                <button
                  type="button"
                  disabled={isPlacingOrder}
                  onClick={onPlaceOrder}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {isPlacingOrder ? (
                    <span>Placing order...</span>
                  ) : (
                    <span>Place Order · ₹{total}</span>
                  )}
                </button>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-center text-slate-600">
                    Sign in with Google to place your order
                  </p>
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
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
                    <span>Sign in with Google to Order</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
