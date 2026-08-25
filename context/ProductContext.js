import React, { createContext, useContext, useState } from 'react';
import initialProducts from '@/data/products';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  function addProduct(newProduct) {
    const nextId = String(Date.now());
    const nextCode = newProduct.code?.trim() || `16F${String(products.length + 1).padStart(3, '0')}.2026`;
    
    const created = {
      id: nextId,
      code: nextCode,
      name: newProduct.name?.trim() || 'New Product',
      category: newProduct.category || 'Vegetables',
      quantity: newProduct.quantity ? Number(newProduct.quantity) : null,
      unit: newProduct.unit || 'Kg',
      period: newProduct.period || 'Week',
      price: newProduct.price ? Number(newProduct.price) : null,
      currency: newProduct.currency || 'RWF',
      priceUnit: newProduct.priceUnit || 'Kg',
      status: newProduct.status || 'available',
      image: newProduct.image || null,
      description: newProduct.description?.trim() || 'Fresh high-quality produce sourced from Rwandan farmers.',
      location: newProduct.location?.trim() || 'Rwanda',
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [created, ...prev]);
    return created;
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }

  function updateProduct(id, updatedFields) {
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updatedFields } : p))
    );
  }

  function getProductById(id) {
    if (!id) return null;
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        updateProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return ctx;
}
