'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  ShopifyCart,
  CartLine,
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
} from '@/lib/shopify';

// ─── State ─────────────────────────────────────────────────────────────────────

type CartState = {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
};

type CartAction =
  | { type: 'SET_CART'; payload: ShopifyCart }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

const initialState: CartState = {
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,
};

// ─── Context ───────────────────────────────────────────────────────────────────

type CartContextType = CartState & {
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartLines: CartLine[];
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_ID_KEY = 'nova_shop_cart_id';

// ─── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Rehydrate cart from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (!savedCartId) return;

    (async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const cart = await getCart(savedCartId);
        if (cart) {
          dispatch({ type: 'SET_CART', payload: cart });
        } else {
          // Cart expired — clear stale ID
          localStorage.removeItem(CART_ID_KEY);
        }
      } catch {
        localStorage.removeItem(CART_ID_KEY);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const currentCartId = localStorage.getItem(CART_ID_KEY);
      let updatedCart: ShopifyCart;

      if (currentCartId) {
        updatedCart = await addToCart(currentCartId, [{ merchandiseId, quantity }]);
      } else {
        updatedCart = await createCart([{ merchandiseId, quantity }]);
        localStorage.setItem(CART_ID_KEY, updatedCart.id);
      }

      dispatch({ type: 'SET_CART', payload: updatedCart });
      dispatch({ type: 'OPEN_CART' });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to add item',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (quantity === 0) {
        const cart = await removeFromCart(cartId, [lineId]);
        dispatch({ type: 'SET_CART', payload: cart });
      } else {
        const cart = await updateCartLine(cartId, lineId, quantity);
        dispatch({ type: 'SET_CART', payload: cart });
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to update cart',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cart = await removeFromCart(cartId, [lineId]);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to remove item',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Filter out zero-quantity lines (stale data guard)
  const cartLines: CartLine[] = (state.cart?.lines.edges.map((e) => e.node) ?? []).filter(
    (line) => line.quantity > 0
  );
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        openCart: () => dispatch({ type: 'OPEN_CART' }),
        closeCart: () => dispatch({ type: 'CLOSE_CART' }),
        cartLines,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
