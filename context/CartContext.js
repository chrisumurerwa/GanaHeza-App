import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

const INITIAL_ORDERS = [
  {
    id: 'ORD-7821',
    customerName: 'Jean Paul Mugisha',
    customerPhone: '+250 788 123 456',
    customerEmail: 'mugisha.jp@gmail.com',
    product: {
      id: '2',
      name: 'Avocado Hass',
      category: 'Fruits',
      code: '16F002.2026',
      price: 1200,
      currency: 'RWF',
      priceUnit: 'Kg',
      image: require('@/assets/images/avocado.jpg'),
      location: 'Western Province, Rwanda',
    },
    quantity: 5,
    unit: 'Tonnes',
    totalPrice: 6000000,
    currency: 'RWF',
    deliveryDate: '28 Aug 2026',
    orderDate: '25 Aug 2026, 09:15 AM',
    notes: 'Require export-grade packing for air freight delivery to Kigali Airport.',
    status: 'Pending',
  },
  {
    id: 'ORD-7820',
    customerName: 'Marie Claire Uwase',
    customerPhone: '+250 783 987 654',
    customerEmail: 'uwase.marie@agrodealers.rw',
    product: {
      id: '1',
      name: 'Habanero',
      category: 'Vegetables',
      code: '16F001.2026',
      price: 1500,
      currency: 'RWF',
      priceUnit: 'Kg',
      image: require('@/assets/images/habanero.jpg'),
      location: 'Northern Province, Rwanda',
    },
    quantity: 250,
    unit: 'Kg',
    totalPrice: 375000,
    currency: 'RWF',
    deliveryDate: '30 Aug 2026',
    orderDate: '24 Aug 2026, 02:40 PM',
    notes: 'Please ensure fresh harvest within 24 hours before pickup in Musanze.',
    status: 'Confirmed',
  },
  {
    id: 'ORD-7819',
    customerName: 'Emmanuel Hakizimana',
    customerPhone: '+250 785 456 789',
    customerEmail: 'e.hakizimana@hoteldesmilles.rw',
    product: {
      id: '5',
      name: 'Inyanya',
      category: 'Vegetables',
      code: '16F005.2026',
      price: 800,
      currency: 'RWF',
      priceUnit: 'Kg',
      image: require('@/assets/images/tomatoes.jpg'),
      location: 'Eastern Province, Rwanda',
    },
    quantity: 100,
    unit: 'Kg',
    totalPrice: 80000,
    currency: 'RWF',
    deliveryDate: '26 Aug 2026',
    orderDate: '23 Aug 2026, 11:05 AM',
    notes: 'Weekly fresh delivery for restaurant supply.',
    status: 'Delivered',
  },
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

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

  function submitDirectOrder(product, orderDetails) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderDetails.clientName || 'Valued Customer',
      customerPhone: orderDetails.clientPhone || '+250 780 000 000',
      customerEmail: orderDetails.clientEmail || 'customer@example.com',
      product,
      quantity: orderDetails.quantity || 1,
      unit: orderDetails.unit || 'Kg',
      totalPrice: product.price ? product.price * (orderDetails.quantity || 1) : null,
      currency: product.currency || 'RWF',
      deliveryDate: orderDetails.deliveryDate || 'As soon as available',
      orderDate: formattedDate,
      notes: orderDetails.notes || 'No additional notes provided.',
      status: 'Pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }

  function checkoutCart(customerInfo = {}) {
    if (cartItems.length === 0) return [];
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newSubmittedOrders = cartItems.map((item, index) => {
      const details = item.orderDetails || {};
      return {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000) + index}`,
        customerName: details.clientName || customerInfo.name || 'Valued Customer',
        customerPhone: details.clientPhone || customerInfo.phone || '+250 780 000 000',
        customerEmail: details.clientEmail || customerInfo.email || '',
        product: item.product,
        quantity: item.quantity,
        unit: details.unit || 'Kg',
        totalPrice: item.product.price ? item.product.price * item.quantity : null,
        currency: item.product.currency || 'RWF',
        deliveryDate: details.deliveryDate || 'As agreed upon',
        orderDate: formattedDate,
        notes: details.notes || 'Order placed via cart checkout.',
        status: 'Pending',
      };
    });

    setOrders((prev) => [...newSubmittedOrders, ...prev]);
    setCartItems([]);
    return newSubmittedOrders;
  }

  function updateOrderStatus(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  }

  function deleteOrder(orderId) {
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
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
