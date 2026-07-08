import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  isActive: boolean;
  isDigital?: boolean;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ürünleri API'den çek
  const refreshProducts = async () => {
    try {
      setError(null);
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Ürünler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede ve polling interval'de çek
  useEffect(() => {
    refreshProducts();

    // Her 10 saniyede bir güncelle (real-time efekti)
    const interval = setInterval(() => {
      refreshProducts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return context;
}
