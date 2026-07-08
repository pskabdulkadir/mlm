import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  Loader,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface OrderState {
  items: any[];
  totalPrice: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { toast } = useToast();

  const orderState = location.state as OrderState || {
    items: [],
    totalPrice: 0,
  };

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "credit-card",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurunuz",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address || !formData.city || !formData.zipCode) {
      toast({
        title: "Hata",
        description: "Lütfen adres bilgilerini tamamlayınız",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.paymentMethod === "credit-card") {
      if (!formData.cardName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        toast({
          title: "Hata",
          description: "Lütfen kredi kartı bilgilerini tamamlayınız",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      await handlePayment();
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simüle payment API çağrısı
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Başarılı",
        description: "Ödemeniz başarıyla alındı!",
      });

      setOrderComplete(true);
      clearCart();

      // 3 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        navigate("/member-panel");
      }, 3000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ödeme işlemi başarısız oldu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Sipariş Alındı!</h1>
          <p className="text-gray-600 mb-4">
            Siparişiniz başarıyla tamamlandı. Yönlendiriliyorsunuz...
          </p>
          <div className="text-xl font-bold text-green-600">
            ₺{orderState.totalPrice.toLocaleString("tr-TR")}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Alışverişe Dön
          </Button>
          <h1 className="text-4xl font-bold">Ödeme</h1>
          <p className="text-gray-600 mt-2">
            Siparişinizi tamamlamak için adımları izleyin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Progress */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <motion.div
                      animate={{
                        backgroundColor: step >= s ? "#3b82f6" : "#e5e7eb",
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    >
                      {s < step ? <Check className="w-5 h-5" /> : s}
                    </motion.div>
                    {s < 3 && (
                      <div
                        className={`w-12 h-1 ${
                          step > s ? "bg-blue-500" : "bg-gray-300"
                        } mx-2`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Kişisel Bilgiler</h2>

                  <div>
                    <Label>Ad Soyad</Label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Adınız Soyadınız"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Telefon</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+90 5XX XXX XXXX"
                      className="mt-1"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Teslimat Adresi</h2>

                  <div>
                    <Label>Adres</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Sokak, apt/ev no."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Şehir</Label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="İstanbul"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Posta Kodu</Label>
                      <Input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="34000"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Ödeme Yöntemi</h2>

                  <div>
                    <Label>Ödeme Yöntemi Seçin</Label>
                    <Select value={formData.paymentMethod} onValueChange={handleSelectChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Kredi Kartı</SelectItem>
                        <SelectItem value="debit-card">Banka Kartı</SelectItem>
                        <SelectItem value="bank-transfer">Banka Transferi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod === "credit-card" && (
                    <>
                      <div>
                        <Label>Kart Sahibinin Adı</Label>
                        <Input
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="Kart sahibinin adı soyadı"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Kart Numarası</Label>
                        <Input
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Son Kullanma Tarihi</Label>
                          <Input
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength="3"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                )}
                <Button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {step === 3 ? "Ödemeyi Tamamla" : "İleri"}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderState.items?.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam:</span>
                    <span>₺{orderState.totalPrice.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo:</span>
                    <span className="text-green-600 font-semibold">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Toplam:</span>
                    <span>₺{orderState.totalPrice.toLocaleString("tr-TR")}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Güvenli ödeme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Ücretsiz kargo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Tüm kartlar kabul edilir</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
