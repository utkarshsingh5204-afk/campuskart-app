import { ArrowRight, ShoppingCart } from 'lucide-react';

interface CartBarProps {
  itemCount: number;
  total: number;
  onOpenCart: () => void;
}

export function CartBar({ itemCount, total, onOpenCart }: CartBarProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[390px] z-40">
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full min-h-[56px] px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white shadow-xl shadow-emerald-950/20 flex items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-emerald-800/80 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="text-left min-w-0">
            <p className="text-xs text-emerald-100 font-medium whitespace-nowrap">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
            <p className="font-display text-base font-bold tabular-nums whitespace-nowrap">
              ₹{total}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold whitespace-nowrap shrink-0">
          <span>View cart</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
