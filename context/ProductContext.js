import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  uploadProductImage,
  API_URL,
} from '@/services/api';

const ProductContext = createContext(null);

// ─── Normalize a backend product for the UI ──────────────────────────────────
// Backend returns `imageUrl` (string|null, may be a relative path like /uploads/...).
// We convert it to a full URL so React Native's <Image> can load it everywhere.
function normalizeProduct(p) {
  const rawUrl = p.imageUrl || null;
  // Prepend API_URL to relative paths; leave full URLs (http/https) as-is
  const fullUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : `${API_URL}${rawUrl}`)
    : null;

  return {
    id:          String(p.id),
    code:        p.code,
    name:        p.name,
    category:    p.category,
    quantity:    p.quantity !== null && p.quantity !== undefined ? Number(p.quantity) : null,
    unit:        p.unit,
    period:      p.period,
    price:       p.price !== null && p.price !== undefined ? Number(p.price) : null,
    currency:    p.currency,
    priceUnit:   p.priceUnit,
    status:      p.status,
    image:       fullUrl ? { uri: fullUrl } : null,
    imageUrl:    fullUrl,
    description: p.description,
    location:    p.location,
    createdAt:   p.createdAt,
    updatedAt:   p.updatedAt,
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data.map(normalizeProduct));
    } catch (err) {
      setError(err?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function addProduct(newProduct) {
    // If the image is a local file:// URI, upload it to the backend first.
    // Preset (require()) images have no URI and are saved as null.
    let imageUrl = null;
    const img = newProduct.image;
    if (img && typeof img === 'object' && img.uri) {
      const uri = img.uri;
      if (uri.startsWith('http') || uri.startsWith('/uploads/')) {
        // Already a server URL or path — use as-is
        imageUrl = uri;
      } else {
        // Local file:// URI — upload to backend, get server path
        imageUrl = await uploadProductImage(uri);
      }
    }

    const payload = {
      name: newProduct.name,
      category: newProduct.category,
      quantity: newProduct.quantity ? Number(newProduct.quantity) : null,
      unit: newProduct.unit || null,
      period: newProduct.period || null,
      price: newProduct.price ? Number(newProduct.price) : null,
      currency: newProduct.currency || 'RWF',
      priceUnit: newProduct.priceUnit || 'Kg',
      status: newProduct.status || 'available',
      imageUrl,
      description: newProduct.description || null,
      location: newProduct.location || null,
    };

    const created = await createProduct(payload);
    const normalized = normalizeProduct(created);
    setProducts((prev) => [normalized, ...prev]);
    return normalized;
  }

  async function deleteProduct(id) {
    await deleteProductApi(id);
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }

  async function updateProduct(id, updatedFields) {
    // If the image is a local file:// URI, upload it to the backend first.
    const apiFields = { ...updatedFields };
    if (apiFields.image) {
      const uri = apiFields.image.uri;
      if (uri && (uri.startsWith('http') || uri.startsWith('/uploads/'))) {
        // Already a server URL or path — use as-is
        apiFields.imageUrl = uri;
      } else if (uri) {
        // Local file:// URI — upload to backend, get server path
        apiFields.imageUrl = await uploadProductImage(uri);
      } else {
        apiFields.imageUrl = null;
      }
      delete apiFields.image;
    }
    const updated = await updateProductApi(id, apiFields);
    const normalized = normalizeProduct(updated);
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? normalized : p))
    );
    return normalized;
  }

  function getProductById(id) {
    if (!id) return null;
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
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
