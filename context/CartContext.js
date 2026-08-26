import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  placeOrder,
  getOrders,
  updateOrderStatus as updateOrderStatusApi,
  deleteOrder as deleteOrderApi,
} from '@/services/api';

const CartContext = createContext(null);

// ─── Normalize a backend order for the UI ────────────────────────────────────
// The backend order.product snapshot uses `imageUrl`; screens render `image`.
function normalizeOrder(o) {
  const product = o.product
    ? {
        ...o.product,
        image: o.product.imageUrl ? { uri: o.product.imageUrl } : null,
      }
    : null;
  return {
    id:            String(o.id),
    customerName:  o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    product,
    quantity:      o.quantity !== null && o.quantity !== undefined ? Number(o.quantity) : null,
    unit:          o.unit,
    totalPrice:    o.totalPrice !== null && o.totalPrice !== undefined ? Number(o.totalPrice) : null,
    currency:      o.currency,
    deliveryDate:  o.deliveryDate,
    orderDate:     o.orderDate,
    notes:         o.notes,
    status:        o.status,
    createdAt:     o.createdAt,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch all orders from the API (admin — requires JWT) ──────────────────
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.map(normalizeOrder));
    } catch (err) {
      // Non-fatal: leave existing orders in place
      console.warn('fetchOrders failed:', err?.message || err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  function addToCart(product, orderDetails) {
    const newItem = {
      product,
      quantity: orderDetails.quantity || 1,
      orderDetails,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    setCartItems((prev) => [...prev, newItem]);
    return newItem;
  }

  async function submitDirectOrder(product, orderDetails) {
    setSubmitting(true);
    try {
      const payload = {
        customerName:  orderDetails.clientName || 'Valued Customer',
        customerPhone: orderDetails.clientPhone || null,
        customerEmail: orderDetails.clientEmail || null,
        product,
        quantity:      orderDetails.quantity || 1,
        unit:          orderDetails.unit || 'Kg',
        totalPrice:    product.price ? product.price * (orderDetails.quantity || 1) : null,
        currency:      product.currency || 'RWF',
        deliveryDate:  orderDetails.deliveryDate || null,
        notes:         orderDetails.notes || null,
      };
      const created = await placeOrder(payload);
      const normalized = normalizeOrder(created);
      setOrders((prev) => [normalized, ...prev]);
      return normalized;
    } finally {
      setSubmitting(false);
    }
  }

  async function checkoutCart(customerInfo = {}) {
    if (cartItems.length === 0) return [];

    setSubmitting(true);
    try {
      // Submit each cart item; use allSettled so partial failures are reported.
      const results = await Promise.allSettled(
        cartItems.map((item) => {
          const details = item.orderDetails || {};
          return placeOrder({
            customerName:  details.clientName || customerInfo.name || 'Valued Customer',
            customerPhone: details.clientPhone || customerInfo.phone || null,
            customerEmail: details.clientEmail || customerInfo.email || null,
            product:       item.product,
            quantity:      item.quantity,
            unit:          details.unit || 'Kg',
            totalPrice:    item.product.price ? item.product.price * item.quantity : null,
            currency:      item.product.currency || 'RWF',
            deliveryDate:  details.deliveryDate || null,
            notes:         details.notes || 'Order placed via cart checkout.',
          });
        })
      );

      const succeeded = [];
      const failedIndices = [];
      let failureCount = 0;

      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          succeeded.push(normalizeOrder(r.value));
        } else {
          failureCount += 1;
          failedIndices.push(idx);
        }
      });

      if (succeeded.length > 0) {
        setOrders((prev) => [...succeeded, ...prev]);
        // Keep only the cart items whose submission failed.
        setCartItems((prev) => prev.filter((_, idx) => failedIndices.includes(idx)));
      }

      return { succeeded, failureCount };
    } finally {
      setSubmitting(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    await updateOrderStatusApi(orderId, newStatus);
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  }

  async function deleteOrder(orderId) {
    await deleteOrderApi(orderId);
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  }

  function removeFromCart(itemId) {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        ordersLoading,
        submitting,
        fetchOrders,
        addToCart,
        submitDirectOrder,
        checkoutCart,
        updateOrderStatus,
        deleteOrder,
        removeFromCart,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
