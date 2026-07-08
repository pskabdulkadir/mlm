import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types for E-Wallet
interface WalletBalance {
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  balance: number;
  frozen: number;
  available: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: 'TRY' | 'USD' | 'EUR' | 'BTC';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  reference?: string;
  fee?: number;
  description: string;
  fromAddress?: string;
  toAddress?: string;
}

interface WithdrawRequest {
  currency: 'USD';
  amount: number;
  method: 'stripe';
  notes?: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
}

export default function EWallet() {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Modal States
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  // Form States
  const [withdrawForm, setWithdrawForm] = useState<WithdrawRequest>({
    currency: 'USD',
    amount: 0,
    method: 'stripe'
  });
  
  // UI States
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [pendingOperation, setPendingOperation] = useState<any>(null);

  // Load wallet data
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Load user profile
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Load balances
      const balancesResponse = await fetch('/api/wallet/balances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (balancesResponse.ok) {
        const balancesData = await balancesResponse.json();
        const apiBalances = balancesData.balances;
        
        let usdBalance = 0;
        if (apiBalances) {
          if (Array.isArray(apiBalances)) {
            const usdObj = apiBalances.find((b: any) => b.currency === "USD");
            usdBalance = usdObj ? (usdObj.balance || 0) : 0;
          } else if (typeof apiBalances === "object") {
            usdBalance = typeof apiBalances.balance === "number" ? apiBalances.balance : 0;
          }
        }

        setBalances([
          { currency: 'USD', balance: usdBalance, frozen: 0, available: usdBalance },
        ]);
      }
      
      // Load transactions
      const transactionsResponse = await fetch('/api/wallet/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        // Defensive: ensure transactions is an array
        const txArray = Array.isArray(transactionsData.transactions)
          ? transactionsData.transactions
          : (transactionsData?.transactions || []);

        const mapped = txArray.map((t: any, idx: number) => ({
          id: t.id || t._id || t.reference || `tx-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          type: t.type || 'unknown',
          currency: t.currency || 'TRY',
          amount: t.amount || 0,
          status: t.status || 'pending',
          date: t.date ? new Date(t.date).toISOString() : (t.createdAt || new Date().toISOString()),
          reference: t.reference || '',
          fee: t.fee || 0,
          description: t.description || '',
          fromAddress: t.fromAddress || '',
          toAddress: t.toAddress || '',
        }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleWithdraw = async () => {
    try {
      if (!withdrawForm.amount || withdrawForm.amount <= 0) {
        alert('Lütfen geçerli bir tutar girin.');
        return;
      }

      const selectedBalance = balances.find(b => b.currency === withdrawForm.currency);
      if (!selectedBalance || withdrawForm.amount > selectedBalance.available) {
        alert('Yetersiz bakiye.');
        return;
      }

      if (!user?.stripeAccountId || !user?.stripeOnboardingComplete) {
        alert('Lütfen önce Stripe hesabınızı bağlayın.');
        return;
      }

      setPendingOperation(withdrawForm);
      setConfirmDialog(true);
    } catch (error) {
      console.error('Withdraw validation error:', error);
    }
  };

  const confirmWithdraw = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingOperation)
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawModal(false);
        setConfirmDialog(false);
        setWithdrawForm({
          currency: 'USD',
          amount: 0,
          method: 'stripe'
        });
        setPendingOperation(null);
        alert(data.message || '✅ İşlem başarıyla gerçekleştirildi.');
        loadWalletData();
      } else {
        let message = `${response.status} ${response.statusText}`;
        try {
          const error = await response.json();
          message = error.error || error.message || message;
        } catch (e) {
          // ignore parsing error
        }
        alert(`❌ Hata: ${message}`);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('❌ Para çekme işleminde hata oluştu.');
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      default: return '$';
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case 'USD': return 'Amerikan Doları';
      default: return currency;
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    const safeAmount = amount ?? 0;
    return `${getCurrencyIcon(currency)}${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTotalValueInUSD = () => {
    if (!Array.isArray(balances)) return 0;
    return balances.reduce((total, balance) => {
      return total + (balance.balance || 0);
    }, 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Bekliyor</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">❌ Başarısız</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">🚫 İptal Edildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>E-Cüzdan yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 backdrop-blur-sm bg-white/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  E-Cüzdan
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBalances ? 'Gizle' : 'Göster'}
              </Button>
              <Button
                onClick={() => navigate("/member-panel")}
                variant="outline"
                size="sm"
              >
                Üye Paneli
              </Button>
              <Button onClick={() => navigate("/zahiri-panel")} variant="outline" size="sm">
                Zahiri Panel
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Main Balance Overview */}
        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 border-l-4 border-indigo-600">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2 text-indigo-700 font-bold">
              <Wallet className="w-8 h-8" />
              <span>Toplam Portföy Değeri</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Tüm varlıklarınızın USD cinsinden toplam değeri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mb-6 text-slate-900 tracking-tight">
              {showBalances ? `$${getTotalValueInUSD().toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.isArray(balances) && balances.map((balance) => (
                <div key={balance.currency} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{getCurrencyName(balance.currency)}</div>
                  <div className="text-lg font-black text-slate-800">
                    {showBalances ? formatCurrency(balance.balance, balance.currency) : '••••••'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <Plus className="w-6 h-6" />
                <span>Para Yatır</span>
              </CardTitle>
              <CardDescription>
                Hesabınıza güvenli bir şekilde para yatırın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Komisyon gelirleri otomatik olarak hesabınıza eklenir. Ürün satın almak için aşağıdaki butonu kullanın.</p>
                <Button 
                  onClick={() => navigate("/products")}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ürün Satın Al (Stripe)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Minus className="w-6 h-6" />
                <span>Para Çek</span>
              </CardTitle>
              <CardDescription>
                Bakiyenizi güvenli bir şekilde çekin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setWithdrawModal(true)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                size="lg"
              >
                <Minus className="w-5 h-5 mr-2" />
                Para Çek
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="USD">$ USD Cüzdan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Son İşlemler</CardTitle>
                <CardDescription>
                  En son gerçekleştirilen finansal işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Henüz işlem bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-semibold">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('tr-TR')} - {transaction.id}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* USD Wallet Tab */}
          <TabsContent value="USD" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span>USD Cüzdan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const balance = balances.find(b => b.currency === 'USD');
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 mb-2">Toplam Bakiye</div>
                        <div className="text-3xl font-bold text-blue-800">
                          {showBalances ? formatCurrency(balance?.balance || 0, 'USD') : '••••••••'}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-yellow-50 rounded-lg">
                        <div className="text-sm text-yellow-600 mb-2">Dondurulmuş</div>
                        <div className="text-3xl font-bold text-yellow-800">
                          {showBalances ? formatCurrency(balance?.frozen || 0, 'USD') : '••••••••'}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600 mb-2">Kullanılabilir</div>
                        <div className="text-3xl font-bold text-green-800">
                          {showBalances ? formatCurrency(balance?.available || 0, 'USD') : '••••••••'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>USD İşlem Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem Türü</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Referans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction?.date ? new Date(transaction.date).toLocaleDateString('tr-TR') : 'Tarih yok'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {transaction.type === 'deposit' ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span>{transaction.type === 'deposit' ? 'Gelir' : 'Para Çekme'}</span>
                          </div>
                        </TableCell>
                        <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount, 'USD')}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.reference || transaction.id}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Henüz işlem bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdraw Modal — Stripe Connect only */}
      <Dialog open={withdrawModal} onOpenChange={setWithdrawModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              <span>Para Çekme (Stripe Connect)</span>
            </DialogTitle>
            <DialogDescription>
              Kazançlarınızı Stripe Connect hesabınıza aktarın
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            <div>
              <Label>Çekilecek Tutar (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawForm.amount || ''}
                onChange={(e) => setWithdrawForm({...withdrawForm, amount: parseFloat(e.target.value) || 0})}
              />
              {(() => {
                const balance = balances.find(b => b.currency === 'USD');
                return balance && (
                  <p className="text-sm text-gray-500 mt-1">
                    Kullanılabilir: {formatCurrency(balance.available, 'USD')}
                  </p>
                );
              })()}
            </div>

            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="pt-4">
                {user?.stripeAccountId && user?.stripeOnboardingComplete ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-indigo-100 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs text-indigo-500 font-medium uppercase">Bağlı Stripe Hesabı</p>
                        <p className="font-mono text-sm">{user.stripeAccountId}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-indigo-700">
                      ⚡ Çekimler anında işlenir ve bağlı banka hesabınıza aktarılır.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-3 space-y-3">
                    <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto" />
                    <div>
                      <h4 className="font-semibold text-indigo-900">Stripe Hesabınız Bağlı Değil</h4>
                      <p className="text-sm text-indigo-700 mt-1">
                        Para çekebilmek için profil ayarlarından Stripe hesabınızı bağlamalısınız.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="text-indigo-600 border-indigo-200"
                      onClick={() => { setWithdrawModal(false); navigate("/member-panel?tab=profile"); }}
                    >
                      Stripe Hesabını Bağla
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawModal(false)}>İptal</Button>
            <Button
              onClick={handleWithdraw}
              disabled={!user?.stripeAccountId || !user?.stripeOnboardingComplete}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Stripe ile Çek
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Para Çekme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlemi onaylıyor musunuz?
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Yöntem:</span>
                    <span className="font-semibold">Stripe Connect</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tutar:</span>
                    <span className="font-semibold">
                      {pendingOperation && formatCurrency(pendingOperation.amount, 'USD')}
                    </span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWithdraw}>Onayla ve Gönder</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
