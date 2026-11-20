import { Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  return (
    <article className="group bg-white rounded-2xl border border-emerald-950/10 p-3 sm:p-4 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-950/5">
      {/* Clean neutral-mint emoji stage */}
      <div>
        <div
          className="w-full aspect-[4/3] rounded-xl bg-[#F0F7F2] flex items-center justify-center mb-3 select-none"
          aria-hidden="true"
        >
          <span className="text-5xl sm:text-6xl transition-transform duration-150 group-hover:scale-105">
            {product.emoji}
          </span>
        </div>

        {/* Quiet unboxed category kicker */}
        <p className="text-xs font-medium text-emerald-800/75 mb-0.5">
          {product.category}
        </p>

        {/* Product name */}
        <h3 className="font-display text-[15px] sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
      </div>

      {/* Price & Action Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="font-display text-base sm:text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap">
          ₹{product.price}
        </span>

        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(product)}
            aria-label={`Add ${product.name} to cart`}
            className="min-h-[44px] px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 active:scale-[0.97] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Add
          </button>
        ) : (
          <div
            className="inline-flex items-center rounded-xl bg-emerald-700 text-white overflow-hidden shrink-0"
            role="group"
            aria-label={`${product.name} quantity controls`}
          >
            <button
              type="button"
              onClick={() => onDecrement(product.id)}
              aria-label={`Decrease quantity of ${product.name}`}
              className="min-w-[38px] min-h-[44px] flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="px-1.5 min-w-[24px] text-center text-sm font-bold tabular-nums select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(product.id)}
              aria-label={`Increase quantity of ${product.name}`}
              className="min-w-[38px] min-h-[44px] flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
