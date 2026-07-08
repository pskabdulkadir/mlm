import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Package,
  DollarSign,
  Tag,
  Star,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Film,
  FileText,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  features: string[];
  inStock: boolean;
  isDigital: boolean;
  downloadUrl?: string;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Kitap", "Kurs", "Yazılım", "Hizmet", "Diğer"
  ]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error message after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    imageFile: null as File | null,
    productFile: "",
    productFileObj: null as File | null,
    category: "",
    categories: [] as string[],
    newCategory: "",
    features: "",
    inStock: true,
    isDigital: false,
    downloadUrl: "",
  });

  useEffect(() => {
    loadProducts();

    // Auto-refresh admin products every 30 seconds
    const refreshInterval = setInterval(() => {
      loadProducts();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadProducts = async () => {
    try {
      console.log("📦 Loading admin products...");
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/products/admin/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${data.total || data.products?.length || 0} products loaded`);
        setProducts(data.products || []);
        setError("");
      } else {
        console.error("API error:", data.error);
        setError(data.error || "Ürünler yüklenemedi.");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Ürünler yüklenirken hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      image: "",
      imageFile: null,
      productFile: "",
      productFileObj: null,
      category: "",
      categories: [],
      newCategory: "",
      features: "",
      inStock: true,
      isDigital: false,
      downloadUrl: "",
    });
    setEditingProduct(null);
  };

  // Ürün Görseli yükleme handler (sadece resimler)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Ürün Dosyası yükleme handler (tüm dosya türleri)
  const handleProductFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          productFileObj: file,
          productFile: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Yeni kategori ekleme
  const handleAddCategory = () => {
    if (formData.newCategory.trim()) {
      const newCat = formData.newCategory.trim();
      if (!categories.includes(newCat)) {
        setCategories([...categories, newCat]);
        setFormData(prev => ({
          ...prev,
          category: newCat,
          newCategory: "",
        }));
      } else {
        setError("Bu kategori zaten mevcut");
      }
    }
  };

  const handleCreate = async () => {
    try {
      setError("");

      // Detaylı alan validasyonu
      const errors: string[] = [];

      // Adı kontrol et
      if (!formData.name || formData.name.trim() === "") {
        errors.push("Ürün Adı boş olamaz");
      }

      // Açıklamayı kontrol et
      if (!formData.description || formData.description.trim() === "") {
        errors.push("Açıklama boş olamaz");
      }

      // Fiyatı kontrol et
      if (!formData.price || formData.price.trim() === "") {
        errors.push("Fiyat boş olamaz");
      } else if (isNaN(Number(formData.price))) {
        errors.push("Fiyat sayı olmalıdır");
      }

      // Resmi kontrol et
      if (!formData.image || formData.image.trim() === "") {
        errors.push("Ürün Resmi gereklidir");
      }

      // Kategoriyi kontrol et
      const category = formData.category ? formData.category.trim() : "";
      if (!category || category === "new" || category === "") {
        errors.push("Kategori seçilmeli veya yeni kategori adı girilmelidir");
      }

      // Hata varsa göster
      if (errors.length > 0) {
        setError(errors.join("\n"));
        return;
      }

      // Ürün verilerini hazırla
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image,
        category: category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        features: formData.features.split(",").map(f => f.trim()).filter(f => f),
        inStock: formData.inStock,
        isDigital: formData.isDigital,
        downloadUrl: formData.downloadUrl,
        autoIntegratePOS: true,
      };

      console.log("📤 Sending product data to server:", productData);
      const response = await fetch("/api/products/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      console.log("📥 Server response:", data);

      if (data.success) {
        setSuccess(`✅ Ürün "${formData.name}" başarıyla oluşturuldu!`);
        setShowCreateDialog(false);
        resetForm();
        setTimeout(() => loadProducts(), 500); // Wait a moment for DB to settle
      } else {
        console.error("Server error:", data.error);
        setError(data.error || "Ürün oluşturulamadı. Lütfen alanları kontrol edin.");
      }
    } catch (error) {
      console.error("Create product error:", error);
      setError("Ürün oluşturulurken hata oluştu: " + error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      setError("");

      // Kategori validasyonu
      const category = formData.category;
      if (!category || category === "new") {
        setError("Lütfen bir kategori seçin veya yeni kategori adı girin.");
        return;
      }

      if (!formData.name || !formData.description || !formData.price || !formData.image) {
        setError("Lütfen tüm gerekli alanları doldurun: Ürün Adı, Açıklama, Fiyat, Ürün Resmi.");
        return;
      }

      // Image validation - supports URLs and base64 data
      // No validation needed - supports http URLs, data:image/..., etc.

      const response = await fetch(`/api/products/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          category: category.trim(),
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          features: formData.features.split(",").map(f => f.trim()).filter(f => f),
          isDigital: formData.isDigital,
          downloadUrl: formData.downloadUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Ürün "${formData.name}" başarıyla güncellendi!`);
        setEditingProduct(null);
        resetForm();
        loadProducts();
      } else {
        setError(data.error || "Ürün güncellenemedi.");
      }
    } catch (error) {
      console.error("Update product error:", error);
      setError("Ürün güncellenirken hata oluştu: " + error.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Ürün başarıyla silindi! Ana sayfadan kaldırıldı.");
        loadProducts();
      } else {
        setError(data.error || "Ürün silinemedi.");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Ürün silinirken hata oluştu.");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      image: product.image,
      category: product.category,
      features: product.features?.join(", ") || "",
      inStock: product.inStock,
      isDigital: product.isDigital || false,
      downloadUrl: product.downloadUrl || "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ürün Yönetimi</h2>
          <p className="text-muted-foreground">Ürünleri ekleyin, düzenleyin ve yönetin - Ana sayfada otomatik gösterilir</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Ana Sayfa Koleksiyonu
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Alert className="border-blue-200 bg-blue-50">
        <Package className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          <div className="space-y-3">
            <div>
              <p><strong>🚀 Otomatik Entegrasyon:</strong> Eklediğiniz ürünler ana sayfadaki "Premium Ürün Koleksiyonu" bölümünde ve tüm üye mağazalarında otomatik görüntülenir</p>
            </div>
            <div>
              <p><strong>🔄 Sınırsız Ürün:</strong> İstediğiniz kadar ürün ekleyebilir, sistem kapasitesi sınırı yoktur</p>
            </div>
            <div>
              <p><strong>💰 POS & E-Ticaret Entegrasyonu:</strong> Her yeni ürün otomatik olarak sanal POS sistemi, ödeme sistemi ve e-ticaret platformu ile entegre edilir</p>
            </div>
            <div>
              <p><strong>📊 Monoline MLM Komisyon Dağıtımı - Toplam %50:</strong></p>
              <ul className="ml-6 mt-2 space-y-1 text-sm font-medium">
                <li>✓ <strong>%25 Sponsor Bonus:</strong> Doğrudan yukarı sponsor'un hesabına ödenir</li>
                <li>✓ <strong>%15 Seviye Komisyonu:</strong> Monoline yapısında 7 seviye derinliğine dağıtılır</li>
                <li>✓ <strong>%10 Pasif Havuz Geliri:</strong> Ağ genel fonuna yatırılır ve tüm üyelere dağıtılır</li>
              </ul>
            </div>
            <div>
              <p><strong>⚡ Gerçek Zamanlı Senkronizasyon:</strong> Ürün eklemeler, düzenlemeler ve silmeler tüm sistemlere anında yansır</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ürün Listesi ({products.length} Ürün)
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Sınırsız Ekleme Aktif
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Monoline Komisyon (%50)</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id || product._id || product.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        <span className="font-semibold text-green-600">${(product.price * 0.50).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-2">(toplam)</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>🎯 Sponsor: ${(product.price * 0.25).toFixed(2)}</div>
                        <div>📊 Seviye (7): ${(product.price * 0.15).toFixed(2)}</div>
                        <div>💰 Pasif Havuz: ${(product.price * 0.10).toFixed(2)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "Mevcut" : "Tükendi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>Yeni ürün bilgilerini girin ve sisteme ekleyin.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm mt-2 text-yellow-800">
                  <strong>💡 Bilgi:</strong> Eklediğiniz ürün otomatik olarak tüm ana sayfa, üye mağazaları ve POS sistemine entegre olacak. <strong>%50 Monoline MLM komisyonu</strong> (%25 sponsor + %15 seviye + %10 pasif havuz) otomatik dağıtılır.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ürün adını girin"
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori * (Mevcut veya Yeni)</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, category: value });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Yeni kategori ekleme */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Yeni kategori adı"
                    value={formData.newCategory || ""}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCategory}
                    className="whitespace-nowrap"
                  >
                    + Ekle
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Eski Fiyat ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productImage">Ürün Görseli (Resim) *</Label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition bg-purple-50">
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="productImage" className="cursor-pointer block">
                    <ImageIcon className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                    <p className="text-sm text-purple-700 font-semibold">
                      Ürün Resmini Seç
                    </p>
                    <p className="text-xs text-purple-500 mt-2">
                      Tüm resim formatları: PNG, JPG, JPEG, GIF, WebP, SVG
                    </p>
                    {formData.imageFile && (
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ {formData.imageFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="productFile">Ürün Dosyası (PDF, Video, Word vb) - İsteğe Bağlı</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition bg-blue-50">
                  <input
                    id="productFile"
                    type="file"
                    accept=".pdf,.mp4,.webm,.mov,.avi,.doc,.docx,.txt,.zip,.rar"
                    onChange={handleProductFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="productFile" className="cursor-pointer block">
                    <FileText className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                    <p className="text-sm text-blue-700 font-semibold">
                      Dosya Seç veya Sürükle
                    </p>
                    <p className="text-xs text-blue-500 mt-2">
                      PDF, Video (MP4, WebM, MOV, AVI), Word (.doc, .docx), Metin, ZIP, RAR
                    </p>
                    {formData.productFileObj && (
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ {formData.productFileObj.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün açıklaması"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                <Textarea
                  id="features"
                  value={formData.features || ""}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="UV400 Koruma, Polarize Cam, Metal Çerçeve"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <Label htmlFor="inStock">Stokta mevcut</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={formData.isDigital}
                    onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                  />
                  <Label htmlFor="isDigital" className="text-purple-600 font-semibold">Dijital Ürün (İndirilebilir)</Label>
                </div>
              </div>

              {formData.isDigital && (
                <div>
                  <Label htmlFor="downloadUrl">İndirme Linki / Dosya URL *</Label>
                  <Input
                    id="downloadUrl"
                    value={formData.downloadUrl || ""}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="https://example.com/file.zip"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Ürün satın alındıktan sonra bu link alıcıya panelinde gösterilir.
                  </p>
                </div>
              )}

              {formData.image && (
                <div>
                  <Label>Ürün Görseli Ön İzlemesi</Label>
                  <div className="bg-purple-50 rounded border border-purple-200 p-4">
                    {formData.image.startsWith('data:image') || formData.image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <img
                        src={formData.image}
                        alt="Görsel Ön İzlemesi"
                        className="w-full max-h-40 object-contain rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-purple-100 rounded">
                        <p className="text-sm text-purple-600 font-semibold">Geçersiz resim formatı</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.productFile && (
                <div>
                  <Label>Ürün Dosyası Ön İzlemesi</Label>
                  <div className="bg-blue-50 rounded border border-blue-200 p-4">
                    {formData.productFile.startsWith('data:application/pdf') || formData.productFile.match(/\.pdf$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-red-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-red-500 mb-2" />
                          <p className="text-sm font-semibold text-red-700">PDF Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(mp4|webm|mov|avi)$/i) || formData.productFile.startsWith('data:video') ? (
                      <div className="flex items-center justify-center h-32 bg-blue-100 rounded">
                        <div className="text-center">
                          <Film className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                          <p className="text-sm font-semibold text-blue-700">Video Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(doc|docx)$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-purple-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                          <p className="text-sm font-semibold text-purple-700">Word Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(zip|rar)$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-orange-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                          <p className="text-sm font-semibold text-orange-700">Sıkıştırılmış Dosya</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.txt$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">Metin Dosyası</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600 font-semibold">{formData.productFileObj?.name || "Bilinmeyen dosya"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Ürün Ekle
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => {
        setEditingProduct(null);
        resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>Ürün bilgilerini güncelleyin.</p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm mt-2 text-blue-800">
                  <strong>📌 Not:</strong> Yapılan değişiklikler tüm sistemlere (ana sayfa, mağazalar, POS) anında yansıyacaktır. Değişiklik yapılsa da %50 Monoline MLM komisyon oranı (%25 sponsor + %15 seviye + %10 pasif havuz) sabit kalır.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Ürün Adı *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Kategori *</Label>
                <Select
                  value={(formData.category === "new" ? "" : formData.category) || ""}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Yeni Kategori Ekle</SelectItem>
                  </SelectContent>
                </Select>
                {formData.category === "new" && (
                  <Input
                    className="mt-2"
                    placeholder="Yeni kategori adını girin"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    autoFocus
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Fiyat ($) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-originalPrice">Eski Fiyat ($)</Label>
                  <Input
                    id="edit-originalPrice"
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-productImage">Ürün Görseli (Resim) *</Label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition bg-purple-50">
                  <input
                    id="edit-productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="edit-productImage" className="cursor-pointer block">
                    <ImageIcon className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                    <p className="text-sm text-purple-700 font-semibold">
                      Ürün Resmini Seç
                    </p>
                    <p className="text-xs text-purple-500 mt-2">
                      Tüm resim formatları: PNG, JPG, JPEG, GIF, WebP, SVG
                    </p>
                    {formData.imageFile && (
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ {formData.imageFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-productFile">Ürün Dosyası (PDF, Video, Word vb) - İsteğe Bağlı</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition bg-blue-50">
                  <input
                    id="edit-productFile"
                    type="file"
                    accept=".pdf,.mp4,.webm,.mov,.avi,.doc,.docx,.txt,.zip,.rar"
                    onChange={handleProductFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="edit-productFile" className="cursor-pointer block">
                    <FileText className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                    <p className="text-sm text-blue-700 font-semibold">
                      Dosya Seç veya Sürükle
                    </p>
                    <p className="text-xs text-blue-500 mt-2">
                      PDF, Video (MP4, WebM, MOV, AVI), Word (.doc, .docx), Metin, ZIP, RAR
                    </p>
                    {formData.productFileObj && (
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ {formData.productFileObj.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Açıklama *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-features">Özellikler</Label>
                <Textarea
                  id="edit-features"
                  value={formData.features || ""}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <Label htmlFor="edit-inStock">Stokta mevcut</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isDigital"
                    checked={formData.isDigital}
                    onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                  />
                  <Label htmlFor="edit-isDigital" className="text-purple-600 font-semibold">Dijital Ürün (İndirilebilir)</Label>
                </div>
              </div>

              {formData.isDigital && (
                <div>
                  <Label htmlFor="edit-downloadUrl">İndirme Linki / Dosya URL *</Label>
                  <Input
                    id="edit-downloadUrl"
                    value={formData.downloadUrl || ""}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  />
                </div>
              )}

              {formData.image && (
                <div>
                  <Label>Ürün Görseli Ön İzlemesi</Label>
                  <div className="bg-purple-50 rounded border border-purple-200 p-4">
                    {formData.image.startsWith('data:image') || formData.image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <img
                        src={formData.image}
                        alt="Görsel Ön İzlemesi"
                        className="w-full max-h-40 object-contain rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-purple-100 rounded">
                        <p className="text-sm text-purple-600 font-semibold">Geçersiz resim formatı</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.productFile && (
                <div>
                  <Label>Ürün Dosyası Ön İzlemesi</Label>
                  <div className="bg-blue-50 rounded border border-blue-200 p-4">
                    {formData.productFile.startsWith('data:application/pdf') || formData.productFile.match(/\.pdf$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-red-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-red-500 mb-2" />
                          <p className="text-sm font-semibold text-red-700">PDF Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(mp4|webm|mov|avi)$/i) || formData.productFile.startsWith('data:video') ? (
                      <div className="flex items-center justify-center h-32 bg-blue-100 rounded">
                        <div className="text-center">
                          <Film className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                          <p className="text-sm font-semibold text-blue-700">Video Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(doc|docx)$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-purple-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                          <p className="text-sm font-semibold text-purple-700">Word Dosyası</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.(zip|rar)$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-orange-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                          <p className="text-sm font-semibold text-orange-700">Sıkıştırılmış Dosya</p>
                        </div>
                      </div>
                    ) : formData.productFile.match(/\.txt$/i) ? (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">Metin Dosyası</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600 font-semibold">{formData.productFileObj?.name || "Bilinmeyen dosya"}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdate} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Güncelle
            </Button>
            <Button variant="outline" onClick={() => {
              setEditingProduct(null);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductManagement;
