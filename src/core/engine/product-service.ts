/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly pv_amount: number;
}

// In-memory Product database
const PRODUCTS_DATABASE: Product[] = [
  { id: "PRD-01", name: "Başlangıç İş Paketi (Starter Kit)", price: 150, pv_amount: 120 },
  { id: "PRD-02", name: "Premium Ürün Seti (Product Bundle)", price: 250, pv_amount: 200 },
  { id: "PRD-03", name: "Süper Gıda ve Vitamin Paketi", price: 100, pv_amount: 80 },
  { id: "PRD-04", name: "Maksimum Sağlık ve Detoks Paketi", price: 400, pv_amount: 320 }
];

// Read-only in-memory storage for product state
let activeProducts = [...PRODUCTS_DATABASE];

export class ProductService {
  /**
   * Retrieves all active products in the system.
   * Returns a frozen copy of each product to prevent external modification.
   */
  public static getAll(): readonly Product[] {
    return activeProducts.map(p => Object.freeze({ ...p }));
  }

  /**
   * Dynamically fetches product by ID.
   * Ensures the data is immutable and up to date.
   */
  public static getById(productId: string): Readonly<Product> {
    const product = activeProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product Service Constraint: Product with ID ${productId} not found.`);
    }
    // Return Object.freeze to guarantee read-only immutability
    return Object.freeze({ ...product });
  }

  /**
   * Dynamically updates product price in the database.
   * Demonstrates real-time price change effect on calculations.
   */
  public static updatePrice(productId: string, newPrice: number): Readonly<Product> {
    if (newPrice < 0) {
      throw new Error("Product Service Constraint: Product price cannot be negative.");
    }
    const index = activeProducts.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error(`Product Service Constraint: Product with ID ${productId} not found.`);
    }

    // Since price is read-only, replace the object
    const original = activeProducts[index];
    const updated = {
      ...original,
      price: newPrice,
      // Keep proportional PV or maintain the same PV
      pv_amount: Math.round(newPrice * 0.8) // Automatically calculate PV as 80% of price
    };

    activeProducts[index] = updated;
    return Object.freeze({ ...updated });
  }

  /**
   * Resets products database to initial defaults
   */
  public static resetToDefaults(): void {
    activeProducts = [...PRODUCTS_DATABASE];
  }
}
