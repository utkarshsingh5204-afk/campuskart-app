import { onAuthStateChanged, User } from 'firebase/auth';
import { MapPin, Search, X } from 'lucide-react';
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from 'react';
import { CartBar } from './components/CartBar';
import { CartDrawer } from './components/CartDrawer';
import { MyOrdersView } from './components/MyOrdersView';
import { ActivePage, Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import {
  CATEGORIES,
  FREE_DELIVERY_THRESHOLD,
  PRODUCTS,
  STANDARD_DELIVERY_FEE,
} from './data/products';
import {
  auth,
  placeOrder,
  signInWithGoogle,
  signOutUser,
  subscribeToUserOrders,
} from './lib/firebase';
import { CartItem, Category, OrderRecord, Product } from './types';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Something went wrong.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CampusKart ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-emerald-950/10 p-6 text-center">
            <h1 className="font-display text-xl font-bold text-slate-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 mb-5">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
            >
              Reload CampusKart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CART_STORAGE_KEY = 'campuskart_cart_v1';

function loadInitialCart(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const clean: Record<string, number> = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (typeof qty === 'number' && qty > 0 && Number.isInteger(qty)) {
        clean[id] = qty;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function getFriendlyFirebaseError(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed before completing login.';
  }
  if (raw.includes('auth/popup-blocked')) {
    return 'Popup was blocked by your browser. Please allow popups and try again.';
  }
  if (raw.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized in Firebase Authentication. Add it under Firebase Console > Authentication > Settings > Authorized domains.';
  }
  if (raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')) {
    return 'Firestore permissions denied. Ensure your Firestore security rules allow authenticated users to read and create their own orders.';
  }
  return fallback;
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>(
    loadInitialCart
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartQuantities));
    } catch {
      // Ignore storage write errors
    }
  }, [cartQuantities]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError(null);
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (fetchedOrders) => {
        setOrders(fetchedOrders);
        setOrdersLoading(false);
      },
      (err) => {
        setOrdersError(
          getFriendlyFirebaseError(err, 'Could not fetch your past orders.')
        );
        setOrdersLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        q.length === 0 ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const cartItems: CartItem[] = useMemo(() => {
    return PRODUCTS.filter((p) => (cartQuantities[p.id] ?? 0) > 0).map(
      (product) => ({
        product,
        quantity: cartQuantities[product.id],
      })
    );
  }, [cartQuantities]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const deliveryFee =
    cartCount === 0
      ? 0
      : cartSubtotal > FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;

  const cartTotal = cartSubtotal + deliveryFee;

  const handleAddProduct = (product: Product) => {
    setLastOrderId(null);
    setOrderError(null);
    setCartQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] ?? 0) + 1,
    }));
  };

  const handleIncrement = (productId: string) => {
    setLastOrderId(null);
    setOrderError(null);
    setCartQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  };

  const handleDecrement = (productId: string) => {
    setOrderError(null);
    setCartQuantities((prev) => {
      const current = prev[productId] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const handleClearCart = () => {
    setCartQuantities({});
    setOrderError(null);
  };

  const handleSignIn = async () => {
    setAuthNotice(null);
    setOrderError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthNotice(
        getFriendlyFirebaseError(error, 'Failed to sign in with Google.')
      );
    }
  };

  const handleSignOut = async () => {
    setAuthNotice(null);
    try {
      await signOutUser();
    } catch (error) {
      setAuthNotice(
        getFriendlyFirebaseError(error, 'Failed to sign out. Please try again.')
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return;

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const orderId = await placeOrder({
        user,
        items: cartItems.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          emoji: product.emoji,
          price: product.price,
          quantity,
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        total: cartTotal,
      });

      setLastOrderId(orderId);
      setCartQuantities({});
    } catch (error) {
      setOrderError(
        getFriendlyFirebaseError(
          error,
          'Could not place your order. Please try again.'
        )
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleOpenCart = () => {
    setLastOrderId(null);
    setOrderError(null);
    setIsCartOpen(true);
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F7FAF8] text-slate-900">
        <Navbar
          activePage={activePage}
          onNavigate={setActivePage}
          user={user}
          authLoading={authLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          cartSubtotal={cartSubtotal}
          cartCount={cartCount}
        />

        {authNotice && (
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3">
              <span>{authNotice}</span>
              <button
                type="button"
                onClick={() => setAuthNotice(null)}
                aria-label="Dismiss notice"
                className="p-1.5 rounded-lg hover:bg-amber-100 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1">
          {activePage === 'store' ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28">
              {/* Store Hero & Search Header */}
              <section className="mb-6 sm:mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Dehradun Campus Store</span>
                    </p>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                      Hostel essentials delivered in minutes
                    </h1>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-80 shrink-0">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chips, coffee, pens..."
                      aria-label="Search products"
                      className="w-full min-h-[44px] pl-10 pr-10 rounded-xl bg-white border border-emerald-950/15 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div
                  role="tablist"
                  aria-label="Product categories"
                  className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                >
                  {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`min-h-[40px] px-4 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-emerald-950/10 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-emerald-950/10 p-10 text-center">
                  <p className="font-display text-base font-bold text-slate-900 mb-1">
                    No matching items found
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Try another search term or switch back to All categories.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="min-h-[44px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <section aria-label="Products">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantity={cartQuantities[product.id] ?? 0}
                        onAdd={handleAddProduct}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <MyOrdersView
              user={user}
              orders={orders}
              loading={ordersLoading}
              error={ordersError}
              onSignIn={handleSignIn}
              onBackToStore={() => setActivePage('store')}
            />
          )}
        </main>

        {/* Sticky Bottom "View cart" bar */}
        {activePage === 'store' && (
          <CartBar
            itemCount={cartCount}
            total={cartTotal}
            onOpenCart={handleOpenCart}
          />
        )}

        {/* Cart Drawer / Bottom Sheet */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          subtotal={cartSubtotal}
          deliveryFee={deliveryFee}
          total={cartTotal}
          user={user}
          isPlacingOrder={isPlacingOrder}
          orderError={orderError}
          lastOrderId={lastOrderId}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onClearCart={handleClearCart}
          onSignIn={handleSignIn}
          onPlaceOrder={handlePlaceOrder}
          onViewOrders={() => {
            setIsCartOpen(false);
            setActivePage('orders');
          }}
        />
      </div>
    </AppErrorBoundary>
  );
}
