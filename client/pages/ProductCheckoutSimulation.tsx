import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export default function ProductCheckoutSimulation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const productId = searchParams.get("productId") || "";
  const buyerEmail = searchParams.get("buyerEmail") || "";
  const referralCode = searchParams.get("referralCode") || "";
  const shippingAddressString = searchParams.get("shippingAddress") || "{}";
  const shippingOption = searchParams.get("shippingOption") || "";
  const userId = searchParams.get("userId") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("313");
  const [cardName, setCardName] = useState("");

  const parsedAddress: any = (() => {
    try {
      return JSON.parse(shippingAddressString);
    } catch (e) {
      return { address: shippingAddressString };
    }
  })();

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoadingProduct(false);
        return;
      }
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.product) {
            setProduct(data.product);
          }
        }
      } catch (err) {
        console.error("Error fetching product details for checkout simulation:", err);
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch("/api/stripe/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          buyerEmail,
          referralCode,
          shippingAddress: shippingAddressString,
          shippingOption,
          userId
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        toast({
          title: "🎉 Ödeme Başarılı",
          description: "Siparişiniz onaylandı ve aktifliğiniz güncellendi."
        });

        // Redirect to member panel after 3 seconds
        setTimeout(() => {
          navigate("/member-panel");
        }, 3000);
      } else {
        toast({
          title: "❌ Ödeme Başarısız",
          description: data.error || "Ödeme gerçekleştirilirken bir sorun oluştu.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Error completing simulated payment:", err);
      toast({
        title: "❌ Hata",
        description: "Sistem hatası nedeniyle ödeme kaydedilemedi.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    toast({
      title: "ℹ️ Ödeme İptal Edildi",
      description: "Ödeme işlemi kullanıcı tarafından iptal edildi."
    });
    navigate(-1);
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4" id="sim-loading-container">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Stripe Ödeme Sayfası Güvenli Bağlantı Kuruluyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" id="sim-main-container">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column: Checkout card */}
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-lg border-2 border-slate-100" id="payment-card">
            <CardHeader className="bg-slate-950 text-white rounded-t-lg flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  Stripe Ödeme Geçidi
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Güvenli Kartlı Ödeme Simülasyonu
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Test Modu
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 transition-all text-center space-y-4" id="p-success">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <h3 className="text-2xl font-bold text-slate-900">Ödemeniz Tamamlandı!</h3>
                  <p className="text-muted-foreground">
                    Siparişiniz başarıyla alındı ve üyelik aktifliğiniz sisteme işlendi.
                  </p>
                  <p className="text-sm font-semibold text-primary animate-pulse">
                    Yönlendiriliyorsunuz, lütfen bekleyin...
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePay} className="space-y-4" id="pay-form">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-slate-700 font-medium">Kart Numarası</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        className="pl-10 text-lg font-mono tracking-widest"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        required
                        disabled={processing}
                      />
                      <CreditCard className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry" className="text-slate-700 font-medium">Son Kullanma (AA/YY)</Label>
                      <Input
                        id="cardExpiry"
                        className="text-center font-mono"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        required
                        disabled={processing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc" className="text-slate-700 font-medium font-mono">CVC</Label>
                      <Input
                        id="cardCvc"
                        className="text-center font-mono"
                        type="password"
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="***"
                        required
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-slate-700 font-medium">Kart Sahibi Adı Soyadı</Label>
                    <Input
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="AD SOYAD"
                      required
                      disabled={processing}
                    />
                  </div>

                  <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-lg flex items-start gap-2.5 mt-4">
                    <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-sky-700">
                      <strong>Stripe Sandbox:</strong> Bu bir ödeme simülasyonudur. Gerçek banka hesap detaylarınızı veya kredi kartı bilgilerinizi paylaşmayın. "Ödeme Tamamla" butonuna bastığınızda satın alma işleminiz test olarak onaylanacaktır.
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex justify-center items-center gap-2 text-slate-600"
                      onClick={handleCancel}
                      disabled={processing}
                      id="cancel-btn"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      İptal Et
                    </Button>
                    <Button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold flex justify-center items-center gap-2"
                      disabled={processing}
                      id="submit-btn"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Ödeniyor...
                        </>
                      ) : (
                        <>
                          Şimdi Öde: ${product ? product.price : "0.00"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm" id="summary-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-semibold text-slate-900 tracking-wider uppercase flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                Sipariş Özeti
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4 text-sm text-slate-600">
              {product ? (
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category || "Paket"}</p>
                  </div>
                  <p className="font-bold text-slate-900">${product.price}</p>
                </div>
              ) : (
                <div className="text-center font-bold text-red-500 py-2">
                  Ürün Bilgisi Yüklenemedi!
                </div>
              )}

              <div className="space-y-2 border-b border-slate-100 pb-4 flex flex-col">
                <Label className="text-slate-500 text-xs uppercase font-semibold">Alıcı E-Posta</Label>
                <span className="font-medium text-slate-800 font-mono text-xs">{buyerEmail || "-"}</span>
              </div>

              {referralCode && (
                <div className="space-y-1 border-b border-slate-100 pb-4 flex flex-col">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">Referans Kodu</Label>
                  <span className="font-medium text-primary text-xs tracking-wider">{referralCode}</span>
                </div>
              )}

              {parsedAddress.fullName && (
                <div className="space-y-1 flex flex-col text-xs leading-relaxed">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">Teslimat Adresi</Label>
                  <span className="font-semibold text-slate-800">{parsedAddress.fullName}</span>
                  <span className="text-muted-foreground">{parsedAddress.addressLine1} {parsedAddress.addressLine2 || ""}</span>
                  <span className="text-muted-foreground">{parsedAddress.city}, {parsedAddress.state} - {parsedAddress.zipCode}</span>
                  <span className="text-muted-foreground">{parsedAddress.country}</span>
                </div>
              )}

              <div className="bg-slate-50/70 p-4 rounded-lg flex justify-between items-center font-bold text-slate-900 border border-slate-100 mt-6">
                <span>Ödenecek Toplam:</span>
                <span className="text-lg text-emerald-600">${product ? product.price : "0.00"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
