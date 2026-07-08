import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart as ShoppingCartIcon,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ShoppingCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShoppingCart({ open, onOpenChange }: ShoppingCartProps) {
  const { items, totalPrice, totalItems, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    // Checkout sayfasına git
    navigate("/checkout", { state: { items, totalPrice } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5" />
            Alışveriş Sepeti ({totalItems})
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Sepetiniz boş</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Alışverişe Devam Et
            </Button>
          </div>
        ) : (
          <>
            {/* Ürünler */}
            <div className="space-y-3 py-4">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Resim */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}

                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        ₺{item.price.toLocaleString("tr-TR")}
                      </p>
                    </div>

                    {/* Miktar */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toplam */}
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    {/* Sil */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Özet */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span>₺{totalPrice.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo:</span>
                <span className="text-green-600 font-semibold">Ücretsiz</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Toplam:</span>
                <span>₺{totalPrice.toLocaleString("tr-TR")}</span>
              </div>
            </div>

            {/* Butonlar */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Alışverişe Devam Et
              </Button>
              <Button
                onClick={handleCheckout}
                className="bg-green-600 hover:bg-green-700"
              >
                Ödemeye Geç
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
