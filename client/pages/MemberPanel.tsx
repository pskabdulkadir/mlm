import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { safeDownloadUrl, safeDownloadBlob } from "@/lib/dom";
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  CreditCard,
  Eye,
  Award,
  Wallet,
  Network,
  MessageSquare,
  Settings,
  Link,
  QrCode,
  Target,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Plus,
  Edit,
  Smartphone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Send,
  LinkIcon,
  Globe,
  Image,
  Palette,
  Save,
  TreePine,
  List,
  User2,
  X,
  FileText,
  CheckCircle,
  ShoppingCart,
  Heart,
  Sparkles,
  Hexagon,
  Moon,
  Clock,
  AlertTriangle,
  Zap,
  Brain,
  Shield,
  Star,
  BookOpen,
  ShieldCheck,
  Calculator,
  Bell,
  Video,
  Lock,
  LayoutGrid,
} from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// BinaryNetworkTree removed - replaced with Monoline MLM system
import LiveBroadcastPlayer from "@/components/LiveBroadcastPlayer";
import MonolineTreeView from "@/components/MonolineTreeView";
import { SystemPresentation } from "@/components/SystemPresentation";
import { ContributionCalculator } from "@/components/ContributionCalculator";
import { UserGuideModal } from "@/components/UserGuideModal";
import MemberBlueprintManager from "@/components/MemberBlueprintManager";
import AIAssistant from "@/components/AIAssistant";
import TimeBankEducationPanel from "@/components/TimeBankEducationPanel";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
interface User {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  membershipType: string;
  isActive: boolean;
  totalInvestment: number;
  teamTurnoverUSD: number;
  directReferrals: number;
  totalTeamSize: number;
  wallet: {
    balance: number;
    totalEarnings: number;
    sponsorBonus: number;
    careerBonus: number;
    passiveIncome: number;
    leadershipBonus: number;
  };
  careerLevel: {
    name: string;
    commissionRate: number;
    requirements?: any;
    order?: number;
  };
  registrationDate: string;
  leftChild?: string;
  rightChild?: string;
  referralCode: string;
  sponsorId?: string;
  activeUntil?: string;
  firstPurchaseAt?: string;
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  date: string;
}

interface TeamMember {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  careerLevel: string;
  totalInvestment: number;
  directReferrals: number;
  registrationDate: string;
  isActive: boolean;
  level: number;
  position: "direct" | "downline";
}

const safeJsonParse = async (res: Response): Promise<any> => {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.warn("JSON parsing failed, returning empty object:", error);
    return {};
  }
};

export default function MemberPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [sponsorInfo, setSponsorInfo] = useState<{fullName: string; memberId: string; email?: string; referralCode?: string} | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [isCalculatorsOpen, setIsCalculatorsOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<{title: string, content: string} | null>(null);

  const openGuide = (title: string, content: string) => {
    setSelectedGuide({ title, content });
    setGuideModalOpen(true);
  };

  const handleStripeConnect = async () => {
    try {
      setStripeLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/onboarding-link', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Bağlantı linki alınamadı');
      }
      
      const data = await safeJsonParse(response);
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Stripe bağlantısı başlatılamadı.");
      }
    } catch (error) {
      console.error("Stripe connect error:", error);
      toast.error("Stripe bağlantısı sırasında bir hata oluştu.");
    } finally {
      setStripeLoading(false);
    }
  };

  // Vivid Spiritual Theme Configuration
  const vividTheme = {
    gradientBg: "bg-white",
    cardBg: "bg-white border-slate-200 shadow-sm", // Solid white, no transparency
    headerText: "text-slate-900 font-extrabold drop-shadow-sm", // Solid dark slate for better readability
    buttonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-900/10",
    tabActive: "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:font-bold", // Solid active state
    statCard: "bg-white border-l-4 border-purple-600 shadow-md hover:shadow-lg transition-all duration-300",
    tableHeader: "bg-purple-50 text-slate-900 font-bold uppercase text-xs tracking-wider", // Black text for headers
  };
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleTabSelect = (value: string) => {
    setActiveTab(value);
    if (value === "training") {
      fetchUpcomingTrainings();
    }
    if (user?.id && (value === "earnings" || value === "transactions" || value === "dashboard")) {
      fetchUserInfo(user.id);
      fetchTransactions(user.id);
    }
  };
  
  // New Registration State inside member panel
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handlePanelRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterSuccess(null);
    setRegisterError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: registerForm.fullName,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          sponsorCode: user?.memberId, // Sponsor is automatically the current user
        }),
      });

      const resData = await safeJsonParse(response);

      if (response.ok && resData.success) {
        setRegisterSuccess(`Üye başarıyla kaydedildi! Üye ID: ${resData.user?.memberId || ''}. Yeni üye bu ID ve belirlediğiniz şifreyle giriş yapabilir.`);
        setRegisterForm({
          fullName: "",
          email: "",
          phone: "",
          password: "",
        });
      } else {
        setRegisterError(resData.error || "Üye kaydı sırasında bir sorun oluştu.");
      }
    } catch (err: any) {
      console.error("Register form submit error:", err);
      setRegisterError("Kayıt işlemi başarısız.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const [cloneInfo, setCloneInfo] = useState({
    customMessage: "",
    visits: 0,
    conversions: 0,
    totalCommissions: 0
  });

  const fetchCloneInfo = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/user/${user.id}/clone-info`);
      if (response.ok) {
        const data = await safeJsonParse(response);
        setCloneInfo(data);
      }
    } catch (error) {
      console.error("Error fetching clone info:", error);
    }
  }, [user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      fetchCloneInfo();
    }
  }, [user?.id, fetchCloneInfo]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Weekly Performance Pool States
  const [poolStats, setPoolStats] = useState<{
    totalPoolAmount: number;
    userWeeklySales: number;
    userWeeklySalesCount: number;
    totalWeeklySales: number;
    estimatedShare: number;
    userIsEligible: boolean;
    minSalesRequired: number;
  } | null>(null);
  const [poolStatsLoading, setPoolStatsLoading] = useState(false);

  const fetchPoolStats = useCallback(async () => {
    try {
      setPoolStatsLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/auth/member/pool-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        if (data.success) {
          setPoolStats(data);
        }
      }
    } catch (err) {
      console.error("Error fetching pool stats:", err);
    } finally {
      setPoolStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPoolStats();
    }
  }, [user?.id, fetchPoolStats]);

  // --- Scalable Zeka Katmanı States & Handlers ---
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(["finance", "team", "challenges"]);

  const fetchEligibilityAndChallenges = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch eligibility
      const elRes = await fetch(`/api/commissions/eligibility/${userId}`, { headers });
      if (elRes.ok) {
        const elData = await safeJsonParse(elRes);
        if (elData.success) {
          setEligibilityData(elData);
        }
      }

      // Fetch challenges
      const chRes = await fetch(`/api/commissions/challenges/${userId}`, { headers });
      if (chRes.ok) {
        const chData = await safeJsonParse(chRes);
        if (chData.success) {
          setChallenges(chData.challenges);
        }
      }
    } catch (err) {
      console.error("Error fetching eligibility and challenges:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEligibilityAndChallenges(user.id);
    }
  }, [user?.id]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clonePageUrl, setClonePageUrl] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [shareStats, setShareStats] = useState({
    visits: 0,
    conversions: 0,
    conversionRate: 0,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [clonePageSettings, setClonePageSettings] = useState({
    headerColor: "#3B82F6",
    buttonColor: "#10B981",
    backgroundColor: "#F8FAFC",
    showTestimonials: true,
    showFeatures: true,
    customCss: "",
  });
  const [selectedMemberForTeamView, setSelectedMemberForTeamView] = useState<TeamMember | null>(null);
  const [teamViewMode, setTeamViewMode] = useState<'list' | 'tree'>('list');
  const [memberTeamData, setMemberTeamData] = useState<TeamMember[]>([]);
  const [teamViewModalOpen, setTeamViewModalOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showActivityWarning, setShowActivityWarning] = useState(false);

  // Notifications & Training States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);

  // Team Placement Management States
  const [pendingPlacements, setPendingPlacements] = useState<any[]>([]);
  const [placementModal, setPlacementModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null);
  const [teamTreeData, setTeamTreeData] = useState<any>(null);
  const [monolineDownline, setMonolineDownline] = useState<any[]>([]);
  const [monolineDownlineLoading, setMonolineDownlineLoading] = useState(false);

  // Receipt Upload States
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUploadLoading, setReceiptUploadLoading] = useState(false);
  const [receiptUploadStatus, setReceiptUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [receiptMessage, setReceiptMessage] = useState("");
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [profileUpdating, setProfileUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName || !profileForm.email || !profileForm.phone) {
      alert("Lütfen tüm zorunlu alanları (Ad Soyad, Email, Telefon) doldurun.");
      return;
    }

    setProfileUpdating(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const data = await safeJsonParse(response);
      if (response.ok && data.success) {
        alert("✅ " + data.message);
        setUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        // Reset password field
        setProfileForm(prev => ({ ...prev, password: "" }));
      } else {
        alert("❌ Hata: " + (data.error || "Profil güncellenemedi."));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("❌ Sunucu bağlantı hatası!");
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setReceiptUploadStatus('error');
        setReceiptMessage("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        setReceiptFile(fileContent);
        setReceiptPreview(fileContent);
        setReceiptUploadStatus('idle');
        setReceiptMessage("");
      };
      reader.onerror = () => {
        setReceiptUploadStatus('error');
        setReceiptMessage("Dosya okuma hatası");
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadReceipt = async () => {
    if (!receiptFile) {
      setReceiptUploadStatus('error');
      setReceiptMessage("Lütfen bir dekont dosyası seçin");
      return;
    }

    setReceiptUploadLoading(true);
    setReceiptUploadStatus('idle');
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/upload-receipt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptFile: receiptFile,
          userId: user?.id,
        }),
      });

      const data = await safeJsonParse(response);
      if (response.ok && data.success) {
        setReceiptUploadStatus('success');
        setReceiptMessage("Ödeme dekontu başarıyla yüklendi! Admin onayını bekleyiniz.");
        setReceiptFile(null);
        setReceiptPreview(null);
        setTimeout(() => {
          setReceiptUploadStatus('idle');
          setReceiptMessage("");
        }, 5000);
      } else {
        setReceiptUploadStatus('error');
        setReceiptMessage(data.message || "Dekont yükleme başarısız");
      }
    } catch (error) {
      setReceiptUploadStatus('error');
      setReceiptMessage("Dekont yükleme sırasında bir hata oluştu");
      console.error("Receipt upload error:", error);
    } finally {
      setReceiptUploadLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Automated redirect if active duration expired (süre dolunca üye direk alış verişe yönlendirilsin)
  useEffect(() => {
    if (user && user.isActive && user.role !== "admin") {
      const remainingDays = calculateRemainingDays(user.activeUntil);
      if (remainingDays <= 0) {
        alert("⚠️ Aktiflik süreniz sona ermiştir! Alışveriş sayfasına yönlendiriliyorsunuz...");
        navigate("/products");
      }
    }
  }, [user, navigate]);


  const checkAuthentication = async () => {
    try {
      const currentUserData = localStorage.getItem("currentUser");
      const authToken = localStorage.getItem("authToken");

      if (!currentUserData) {
        navigate("/login");
        return;
      }

      const currentUser = JSON.parse(currentUserData);
      if (!currentUser.id) {
        navigate("/login");
        return;
      }

      // If we don't have an authToken, that's okay for older functionality
      // But some new features will require proper login
      if (!authToken) {
        console.warn(
          "No auth token found - some features may not work properly",
        );
      }

      await fetchUserData(currentUser.id);
    } catch (error) {
      console.error("Authentication check failed:", error);
      navigate("/login");
    }
  };

  const calculateRemainingDays = (activeUntil?: string) => {
    if (!activeUntil) return 0;
    const now = new Date();
    const end = new Date(activeUntil);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    if (clonePageUrl) {
      generateQRCode();
    }
  }, [clonePageUrl]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch("/api/training/notifications/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("fetchNotifications error", err);
    }
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem("authToken");
    await fetch("/api/training/notifications/read-all", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const fetchUpcomingTrainings = useCallback(async () => {
    setTrainingsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/training/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        setUpcomingTrainings(data.trainings || []);
      }
    } catch (err) {
      console.error("fetchUpcomingTrainings error", err);
    } finally {
      setTrainingsLoading(false);
    }
  }, []);

  const fetchUserPurchases = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/user/${userId}/product-purchases`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success && data.purchases) {
          setUserPurchases(data.purchases);
        }
      }
    } catch (error) {
      console.error("Error fetching user purchases:", error);
    }
  };

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserInfo(userId),
        fetchTransactions(userId),
        fetchTeamMembers(userId),
        fetchClonePageInfo(userId),
        fetchPendingPlacements(userId),
        fetchMonolineDownline(userId),
        fetchNotifications(),
        fetchUpcomingTrainings(),
        fetchUserPurchases(userId),
        fetchEligibilityAndChallenges(userId),
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh: poll notifications + user status every 4 seconds for instant integration of admin approvals
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchNotifications();
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u?.id) {
            fetchUserInfo(u.id).catch((err) => {
              console.error("Auto-refresh fetch user info failed:", err);
            });
            fetchUserPurchases(u.id).catch((err) => {
              console.error("Auto-refresh fetch user purchases failed:", err);
            });
            fetchEligibilityAndChallenges(u.id).catch((err) => {
              console.error("Auto-refresh fetch eligibility failed:", err);
            });
          }
        } catch (e) {
          console.error("Failed to parse currentUser from localStorage during auto-refresh", e);
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const fetchPendingPlacements = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/user/${userId}/pending-placements`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await safeJsonParse(response);
        setPendingPlacements(data.placements || []);
      }
    } catch (error) {
      console.error("Error fetching pending placements:", error);
    }
  };

  const fetchMonolineDownline = async (userId: string) => {
    setMonolineDownlineLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/user/${userId}/monoline-downline?depth=7`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await safeJsonParse(response);
        setMonolineDownline(data.downline || []);
      }
    } catch (error) {
      console.error("Error fetching monoline downline:", error);
    } finally {
      setMonolineDownlineLoading(false);
    }
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success && data.user) {
          const wasActive = user?.isActive;
          const isNowActive = data.user.isActive;

          setUser(data.user);
          localStorage.setItem("currentUser", JSON.stringify(data.user));

          setClonePageUrl(
            `${window.location.origin}/clone/${data.user.memberId}`,
          );

          const remainingDays = calculateRemainingDays(data.user.activeUntil);
          if (remainingDays > 0 && remainingDays <= 7) {
            setShowActivityWarning(true);
          } else {
            setShowActivityWarning(false);
          }

          if (data.user.sponsorId) {
            fetchSponsorInfo(data.user.sponsorId);
          }

          // If they just got approved by admin, load all data again to refresh team, ciro, products instantly!
          if (user !== null && !wasActive && isNowActive) {
            console.log("User got approved! Refreshing full member panel state...");
            fetchUserData(userId).catch(err => console.error(err));
          }
        }
      } else if (response.status === 401) {
        // Token invalid, redirect to login
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchSponsorInfo = async (sponsorMemberId: string) => {
    try {
      const response = await fetch(`/api/auth/member/by-member-id/${sponsorMemberId}`);
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success) {
          setSponsorInfo(data.sponsor);
        }
      }
    } catch (error) {
      console.warn("Error fetching sponsor info:", error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`/api/user/${userId}/transactions`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await safeJsonParse(response);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.warn("Error fetching transactions:", error instanceof Error ? error.message : 'Unknown error');
      setTransactions([]);
    }
  };

  const fetchTeamMembers = async (userId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`/api/user/${userId}/team`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await safeJsonParse(response);
        setTeamMembers(data.team || []);
      }
    } catch (error) {
      console.warn("Error fetching team members:", error instanceof Error ? error.message : 'Unknown error');
      setTeamMembers([]);
    }
  };

  const fetchMemberTeam = async (memberId: string) => {
    try {
      const response = await fetch(`/api/user/${memberId}/team`);
      if (response.ok) {
        const data = await safeJsonParse(response);
        return data.team || [];
      }
    } catch (error) {
      console.error("Error fetching member team:", error);
      return [];
    }
  };

  const handleViewMemberTeam = async (member: TeamMember) => {
    setSelectedMemberForTeamView(member);
    setTeamViewModalOpen(true);
    const memberTeam = await fetchMemberTeam(member.id);
    setMemberTeamData(memberTeam);
  };

  const fetchClonePageInfo = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("/api/auth/my-clone-page", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success) {
          setCustomMessage(data.clonePage.customizations?.customMessage || "");
          setClonePageUrl(data.cloneUrl);
          setShareStats({
            visits: data.clonePage.visitCount || 0,
            conversions: data.clonePage.conversionCount || 0,
            conversionRate:
              data.clonePage.visitCount > 0
                ? (data.clonePage.conversionCount / data.clonePage.visitCount) *
                100
                : 0,
          });
        }
      }
    } catch (error) {
      console.warn("Error fetching clone page info:", error instanceof Error ? error.message : 'Unknown error');
      // Set default values on error
      setCustomMessage("");
      setClonePageUrl(`${window.location.origin}/clone/${user?.memberId || 'unknown'}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link kopyalandı!");
  };

  const updateCustomMessage = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/my-clone-page", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customMessage }),
      });

      if (response.ok) {
        alert("Özel mesajınız güncellendi!");
      }
    } catch (error) {
      console.error("Error updating custom message:", error);
      alert("Güncelleme hatası!");
    }
  };

  const shareViaWhatsApp = () => {
    const message = `${user?.fullName} üzerinden AKN Group'a katılın! Manevi gelişim ve finansal özgürlük için: ${clonePageUrl}`;
    window.open(
      `whatsapp://send?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const shareViaEmail = () => {
    const subject = "AKN Group Daveti";
    const body = `Merhaba,\n\n${user?.fullName} üzerinden AKN Group platformuna katılmanızı istiyorum. Bu platform hem manevi gelişim hem de finansal özgürlük sunuyor.\n\nKatılmak için: ${clonePageUrl}\n\nSaygılarımla,\n${user?.fullName}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
  };

  const generateQRCode = () => {
    // Using QR Server API for QR code generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(clonePageUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      safeDownloadUrl(qrCodeUrl, `${user?.memberId}-qr-code.png`);
    }
  };

  const shareViaInstagram = () => {
    const text = `${user?.fullName} üzerinden AKN Group'a katılın! Manevi gelişim ve finansal özgürlük için: ${clonePageUrl}`;
    // Instagram doesn't have direct URL sharing, copy to clipboard
    navigator.clipboard.writeText(text);
    alert(
      "Instagram paylaşımı için metin kopyalandı! Instagram'da paylaşabilirsiniz.",
    );
  };

  const shareViaTwitter = () => {
    const text = `${user?.fullName} üzerinden AKN Group'a katılın! Manevi gelişim ve finansal özgürlük için:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(clonePageUrl)}`;
    window.open(url, "_blank");
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(clonePageUrl)}`;
    window.open(url, "_blank");
  };

  const shareViaTelegram = () => {
    const text = `${user?.fullName} üzerinden AKN Group'a katılın! ${clonePageUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(clonePageUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const updateClonePageSettings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/${user.id}/clone-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clonePageSettings),
      });

      if (response.ok) {
        alert("Klon sayfa ayarlarınız güncellendi!");
      }
    } catch (error) {
      console.error("Error updating clone page settings:", error);
      alert("Güncelleme hatası!");
    }
  };

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch("/api/auth/member/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await safeJsonParse(response);
        // Filter documents based on user access level
        const filteredDocuments = data.documents?.filter((doc: any) => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && user?.isActive) return true;
          if (doc.accessLevel === 'leaders' && user?.role === 'leader') return true;
          if (doc.accessLevel === 'admins' && user?.role === 'admin') return true;
          return false;
        }) || [];
        setDocuments(filteredDocuments);
      } else {
        // Use fallback document data for demo (prefer shared storage if exists)
        const stored = JSON.parse(localStorage.getItem('shared_documents') || '[]');
        if (stored.length) {
          const userRole = user?.role || 'member';
          const userActive = user?.isActive || false;
          const filteredStored = stored.filter((doc: any) => {
            if (!doc.isActive) return false;
            if (doc.accessLevel === 'all') return true;
            if (doc.accessLevel === 'members' && userActive) return true;
            if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
            if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
            return false;
          });
          setDocuments(filteredStored);
          return;
        }
        const fallbackDocs = [
          {
            id: "doc-001",
            title: "Sistem Kullanım Kılavuzu",
            description: "Kapsamlı sistem kullanım rehberi - Tüm özellikler ve işlevler",
            category: "guide",
            type: "document",
            fileName: "sistem-kilavuzu.pdf",
            fileSize: 2048000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "all",
            tags: ["kılavuz", "sistem"]
          },
          {
            id: "doc-002",
            title: "Ruhsal Gelişim Katkı Payı Hesaplama",
            description: "Katkı payı hesaplama yöntemleri ve örnekler - Ruhsal Gelişim sistem rehberi",
            category: "training",
            type: "presentation",
            fileName: "katki-payi-hesaplama.pptx",
            fileSize: 5120000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "members",
            tags: ["katkı payı", "ruhsal gelişim", "eğitim"]
          },
          {
            id: "doc-003",
            title: "Başarılı Ruhsal Gelişim Rehberliği",
            description: "Ruhsal gelişim rehberlik stratejileri ve motivasyon teknikleri",
            category: "training",
            type: "document",
            fileName: "ruhsal-gelisim-rehberi.pdf",
            fileSize: 3072000,
            uploadDate: new Date().toISOString(),
            isActive: true,
            accessLevel: "all",
            tags: ["ruhsal gelişim", "rehberlik", "strateji"]
          }
        ];

        // Filter based on user access level for demo
        const userRole = user?.role || 'member';
        const userActive = user?.isActive || false;

        const filteredDocs = fallbackDocs.filter(doc => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && userActive) return true;
          if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
          if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
          return false;
        });

        setDocuments(filteredDocs);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted due to timeout - use fallback data
      }
      // Silently use fallback documents when API is not available (prefer shared storage if exists)
      const stored = JSON.parse(localStorage.getItem('shared_documents') || '[]');
      if (stored.length) {
        const userRole = user?.role || 'member';
        const userActive = user?.isActive || false;
        const filteredStored = stored.filter((doc: any) => {
          if (!doc.isActive) return false;
          if (doc.accessLevel === 'all') return true;
          if (doc.accessLevel === 'members' && userActive) return true;
          if (doc.accessLevel === 'leaders' && userRole === 'leader') return true;
          if (doc.accessLevel === 'admins' && userRole === 'admin') return true;
          return false;
        });
        setDocuments(filteredStored);
        return;
      }
      const fallbackDocs = [
        {
          id: "doc-001",
          title: "Sistem Kullanım Kılavuzu",
          description: "Kapsamlı sistem kullanım rehberi - Tüm özellikler ve işlevler",
          category: "guide",
          type: "document",
          fileName: "sistem-kilavuzu.pdf",
          fileSize: 2048000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "all",
          tags: ["kılavuz", "sistem"]
        },
        {
          id: "doc-002",
          title: "Ruhsal Gelişim Katkı Payı Hesaplama",
          description: "Katkı payı hesaplama yöntemleri ve örnekler - Ruhsal Gelişim sistem rehberi",
          category: "training",
          type: "presentation",
          fileName: "katki-payi-hesaplama.pptx",
          fileSize: 5120000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "members",
          tags: ["katkı payı", "ruhsal gelişim", "eğitim"]
        },
        {
          id: "doc-003",
          title: "Başarılı Ruhsal Gelişim Rehberliği",
          description: "Ruhsal gelişim rehberlik stratejileri ve motivasyon teknikleri",
          category: "training",
          type: "document",
          fileName: "ruhsal-gelisim-rehberi.pdf",
          fileSize: 3072000,
          uploadDate: new Date().toISOString(),
          isActive: true,
          accessLevel: "all",
          tags: ["ruhsal gelişim", "rehberlik", "strateji"]
        }
      ];

      setDocuments(fallbackDocs);
    } finally {
      setDocumentsLoading(false);
    }
  }, [user]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'ppt': case 'pptx': return '📊';
      case 'xls': case 'xlsx': return '📈';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
      case 'mp4': case 'avi': case 'mov': return '🎥';
      case 'mp3': case 'wav': return '🎵';
      case 'zip': case 'rar': return '📦';
      default: return '📎';
    }
  };

  const downloadTextContent = (title: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    safeDownloadBlob(blob, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`);
    toast({
      title: "Başarılı",
      description: `${title} dökümanı başarıyla indirildi.`,
    });
  };

  const downloadDocument = async (docId: string, fileName: string) => {
    // Special handling for interactive widgets
    if (docId === 'doc-002') {
      setIsCalculatorsOpen(true);
      toast.info("Ruhsal Gelişim Katkı Payı Hesaplayıcı açıldı.");
      return;
    }

    if (docId === 'doc-001') {
      openGuide(
        "Sistem Kullanım Kılavuzu",
        "AKN Group Sistemine Hoş Geldiniz!\n\nTemel Adımlar:\n1. Profilinizi tamamlayın ve KYC doğrulaması yapın.\n2. Bir üyelik paketi seçerek sistemde aktiflik kazanın.\n3. Manevi Panel'den günlük zikir ve eğitimlerinize başlayın.\n4. Klon sayfanızı sosyal medyada paylaşarak ekibinizi kurun.\n5. E-Cüzdan üzerinden kazançlarınızı takip edin ve çekin.\n\nDaha detaylı bilgi için eğitim videolarını izleyebilirsiniz."
      );
      toast.success("Sistem Kullanım Kılavuzu başlatıldı.");
      return;
    }

    if (docId === 'doc-003') {
      openGuide(
        "Başarılı Ruhsal Gelişim Rehberliği",
        "Ruhsal gelişim yolculuğunda başarılı olmak için şu altın kuralları takip edin:\n\n✨ Disiplin: Her güne niyet ederek başlayın ve günlük evradınızı aksatmayın.\n✨ Sadakat: Sisteme dahil ettiğiniz yol arkadaşlarınızla haftalık manevi istişareler yapın.\n✨ Eğitim: Akademi kısmındaki videoları düzenli izleyin ve notlar alın.\n✨ Rehberlik: Üst liderlerinizin ve manevi rehberlerinizin tavsiyelerini hayatınıza entegre edin.\n✨ Sabır: Ruhsal tekamül bir yolculuktur, her adımda derinleştiğinizi hissedeceksiniz."
      );
      toast.success("Rehberlik dökümanı açıldı.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/api/auth/member/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const blob = await response.blob();
        safeDownloadBlob(blob, fileName);
        alert(`${fileName} başarıyla indirildi!`);
      } else if (response.status === 404) {
        alert(`${fileName} bulunamadı.`);
      } else {
        alert('Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Dosya indirme işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        console.warn('Document download error:', error instanceof Error ? error.message : 'Unknown error');
        alert(`${fileName} indiriliyor... (Demo modu)`);
      }
    }
  };

  // Team Placement Management Functions
  const loadTeamStructure = async () => {
    if (!user) return;
    try {
      // In monoline, we just show the user and the fact they are in a single line
      setTeamTreeData({
        id: user.id,
        fullName: user.fullName,
        memberId: user.memberId,
      });
    } catch (error) {
      console.error("Error loading team structure:", error);
    }
  };

  const placeMemberInTeam = async (placementId: string) => {
    try {
      const placement = pendingPlacements.find(p => p.id === placementId);
      if (!placement || !user) return;

      // Call real-time commission API for monoline placement
      const token = localStorage.getItem("authToken");
      const response = await fetch('/api/commissions/calculate-placement-bonuses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorId: user.id,
          newUserId: placement.newUserId,
          mode: 'monoline'
        })
      });

      if (response.ok) {
        const result = await safeJsonParse(response);
        console.log('👥 Monoline placement successful:', result);

        // Update local state for immediate feedback
        setPendingPlacements(prev =>
          prev.filter(p => p.id !== placementId)
        );

        // Update user data locally
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            directReferrals: (prevUser.directReferrals || 0) + 1,
            totalTeamSize: (prevUser.totalTeamSize || 0) + 1,
            wallet: {
              ...prevUser.wallet,
              sponsorBonus: (prevUser.wallet.sponsorBonus || 0) + (result.totalAmount || 25),
              totalEarnings: (prevUser.wallet.totalEarnings || 0) + (result.totalAmount || 25)
            }
          };
        });

        alert(`✅ Monoline Onayı Başarılı!\n\n👤 ${placement.newUserData.fullName}\n💰 Sponsor Bonusu: $${(result.totalAmount || 25).toFixed(2)}\n\n🎯 Üye monoline hattınıza başarıyla dahil edildi!`);
      } else {
        let errorMsg = 'İşlem başarısız';
        try {
          const errorData = await safeJsonParse(response);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          console.warn("Could not parse error response", e);
        }
        alert(`❌ Hata: ${errorMsg}`);
      }

      setPlacementModal(false);
      setSelectedPlacement(null);
      fetchUserInfo(user.id);
    } catch (error) {
      console.error("Error placing member:", error);
      alert("❌ İşlem sırasında bir hata oluştu!");
    }
  };

  const getAvailablePositions = () => {
    // In monoline system, all new members are placed in the single line
    return {
      downline: true,
      auto: true
    };
  };

  const handlePlacementSelection = (placement: any) => {
    setSelectedPlacement(placement);
    loadTeamStructure();
    setPlacementModal(true);
  };

  // Load documents when component mounts
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  // Live update when admin updates shared_documents in other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'shared_documents') loadDocuments();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadDocuments]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Üye paneliniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white`}>
        <Card>
          <CardHeader>
            <CardTitle>Erişim Hatası</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Üye bilgilerinize erişilemiyor.</p>
            <Button onClick={() => navigate("/login")}>Tekrar Giriş Yap</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white text-slate-900`}>
      {/* Navigation */}
      <nav className={`border-b border-slate-200 backdrop-blur-md sticky top-0 z-50 ${vividTheme.cardBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <RouterLink to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-spiritual-purple rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-spiritual-purple bg-clip-text text-transparent">
                  AKN Group
                </span>
              </RouterLink>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.fullName}</Badge>
              <Badge>{user.memberId}</Badge>
              {/* Show admin panel link if user is admin */}
              {user.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin-panel")}
                  className="text-purple-600 hover:text-purple-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                {showNotifPanel && (
                  <div className="absolute right-0 top-10 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
                    <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-600" />
                        Bildirimler
                        {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>}
                      </h3>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <Button size="sm" variant="outline" onClick={markAllRead} className="text-xs h-7">
                            Hepsini Okundu İşaretle
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setShowNotifPanel(false)} className="text-xs h-7">✕</Button>
                      </div>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Henüz bildirim yok</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? "bg-purple-50 border-l-4 border-purple-500" : ""}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${n.type === "zoom_training" ? "bg-blue-100" : n.type === "payment_approved" ? "bg-green-100" : n.type === "commission_received" ? "bg-yellow-100" : "bg-gray-100"}`}>
                                {n.type === "zoom_training" ? "🎥" : n.type === "payment_approved" ? "✅" : n.type === "commission_received" ? "💰" : "📢"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{n.message}</p>
                                {n.type === "zoom_training" && n.data?.zoomLink && (
                                  <a href={n.data.zoomLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                    <Video className="w-3 h-3" />
                                    Zoom'a Katıl
                                  </a>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("currentUser");
                  navigate("/");
                }}
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Üye Paneliniz</h1>
            <p className="text-foreground/60">
              Hoş geldiniz <strong className="text-purple-700 font-semibold">{user.fullName}</strong> - Organizasyonunuzu büyütün ve
              kazançlarınızı takip edin
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <UserGuideModal />
            <Button
              onClick={() => setActiveTab("profile")}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 shadow-sm rounded-lg"
            >
              <User2 className="w-4 h-4" />
              <span>Profilim</span>
            </Button>
          </div>
        </div>

          {/* Activity Expiration Warning */}
          {showActivityWarning && user && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aktifliğiniz Sona Eriyor!</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>
                  Aktiflik sürenizin dolmasına <strong>{calculateRemainingDays(user.activeUntil)} gün</strong> kaldı. Komisyon ve bonus haklarınızı kaybetmemek için üyeliğinizi yenileyin.
                </span>
                <Button size="sm" onClick={() => navigate('/products')} className="ml-4 bg-white text-red-600 hover:bg-gray-100">Hemen Aktif Ol</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-lg text-green-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase text-slate-300">AKN Group Aktiflik Kontrolü</h3>
                  <p className="text-xs text-slate-400">Sistem komisyonları ve unilevel kazanç güvencesi</p>
                </div>
              </div>
              <div>
                {user.activeUntil && calculateRemainingDays(user.activeUntil) > 0 ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-white mr-1 animate-ping" />
                    HESAP AKTİF
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold">
                    PASİF HESAP
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium font-sans">Aktiflik Seviyesi Türü</span>
                  {user.activeUntil && calculateRemainingDays(user.activeUntil) > 0 ? (
                    <div className="mt-2">
                      <span className="text-lg font-bold text-slate-800">
                        {calculateRemainingDays(user.activeUntil) > 35 ? "🌟 Yıllık Aktiflik" : "📅 Aylık Aktiflik"}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {calculateRemainingDays(user.activeUntil) > 35 ? "12 Aylık Tam Güvence" : "30 Günlük Standart Aktivite"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium mt-2">Aktiflik Yok</span>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium">Bitiş Tarihi</span>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-slate-800">
                      {user.activeUntil ? new Date(user.activeUntil).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Belirtilmemiş"}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Süre sonu tarihi</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium">Kalan Süre (Gün)</span>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-slate-950">
                      {calculateRemainingDays(user.activeUntil)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">gün kaldı</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {user.activeUntil && calculateRemainingDays(user.activeUntil) > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Süre İlerleme Çubuğu</span>
                    <span>
                      {Math.min(100, Math.round((calculateRemainingDays(user.activeUntil) / (calculateRemainingDays(user.activeUntil) > 35 ? 365 : 30)) * 100))}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, Math.round((calculateRemainingDays(user.activeUntil) / (calculateRemainingDays(user.activeUntil) > 35 ? 365 : 30)) * 100))}
                    className="h-2 bg-slate-100 rounded-full" 
                  />
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button 
                  onClick={() => navigate('/products')} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-all"
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Süreyi Uzat / Aktif Ol
                </Button>
              </div>
            </div>
          </div>




        {/* Live Broadcast Player */}
        <div className="mb-8">
          <LiveBroadcastPlayer
            autoRefresh={true}
            refreshInterval={30000}
            className="shadow-lg"
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 font-medium">
                    Cüzdan Bakiyesi
                  </p>
                  <p className="text-2xl font-bold text-black">
                    ${user.wallet.balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 font-medium">Ekip Üyesi</p>
                  <p className="text-2xl font-bold text-black">{user.totalTeamSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 font-medium">Ekip Cirosu</p>
                  <p className="text-2xl font-bold text-black">
                    ${(user.teamTurnoverUSD || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 font-medium">Toplam Kazanç</p>
                  <p className="text-2xl font-bold text-black">
                    ${user.wallet.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 font-medium">
                    Kariyer / Pasif Derinlik
                  </p>
                  <p className="text-lg font-bold text-black">
                    {user.careerLevel.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aylık Performans Havuzu (Başarı Primi) */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Award className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white tracking-tight">
                      Aylık Performans Havuzu (Başarı Primi)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Sadece satış yapan aktif üyeler arasında, yaptıkları satış oranına göre adil dağıtım.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={poolStats?.userIsEligible ? "success" : "secondary"} className={`px-3 py-1 text-xs font-semibold ${poolStats?.userIsEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                  {poolStats?.userIsEligible ? "Hak Kazandınız" : "Aktif Satış Gerekli"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Aylık Havuz Toplamı</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    ${poolStats ? poolStats.totalPoolAmount.toFixed(2) : "0.00"}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Sistem satışlarından anlık birikir</span>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Sizin Aylık Satışınız</span>
                  <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    ${poolStats ? poolStats.userWeeklySales.toFixed(2) : "0.00"}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Satış Sayısı: <strong className="text-slate-300">{poolStats ? poolStats.userWeeklySalesCount : 0}</strong> / En az 1 gerekli
                  </span>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/40">
                  <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Toplam Ekip Aylık Satışı</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    ${poolStats ? poolStats.totalWeeklySales.toFixed(2) : "0.00"}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Havuza katılan tüm üyelerin toplamı</span>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-xs font-medium text-emerald-400 block mb-1 uppercase tracking-wider">Tahmini Payınız</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline">
                    ${poolStats ? poolStats.estimatedShare.toFixed(2) : "0.00"}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Aylık Pay Oranınız: <strong className="text-emerald-400">%{(poolStats && poolStats.totalWeeklySales > 0) ? ((poolStats.userWeeklySales / poolStats.totalWeeklySales) * 100).toFixed(1) : "0.0"}</strong>
                  </span>
                </div>
              </div>

              {/* Bilgilendirme / Statü Mesajı */}
              <div className={`p-4 rounded-xl border ${poolStats?.userIsEligible ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-amber-950/20 border-amber-500/20 text-amber-300'} flex items-start gap-3`}>
                <div className="mt-0.5">
                  {poolStats?.userIsEligible ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs">
                  <p className="font-semibold mb-1">
                    {poolStats?.userIsEligible 
                      ? "Tebrikler! Aylık Performans Dağıtımına Katılıyorsunuz" 
                      : "Performans Havuzuna Katılmak İçin En Az 1 Satış Yapmalısınız"}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {poolStats?.userIsEligible 
                      ? `Bu ay toplam $${poolStats.userWeeklySales.toFixed(2)} değerinde ${poolStats.userWeeklySalesCount} adet satış yaptınız. Havuz payınız, kişisel satışınızın toplam aktif havuz satışına (%${((poolStats.userWeeklySales / poolStats.totalWeeklySales) * 100).toFixed(2)}) oranına göre dağıtılacaktır.`
                      : `Şu an aktiflik durumunuz aktif fakat bu ay henüz bir satış yapmadınız. Havuzdan pay almak için en az 1 satış/üye kazandırmanız şarttır (minSales: 1). Kazandırdığınız her yeni üye veya satış, havuzdaki pay oranınızı artırır.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hızlı Erişim Kontrol Paneli */}
        {(() => {
          const categories = [
            {
              id: "network",
              title: "Ağ & Organizasyon",
              color: "from-blue-500 to-indigo-600",
              icon: <Users className="w-5 h-5 text-blue-400" />,
              items: [
                { value: "dashboard", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
                { value: "profile", label: "Profilim", icon: <User2 className="w-4 h-4" /> },
                { value: "team", label: "Ekibim", icon: <Users className="w-4 h-4" /> },
                { value: "monoline-tree", label: "Monoline Hattım", icon: <TreePine className="w-4 h-4" /> },
                { value: "placement", label: "Yerleştirme", icon: <Network className="w-4 h-4" /> },
                { value: "new-register", label: "Yeni Üye Kaydı", icon: <Plus className="w-4 h-4" /> },
              ]
            },
            {
              id: "financial",
              title: "Finans & Ticaret",
              color: "from-green-500 to-emerald-600",
              icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
              items: [
                { value: "earnings", label: "Kazançlar", icon: <DollarSign className="w-4 h-4" /> },
                { value: "transactions", label: "İşlemler", icon: <RefreshCw className="w-4 h-4" /> },
                { value: "clone-products", label: "Ürün Mağazam", icon: <ShoppingCart className="w-4 h-4" /> },
              ]
            },
            {
              id: "spiritual",
              title: "Maneviyat & İlmihaller",
              color: "from-amber-500 to-rose-600",
              icon: <Sparkles className="w-5 h-5 text-amber-400" />,
              items: [
                { value: "manevi", label: "Manevi Panel", icon: <Moon className="w-4 h-4" /> },
                { value: "zahiri", label: "Zahiri Panel", icon: <Sparkles className="w-4 h-4" /> },
                { value: "batini", label: "Batıni Panel", icon: <Crown className="w-4 h-4" /> },
                { value: "siyernebi", label: "Siyer-i Nebi", icon: <BookOpen className="w-4 h-4" /> },
                { value: "kadinilmihali", label: "Kadın İlmihali", icon: <Heart className="w-4 h-4" /> },
                { value: "islamtemeli", label: "İslam Temeli", icon: <Hexagon className="w-4 h-4" /> },
              ]
            },
            {
              id: "resources",
              title: "Kaynaklar & Eğitimler",
              color: "from-purple-500 to-pink-600",
              icon: <Video className="w-5 h-5 text-purple-400" />,
              items: [
                { value: "documents", label: "Dökümanlar", icon: <Download className="w-4 h-4" /> },
                { value: "training", label: "Eğitimler", icon: <Video className="w-4 h-4" /> },
                { value: "share", label: "Paylaşım", icon: <Share2 className="w-4 h-4" /> },
              ]
            },
            {
              id: "blueprint_group",
              title: "Master Blueprint",
              color: "from-indigo-600 via-purple-600 to-pink-600",
              icon: <Brain className="w-5 h-5 text-purple-400" />,
              items: [
                { value: "blueprint", label: "Otonom Kontrol Paneli", icon: <Brain className="w-4 h-4 text-purple-400" /> },
              ]
            }
          ];

          return (
            <div className="mb-8 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    AKN Group Hızlı Erişim Kontrol Paneli
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Aradığınız tüm eğitim, ilmihal, manevi gelişim ve organizasyon sayfalarına tek ekrandan anında ulaşın.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30 px-3 py-1 rounded-full text-xs">
                    {categories.reduce((acc, cat) => acc + cat.items.length, 0)} Modül Entegre
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-300 font-bold border border-blue-500/30 px-3 py-1 rounded-full text-xs">
                    100% Aktif Bağlantı
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                {categories.map((category) => (
                  <div key={category.id} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 shadow-inner flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
                        <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                          {category.icon}
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-200">{category.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {category.items.map((item) => {
                          const isActive = activeTab === item.value;
                          return (
                            <button
                              key={item.value}
                              onClick={() => handleTabSelect(item.value)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 w-full text-left relative",
                                isActive
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/10 scale-[1.02] font-black"
                                  : "bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800/60"
                              )}
                            >
                              <span className={cn(
                                "flex-shrink-0",
                                isActive ? "text-slate-950" : "text-slate-400"
                              )}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                              {item.value === "training" && upcomingTrainings.length > 0 && (
                                <span className={cn(
                                  "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold",
                                  isActive ? "bg-slate-950 text-amber-500" : "bg-amber-500 text-slate-950"
                                )}>
                                  {upcomingTrainings.length}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabSelect} className="space-y-6">
          <div className="w-full overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="flex w-max lg:w-full min-w-full h-auto p-1 bg-white border border-slate-200 rounded-xl">
              <TabsTrigger value="dashboard" className="px-4 py-2 whitespace-nowrap">Dashboard</TabsTrigger>
              <TabsTrigger value="team" className="px-4 py-2 whitespace-nowrap">Ekibim</TabsTrigger>
              <TabsTrigger value="monoline-tree" className="px-4 py-2 whitespace-nowrap">🌳 Monoline Hattım</TabsTrigger>
              <TabsTrigger value="placement" className="px-4 py-2 whitespace-nowrap">Yerleştirme</TabsTrigger>
              <TabsTrigger value="share" className="px-4 py-2 whitespace-nowrap">Paylaşım</TabsTrigger>
              <TabsTrigger value="new-register" className="px-4 py-2 whitespace-nowrap">➕ Yeni Üye Kaydı</TabsTrigger>
              <TabsTrigger value="clone-products" className="px-4 py-2 whitespace-nowrap">Ürün Mağazam</TabsTrigger>
              <TabsTrigger value="earnings" className="px-4 py-2 whitespace-nowrap">Kazançlar</TabsTrigger>
              <TabsTrigger value="transactions" className="px-4 py-2 whitespace-nowrap">İşlemler</TabsTrigger>
              <TabsTrigger value="documents" className="px-4 py-2 whitespace-nowrap">Dökümanlar</TabsTrigger>
              <TabsTrigger value="profile" className="px-4 py-2 whitespace-nowrap">Profil</TabsTrigger>
              <TabsTrigger value="manevi" className="px-4 py-2 whitespace-nowrap">🕌 Manevi Panel</TabsTrigger>
              <TabsTrigger value="zahiri" className="px-4 py-2 whitespace-nowrap">✨ Zahiri Panel</TabsTrigger>
              <TabsTrigger value="batini" className="px-4 py-2 whitespace-nowrap">💎 Batıni Panel</TabsTrigger>
              <TabsTrigger value="siyernebi" className="px-4 py-2 whitespace-nowrap">📜 Siyer-i Nebi</TabsTrigger>
              <TabsTrigger value="kadinilmihali" className="px-4 py-2 whitespace-nowrap">🌸 Kadın İlmihali</TabsTrigger>
              <TabsTrigger value="islamtemeli" className="px-4 py-2 whitespace-nowrap">🕋 İslam Temeli</TabsTrigger>
              <TabsTrigger value="training" className="px-4 py-2 whitespace-nowrap relative" onClick={fetchUpcomingTrainings}>
                🎥 Eğitimler
                {upcomingTrainings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{upcomingTrainings.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="blueprint" className="px-4 py-2 whitespace-nowrap text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200">
                🔮 Master Blueprint
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            
            {/* $100 Hak Ediş ve Aktiflik Barajı (Progress Bar) */}
            {eligibilityData ? (
              <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <CardHeader className="pb-2 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 animate-pulse">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-md font-bold text-slate-100">
                          $100 Hak Ediş ve Aktiflik Barajı
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                          Kariyer, unilevel derinlik ve havuz primlerinizi aktif etmek için aylık hacim barajı
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={eligibilityData.isEligible ? "bg-green-500 text-white font-extrabold" : "bg-amber-500 text-slate-950 font-extrabold"}>
                      {eligibilityData.isEligible ? "✓ HAK EDİŞ AKTİF" : "⚠ BEKLEMEDE (HELD)"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between text-xs text-slate-300 font-bold">
                        <span>Aylık Kişisel Ciro: ${eligibilityData.personalVolume.toFixed(2)} USD</span>
                        <span>Hedef: $100.00 USD</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 p-[1px]">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            eligibilityData.isEligible ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-amber-500 to-orange-400"
                          )}
                          style={{ width: `${Math.min(100, (eligibilityData.personalVolume / 100) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center min-w-[150px]">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Bekleyen (HELD) Primler</span>
                      <span className="text-xl font-extrabold text-amber-400">${eligibilityData.totalHeld.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-dashed border-purple-500/30 bg-purple-950/10">
                    <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      {eligibilityData.alertMessage}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold pl-5">
                      💡 {eligibilityData.actionTip}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 flex-wrap gap-3">
                    <div className="text-xs text-slate-400 font-medium">
                      {eligibilityData.isEligible 
                        ? "✓ Aktifliğiniz sağlanmıştır, tüm primler cüzdanınıza anında aktarılmaktadır."
                        : "⚠ Aktif olmak ve biriken primlerinizi çözmek için ürün satın almalısınız."}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate('/products')}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/10 ml-auto"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ürün Satın Al / Aktif Ol
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-slate-500">
                Aktiflik verileri yükleniyor...
              </Card>
            )}

            {/* Dinamik Widget Seçim Paneli */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-purple-600" />
                  Dinamik Widget Sistemi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kontrol panelinizde görmek istediğiniz bilgi kartlarını seçip kişiselleştirin:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={activeWidgets.includes("finance") ? "default" : "outline"}
                  onClick={() => {
                    setActiveWidgets(prev => prev.includes("finance") ? prev.filter(w => w !== "finance") : [...prev, "finance"]);
                  }}
                  className={cn(
                    "text-xs font-bold rounded-full gap-1.5 transition-all",
                    activeWidgets.includes("finance") ? "bg-purple-600 text-white hover:bg-purple-700" : "text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Finansal Özet
                </Button>
                <Button
                  size="sm"
                  variant={activeWidgets.includes("team") ? "default" : "outline"}
                  onClick={() => {
                    setActiveWidgets(prev => prev.includes("team") ? prev.filter(w => w !== "team") : [...prev, "team"]);
                  }}
                  className={cn(
                    "text-xs font-bold rounded-full gap-1.5 transition-all",
                    activeWidgets.includes("team") ? "bg-purple-600 text-white hover:bg-purple-700" : "text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  Ekip Sağlığı
                </Button>
                <Button
                  size="sm"
                  variant={activeWidgets.includes("challenges") ? "default" : "outline"}
                  onClick={() => {
                    setActiveWidgets(prev => prev.includes("challenges") ? prev.filter(w => w !== "challenges") : [...prev, "challenges"]);
                  }}
                  className={cn(
                    "text-xs font-bold rounded-full gap-1.5 transition-all",
                    activeWidgets.includes("challenges") ? "bg-purple-600 text-white hover:bg-purple-700" : "text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Eğitim & Hedefler
                </Button>
              </div>
            </div>

            {/* Dinamik Grid Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Widget 1: Finansal Özet */}
              {activeWidgets.includes("finance") && (
                <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-purple-600 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      Finansal Özet & Komisyon Dağılımı
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Yeni döngüye göre güncellenen kazanç yapısı
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Kullanıcı Cüzdanı</span>
                        <span className="text-md font-extrabold text-slate-900">${user?.wallet?.balance.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Toplam Kazanç</span>
                        <span className="text-md font-extrabold text-slate-900">${user?.wallet?.totalEarnings.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* SVG Pie Chart representing the new 50% / 25% / 15% / 10% scheme */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90">
                          {/* Company Fund: 50% (L: 100, stroke-dasharray: 87.96 175.93) */}
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="87.96 175.93" strokeDashoffset="0" />
                          {/* Direct Sponsor: 25% (stroke-dasharray: 43.98) */}
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="43.98 175.93" strokeDashoffset="-87.96" />
                          {/* 7-depth Unilevel: 15% (stroke-dasharray: 26.39) */}
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="26.39 175.93" strokeDashoffset="-131.94" />
                          {/* Monthly Perf Pool: 10% (stroke-dasharray: 17.59) */}
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="17.59 175.93" strokeDashoffset="-158.33" />
                        </svg>
                        <span className="absolute text-[9px] font-black text-slate-800">AKN %</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] flex-1 font-semibold">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block" />
                          <span>Şirket: %50</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
                          <span>Sponsor: %25</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm inline-block" />
                          <span>Unilevel: %15</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm inline-block" />
                          <span>Havuz: %10</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Widget 2: Ekip Sağlığı */}
              {activeWidgets.includes("team") && (
                <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-blue-600 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Ekip Sağlığı & Aktiflik Oranı
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Organizasyonunuzun güncel aktivite durumu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Aktif Üye Gücü</span>
                        <span>{teamMembers.filter(m => m.isActive).length} / {teamMembers.length} Üye</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${teamMembers.length > 0 ? (teamMembers.filter(m => m.isActive).length / teamMembers.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1.5 font-sans font-medium">
                      <div className="flex justify-between">
                        <span>Toplam Ekip Boyutu:</span>
                        <span className="font-extrabold text-slate-950">{user?.totalTeamSize || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toplam Ekip Cirosu:</span>
                        <span className="font-extrabold text-slate-950">${(user?.teamTurnoverUSD || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Widget 3: Eğitim & Hedefler */}
              {activeWidgets.includes("challenges") && (
                <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-emerald-600 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Zeka Katmanı: Eğitim & Hedefler
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Geçmiş performansınıza özel yapay zeka hedefleri (Challenge)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 px-1">
                    {challenges.map((ch, idx) => (
                      <div key={ch.id || idx} className="space-y-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-800 leading-tight">{ch.title}</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-black truncate max-w-[100px]">{ch.reward}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{ch.description}</p>
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between text-[9px] text-slate-600 font-bold">
                            <span>Sizin: {ch.current} {ch.unit}</span>
                            <span>Hedef: {ch.target} {ch.unit}</span>
                          </div>
                          <Progress value={ch.progress} className="h-1.5 bg-slate-200" />
                        </div>
                      </div>
                    ))}
                    {challenges.length === 0 && (
                      <p className="text-center text-xs text-slate-500 py-4 font-medium">Hedefler yükleniyor...</p>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
                <CardHeader>
                  <CardTitle className="text-gray-900">Hızlı Paylaşım</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Organizasyonunuzu büyütmek için link paylaşın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input value={clonePageUrl} readOnly className="flex-1 bg-gray-50 text-black border-gray-300" />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(clonePageUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
 
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={shareViaWhatsApp}
                      className="w-full text-black border-gray-300 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareViaEmail}
                      className="w-full text-black border-gray-300 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
 
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-900 font-bold mb-2">
                      Paylaşım İstatistikleri:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-black">{shareStats.visits}</p>
                        <p className="text-xs text-gray-700 font-medium">Ziyaret</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-black">
                          {shareStats.conversions}
                        </p>
                        <p className="text-xs text-gray-700 font-medium">Kayıt</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-black">
                          {shareStats.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-700 font-medium">Oran</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className={`${vividTheme.statCard} bg-white shadow-sm`}>
              <CardHeader>
                <CardTitle className="text-gray-900">Son Ekip Üyeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{member.fullName}</p>
                        <p className="text-xs text-gray-600 font-medium">
                          {member.memberId} • {member.careerLevel}
                        </p>
                      </div>
                      <Badge
                        variant={member.isActive ? "default" : "secondary"}
                      >
                        {member.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-center text-gray-600 font-medium py-4">
                      Henüz ekip üyeniz bulunmuyor. Link paylaşarak ekibinizi
                      büyütün!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className={`${vividTheme.statCard} bg-white/90`}>
              <CardHeader>
                <CardTitle>
                  Ekip Organizasyonum ({teamMembers.length})
                </CardTitle>
                <CardDescription>
                  Sizin referansınızla katılan tüm üyeler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Üye ID</TableHead>
                        <TableHead>İsim</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Seviye</TableHead>
                        <TableHead>Yatırım</TableHead>
                        <TableHead>Pozisyon</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Ekip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member, idx) => (
                      <TableRow key={`${member.id}-${idx}`}>
                        <TableCell className="font-mono">
                          {member.memberId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.fullName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.careerLevel}</Badge>
                        </TableCell>
                        <TableCell>${member.totalInvestment}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.position === "direct"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.position === "direct"
                              ? "Direkt"
                              : "Ruhsal Gelişim Hattı"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.isActive ? "default" : "secondary"}
                          >
                            {member.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewMemberTeam(member)}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ekibi Gör
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            </Card>
          </TabsContent>

          {/* Monoline Tree View Tab */}
          <TabsContent value="monoline-tree" className="space-y-6">
            <Card className="bg-white border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">🌳 Ruhsal Gelişim Ağaç Yapınız</h3>
                      <p className="text-sm text-gray-700">Sizin ağaç yapınızı ve tüm alt ağınızı görüntüleyin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-900">💎 Tek Hat Sistemi</p>
                    <p className="text-xs text-gray-800">7 seviye derinlik + pasif gelir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user && (
              <MonolineTreeView
                userId={user.id}
                userName={user.fullName}
                memberId={user.memberId}
                maxLevels={7}
              />
            )}
          </TabsContent>

          {/* Team Placement Management Tab */}
          <TabsContent value="placement" className="space-y-6">
            {/* Pending Placements Overview */}
            <Card className="bg-white border-2 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">👥 Takım Yerleştirme Merkezi</h3>
                      <p className="text-sm text-gray-700">Yeni üyeleri takımınızda istediğiniz pozisyona yerleştirin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-700">⏳ Bekleyen: {pendingPlacements.filter(p => p.status === 'pending').length}</p>
                    <p className="text-xs text-gray-800">Toplam Takım: {user?.totalTeamSize || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Placements List */}
            {pendingPlacements.filter(p => p.status === 'pending').length > 0 ? (
              <Card className={`${vividTheme.statCard} bg-white/90`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span>📋 Yerleştirilmeyi Bekleyen Üyeler</span>
                  </CardTitle>
                  <CardDescription>
                    Referans linkiniz üzerinden kayıt olan üyeler için pozisyon seçin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPlacements.filter(p => p.status === 'pending').map((placement) => (
                      <div key={placement.id} className="p-4 border rounded-lg bg-white border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                {placement.newUserData.fullName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{placement.newUserData.fullName}</h3>
                                <p className="text-sm text-gray-800">{placement.newUserData.email}</p>
                                <p className="text-xs text-gray-700">
                                  Kayıt: {new Date(placement.registrationDate).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-xs">
                              <Badge variant="outline">📞 {placement.newUserData.phone}</Badge>
                              <Badge variant="outline">📦 {placement.newUserData.membershipType}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handlePlacementSelection(placement)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Pozisyon Seç
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Bekleyen Yerleştirme Yok</h3>
                  <p className="text-gray-700 mb-4">
                    Şu anda yerleştirilmeyi bekleyen yeni üye bulunmuyor.
                  </p>
                  <Button variant="outline" onClick={() => { const link = clonePageUrl; const text = `Referans linkim: ${link}`; if ((navigator as any).share) { (navigator as any).share({ title: 'Referans Linki', text, url: link }).catch(() => copyToClipboard(link)); } else { copyToClipboard(link); } }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Referans Linkini Paylaş
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Structure Visualization */}
            <Card className="border-2 border-green-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TreePine className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle>🌳 Takım Yapınız ve Analiz</CardTitle>
                      <CardDescription>Monoline zincirinizdeki sıradaki {monolineDownline.length} üye (7 derinlik)</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => setActiveTab("monoline-tree")}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Tüm Ağ Görünümü
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {monolineDownlineLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center text-slate-500">
                      <TreePine className="w-8 h-8 animate-spin mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Zincir yükleniyor...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0">
                    {/* Current User Node */}
                    <div className="flex justify-center">
                      <div className="bg-blue-600 border-4 border-white shadow-xl rounded-2xl p-3 text-center text-white w-44">
                        <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-lg">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="text-sm font-bold truncate">{user?.fullName}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">SİZ · #{user?.globalRank || '—'}</div>
                      </div>
                    </div>

                    {monolineDownline.length === 0 ? (
                      <>
                        <div className="h-8 w-0.5 bg-gradient-to-b from-blue-400 to-purple-300"></div>
                        <div className="w-full max-w-xs p-4 border-2 border-dashed border-purple-300 rounded-2xl flex flex-col items-center bg-purple-50/50">
                          <Plus className="w-6 h-6 text-purple-400 mb-1" />
                          <p className="text-xs font-bold text-purple-700">Zincirde sonraki pozisyon boş</p>
                          <p className="text-[10px] text-purple-500 mt-0.5">Yeni kayıtlar buraya yerleşecek</p>
                        </div>
                      </>
                    ) : (
                      monolineDownline.map((member: any, idx: number) => {
                        const levelColors = [
                          'border-purple-300 bg-purple-50',
                          'border-blue-300 bg-blue-50',
                          'border-green-300 bg-green-50',
                          'border-yellow-300 bg-yellow-50',
                          'border-orange-300 bg-orange-50',
                          'border-red-300 bg-red-50',
                          'border-pink-300 bg-pink-50',
                        ];
                        const textColors = [
                          'text-purple-800','text-blue-800','text-green-800',
                          'text-yellow-800','text-orange-800','text-red-800','text-pink-800',
                        ];
                        const dotColors = [
                          'bg-purple-500','bg-blue-500','bg-green-500',
                          'bg-yellow-500','bg-orange-500','bg-red-500','bg-pink-500',
                        ];
                        const colorIdx = idx % 7;
                        return (
                          <React.Fragment key={`${member.id}-${idx}`}>
                            <div className="h-6 w-0.5 bg-gradient-to-b from-slate-300 to-slate-400"></div>
                            <div className={`w-full max-w-xs px-4 py-2.5 border-2 rounded-xl flex items-center gap-3 ${levelColors[colorIdx]}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${dotColors[colorIdx]}`}>
                                {member.fullName?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold truncate ${textColors[colorIdx]}`}>{member.fullName}</div>
                                <div className="text-[10px] text-slate-500">{member.memberId} · Sıra #{member.globalRank}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className={`text-[9px] font-black uppercase ${textColors[colorIdx]}`}>Seviye {idx + 1}</div>
                                <div className={`w-2 h-2 rounded-full mx-auto mt-0.5 ${member.isActive ? 'bg-green-500' : 'bg-red-400'}`}></div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}

                    {monolineDownline.length > 0 && (
                      <div className="mt-4 w-full max-w-xs">
                        <div className="h-6 w-0.5 bg-gradient-to-b from-slate-300 to-transparent mx-auto"></div>
                        <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center bg-slate-50/50">
                          <Plus className="w-4 h-4 text-slate-400 mb-0.5" />
                          <p className="text-[10px] text-slate-500">Sıradaki pozisyon açık</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Tab - Enhanced Clone Page Management */}
          <TabsContent value="share" className="space-y-6">
            {/* Clone Page URL and QR Code */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Kişisel Klon Sayfanız
                  </CardTitle>
                  <CardDescription>
                    Kendi referans ID'niz ile özelleştirilmiş landing sayfanız
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">
                      Klon Sayfa URL'iniz:
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={clonePageUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button onClick={() => copyToClipboard(clonePageUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Üye ID'niz:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={user.memberId}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(user.memberId)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Referans Kodunuz:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={user.referralCode}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(user.referralCode)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => window.open(clonePageUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Klon Sayfanızı Görüntüle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(`${clonePageUrl}?preview=true`, "_blank")
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Önizleme
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    QR Kod
                  </CardTitle>
                  <CardDescription>Mobil paylaşım için QR kod</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrCodeUrl && (
                    <div className="text-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto border rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={downloadQRCode}
                      disabled={!qrCodeUrl}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      İndir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(clonePageUrl)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Sosyal Medya Paylaşımı
                </CardTitle>
                <CardDescription>
                  Klon sayfanızı farklı platformlarda paylaşın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareViaWhatsApp}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaFacebook}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaTwitter}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Twitter className="w-6 h-6 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaInstagram}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <span className="text-xs">Instagram</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaTelegram}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Send className="w-6 h-6 text-blue-500" />
                    <span className="text-xs">Telegram</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="flex flex-col h-20 space-y-1"
                  >
                    <Mail className="w-6 h-6 text-gray-800" />
                    <span className="text-xs">Email</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Clone Page Customization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Sayfa Özelleştirme
                  </CardTitle>
                  <CardDescription>
                    Klon sayfanızın görünümünü özelleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Özel Mesajınız:</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Ziyaretçilerinize özel bir mesaj yazın..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Başlık Rengi:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={clonePageSettings.headerColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              headerColor: e.target.value,
                            })
                          }
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          value={clonePageSettings.headerColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              headerColor: e.target.value,
                            })
                          }
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Buton Rengi:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={clonePageSettings.buttonColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              buttonColor: e.target.value,
                            })
                          }
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          value={clonePageSettings.buttonColor}
                          onChange={(e) =>
                            setClonePageSettings({
                              ...clonePageSettings,
                              buttonColor: e.target.value,
                            })
                          }
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clonePageSettings.showTestimonials}
                        onChange={(e) =>
                          setClonePageSettings({
                            ...clonePageSettings,
                            showTestimonials: e.target.checked,
                          })
                        }
                      />
                      <span>Yorumları Göster</span>
                    </Label>
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clonePageSettings.showFeatures}
                        onChange={(e) =>
                          setClonePageSettings({
                            ...clonePageSettings,
                            showFeatures: e.target.checked,
                          })
                        }
                      />
                      <span>Özellikleri Göster</span>
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={updateCustomMessage}>
                      <Save className="w-4 h-4 mr-2" />
                      Mesajı Kaydet
                    </Button>
                    <Button onClick={updateClonePageSettings} variant="outline">
                      <Palette className="w-4 h-4 mr-2" />
                      Tasarımı Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Performans İstatistikleri
                  </CardTitle>
                  <CardDescription>
                    Klon sayfanızın performans verileriniz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{shareStats.visits}</p>
                      <p className="text-sm text-slate-700">
                        Toplam Ziyaret
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {shareStats.conversions}
                      </p>
                      <p className="text-sm text-slate-700">
                        Yeni Kayıt
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {shareStats.conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-slate-700">
                        Dönüşüm Oranı
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-2">Paylaşım İpuçları:</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• QR kodu kartvizitirinize ekleyin</li>
                      <li>• Sosyal medyada düzenli paylaşın</li>
                      <li>• WhatsApp durumunda paylaşın</li>
                      <li>• Email imzanıza ekleyin</li>
                      <li>• özel mesajınızı düzenli güncelleyin</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Sık kullanılan paylaşım ve yönetim işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="default"
                    onClick={() => {
                      const authToken = localStorage.getItem("authToken");
                      if (!authToken) {
                        alert(
                          "Bu özellik için tekrar giriş yapmanız gerekiyor.",
                        );
                        navigate("/login");
                        return;
                      }
                      navigate("/e-wallet");
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    E-Cüzdan & Finansal
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => {
                      const authToken = localStorage.getItem("authToken");
                      if (!authToken) {
                        alert(
                          "Bu özellik için tekrar giriş yapmanız gerekiyor.",
                        );
                        navigate("/login");
                        return;
                      }
                      navigate("/real-time-transactions");
                    }}
                    className="bg-gradient-to-r from-primary to-spiritual-purple"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Gerçek Zamanlı İşlemler
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `${user?.fullName} - ${user?.memberId}\nAKN Group Davet Linki:\n${clonePageUrl}`;
                      navigator.clipboard.writeText(text);
                      alert("Kartvizit metni kopyalandı!");
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Kartvizit Metni
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const emailSignature = `\n\n---\n${user?.fullName}\nAKN Group Üyesi\n${clonePageUrl}`;
                      navigator.clipboard.writeText(emailSignature);
                      alert("Email imzası kopyalandı!");
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email İmzası
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "AKN Group Daveti",
                          text: `${user?.fullName} üzerinden katılın!`,
                          url: clonePageUrl,
                        });
                      } else {
                        copyToClipboard(clonePageUrl);
                        alert("Link kopyalandı!");
                      }
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobil Paylaş
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    QR Yazdır
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Member Registration Tab */}
          <TabsContent value="new-register" className="space-y-6">
            <Card className="bg-white border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold text-slate-900 border-b pb-2">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Yeni Üye Kayıt Portalı
                </CardTitle>
                <CardDescription className="text-slate-800 font-medium mt-1">
                  Kendi panelinizden doğrudan alt ekibinize yeni üye kaydedin. Kayıt olan üye otomatik olarak sizin sponsorluğunuzda sisteme eklenir ve monoline zincirine dahil olur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registerSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-sm font-medium">
                    {registerSuccess}
                  </div>
                )}
                {registerError && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-medium">
                    {registerError}
                  </div>
                )}

                <form onSubmit={handlePanelRegisterSubmit} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="panel-reg-fullName">Ad Soyad</Label>
                      <Input
                        id="panel-reg-fullName"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                        placeholder="Örn: Ahmet Yılmaz"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panel-reg-email">E-posta Adresi</Label>
                      <Input
                        id="panel-reg-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        placeholder="Örn: ahmet@example.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="panel-reg-phone">Telefon Numarası</Label>
                      <Input
                        id="panel-reg-phone"
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        placeholder="Örn: 5551234567"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panel-reg-password">Parola (En az 6 karakter)</Label>
                      <Input
                        id="panel-reg-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        placeholder="******"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border bg-slate-50 p-4 rounded-lg mt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">SPONSOR DETAYI</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{user?.fullName || "Yükleniyor..."}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">SPONSOR ID</p>
                        <p className="text-sm font-bold text-purple-700 mt-0.5">{user?.memberId || "Yükleniyor..."}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs mt-3 border-t pt-2">
                      * Yeni kaydedilen tüm üyelerin ilk başlangıç paketi <strong>Zorunlu Giriş Paketi ($100)</strong> olacaktır.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={registerLoading} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 font-bold text-white">
                      {registerLoading ? "Kaydediliyor..." : "Üyeyi Kaydet"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clone Products Tab */}
          <TabsContent value="clone-products" className="space-y-6">
            {/* Clone Product Page Header */}
            <Card className="bg-white border-2 border-spiritual-gold/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-spiritual-gold to-primary rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">🛍️ Kişisel Ürün Mağazanız</h3>
                      <p className="text-gray-900 font-medium">Özel ürün sayfanızdan yapılan alışverişlerde %15 otomatik komisyon kazanın</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-spiritual-gold">%15 Komisyon Garantisi</p>
                    <p className="text-sm text-gray-900 font-medium">Her satışta otomatik</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clone Product URL and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <ShoppingCart className="w-5 h-5 mr-2 text-spiritual-gold" />
                    Ürün Mağaza Linkiniz
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Bu linki paylaşarak ürün satışı yapın ve %15 komisyon kazanın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <Label className="text-sm font-bold text-black">
                      Kişisel Ürün Mağaza URL'iniz:
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={`${window.location.origin}/clone-products/${user?.memberId}`}
                        readOnly
                        className="font-mono text-sm bg-white text-black border-gray-300"
                      />
                      <Button
                        onClick={() => copyToClipboard(`${window.location.origin}/clone-products/${user?.memberId}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-spiritual-gold to-spiritual-gold/80 hover:from-spiritual-gold/90 hover:to-spiritual-gold/70"
                      onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ürün Mağazanızı Görüntüle
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const text = `${user?.fullName} özel ürün mağazasına göz atın! Premium manevi ürünler ve %15 otomatik komisyon sistemi. ${window.location.origin}/clone-products/${user?.memberId}`;
                          window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const text = `${user?.fullName} özel ürün mağazası: ${window.location.origin}/clone-products/${user?.memberId}`;
                          navigator.clipboard.writeText(text);
                          alert("Sosyal medya metni kopyalandı!");
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Sosyal Medya
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Ürün Mağaza İstatistikleri
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Kişisel ürün sayfanızın performans verileri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900">{cloneInfo.visits || 0}</p>
                      <p className="text-sm text-gray-800">
                        Sayfa Ziyareti
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900">{cloneInfo.conversions || 0}</p>
                      <p className="text-sm text-gray-800">
                        Başarılı Satış
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-spiritual-gold/10">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-spiritual-gold" />
                      <p className="text-2xl font-bold text-gray-900">${(cloneInfo.conversions || 0) * 25}</p>
                      <p className="text-sm text-gray-800">
                        Tahmini Komisyon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clone Product Features */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">🎯 Ürün Mağazası Özellikleri</CardTitle>
                <CardDescription className="text-gray-600">
                  Kişisel ürün mağazanızın sunduğu avantajlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-spiritual-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-6 h-6 text-spiritual-gold" />
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900">%25 Sponsor Bonusu</h4>
                    <p className="text-sm text-gray-800">
                      Her satışta anında hesabınıza yatırılır
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900">Anında İşlem</h4>
                    <p className="text-sm text-gray-800">
                      Satış gerçekleşir gerçekleşmez komisyon hesaplanır
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900">Müşteri Takibi</h4>
                    <p className="text-sm text-gray-800">
                      Satış yapılan müşteriler otomatik olarak kaydedilir
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Network className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-900">Ruhsal Gelişim Entegrasyonu</h4>
                    <p className="text-sm text-gray-800">
                      Normal sistem dağıtımı da devam eder
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clone Product Sales */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Son Ürün Satışları</CardTitle>
                <CardDescription className="text-gray-600">
                  Kişisel ürün mağazanızdan yapılan son satışlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      customer: "m***@gmail.com",
                      product: "Manevi Gelişim Premium Seti",
                      amount: 299,
                      commission: 44.85,
                      date: "2 saat önce",
                      status: "Tamamlandı"
                    },
                    {
                      id: 2,
                      customer: "a***@hotmail.com",
                      product: "Kutsal Tesbihat ve Zikirmatik",
                      amount: 149,
                      commission: 22.35,
                      date: "1 gün önce",
                      status: "Kargoda"
                    },
                    {
                      id: 3,
                      customer: "f***@yahoo.com",
                      product: "Nefis Mertebeleri Eğitim Paketi",
                      amount: 499,
                      commission: 74.85,
                      date: "3 gün önce",
                      status: "Teslim Edildi"
                    },
                  ].map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-spiritual-gold/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-spiritual-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sale.product}</p>
                          <p className="text-sm text-gray-800">
                            {sale.customer} • {sale.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${sale.amount}</p>
                        <p className="text-sm text-spiritual-gold font-medium">
                          +${sale.commission} komisyon
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  <div className="text-center py-8 text-gray-800 border-2 border-dashed rounded-lg">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Henüz ürün satışı yok</p>
                    <p className="text-sm mb-4">
                      Ürün mağaza linkinizi paylaşarak ilk satışınızı yapın!
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Mağazanızı Görüntüle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Clone Products */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Hızlı İşlemler</CardTitle>
                <CardDescription className="text-gray-600">
                  Ürün mağazanız için hızlı paylaşım ve yönetim işlemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="default"
                    onClick={() => window.open(`${window.location.origin}/clone-products/${user?.memberId}`, "_blank")}
                    className="bg-gradient-to-r from-spiritual-gold to-spiritual-gold/80"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Mağazayı Aç
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const storeUrl = `${window.location.origin}/clone-products/${user?.memberId}`;
                      const text = `🛍️ ${user?.fullName} özel ürün mağazası!\n\n✨ Premium manevi ürünler\n💰 %15 otomatik komisyon sistemi\n🚀 Anında işlem garantisi\n\n${storeUrl}`;
                      navigator.clipboard.writeText(text);
                      alert("Mağaza tanıtım metni kopyalandı!");
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Tanıtım Metni
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const storeUrl = `${window.location.origin}/clone-products/${user?.memberId}`;
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}`;
                      safeDownloadUrl(qrUrl, `${user?.memberId}-store-qr.png`);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR İndir
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/clone-customers")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Müşteri Takibi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kazanç Detayları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Sponsor Bonusu
                      </span>
                      <span className="font-bold text-green-600">
                        ${user.wallet.sponsorBonus.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Kariyer Bonusu
                      </span>
                      <span className="font-bold text-blue-600">
                        ${user.wallet.careerBonus.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm font-medium">Pasif Gelir</span>
                      <span className="font-bold text-purple-600">
                        ${user.wallet.passiveIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-sm font-medium">
                        Liderlik Bonusu
                      </span>
                      <span className="font-bold text-orange-600">
                        ${user.wallet.leadershipBonus.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kariyer İlerleme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge className="text-lg p-3">
                        <Award className="w-5 h-5 mr-2" />
                        {user.careerLevel.name}
                      </Badge>
                      <p className="text-sm text-slate-700 mt-2">
                        Mevcut Kariyer Seviyeniz
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Komisyon Oranı:</span>
                        <span className="font-bold">
                          %{user.careerLevel.commissionRate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Direkt Üye:</span>
                        <span className="font-bold">
                          {user.directReferrals}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Toplam Ekip:</span>
                        <span className="font-bold">{user.totalTeamSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Toplam Yatırım:</span>
                        <span className="font-bold">
                          ${user.totalInvestment}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  E-Cüzdan
                </CardTitle>
                <CardDescription>Bakiyenizi yönetin, para yatırma/çekme talebi oluşturun</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/wallet')} className="bg-green-600 hover:bg-green-700">Detayları Gör</Button>
                <Button variant="outline" onClick={() => navigate('/wallet')}>Para Yatır</Button>
                <Button variant="outline" onClick={() => navigate('/wallet')}>Para Çek</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
                <CardDescription>
                  Tüm kazanç ve ödeme işlemleriniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>İşlem Türü</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, idx) => (
                      <TableRow key={`${transaction.id}-${idx}`}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            "tr-TR",
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.amount >= 0 ? "+" : ""}$
                          {Math.abs(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.status === "completed"
                              ? "Tamamlandı"
                              : "Beklemede"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-slate-700">
                    Henüz işlem bulunmuyor
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* System Presentation Call-to-action */}
            <Card className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen className="w-32 h-32 rotate-12" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-white/20">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      Başarı Rehberi
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Sistem Tanıtım ve Kazanç Sunumu</h3>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                      Bu işi niçin yapmalısınız? Kariyer basamaklarını tırmandığınızda sizi hangi ödüller bekliyor? 
                      Sponsorluk zincirinden global havuz kazançlarına kadar tüm detaylar bu interaktif sunumda.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Detaylı Kazanç Planı Analizi",
                        "Kariyer Ünvanları ve Primleri",
                        "Ürün ve Puanlama Sistemi",
                        "Sponsorluk ve Derinlik Bonusları"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-indigo-100/80">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => setIsPresentationOpen(true)}
                      className="bg-white text-indigo-700 hover:bg-indigo-50 font-black px-8 h-14 text-lg rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Sunumu Başlat
                    </Button>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const link = `${window.location.origin}/register?ref=${user?.referralCode || 'ak0000001'}`;
                          toast({
                            title: "Sunum Dosyası Hazırlanıyor",
                            description: `Sunum dosyası referans linkinizle (${link}) optimize ediliyor. İndirme birazdan başlayacak.`,
                          });
                          downloadDocument('doc-001-pdf', 'AKN-Group-Sunum.pdf');
                        }}
                        className="bg-indigo-100/20 border-white/40 text-white hover:bg-white/20 font-bold px-8 h-14 text-lg rounded-2xl shadow-xl backdrop-blur-sm"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        PDF İndir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/register?ref=${user?.referralCode || 'ak0000001'}`;
                          navigator.clipboard.writeText(shareUrl);
                          toast({
                            title: "Link Kopyalandı",
                            description: "Sunum paylaşım linkiniz panoya kopyalandı. Bu linki paylaştığınızda yeni üyeler sizin referansınızla kayıt olacaktır.",
                          });
                        }}
                        className="text-indigo-100/70 hover:text-white text-xs font-bold"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Paylaşım Linkini Kopyala
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">📚 Eğitim Dökümanları</h3>
                      <p className="text-sm text-gray-700">Admin tarafından paylaşılan eğitim materyalleri ve dokümanlar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-700">🔄 Otomatik Güncellenen</p>
                    <p className="text-xs text-gray-800">Toplam: {documents.length} döküman</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {documentsLoading ? (
                // Loading State
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : documents.length === 0 ? (
                // Empty State
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Henüz döküman bulunmuyor</h3>
                      <p className="text-gray-700 mb-4">Admin tarafından paylaşılan dökümanlar burada görünecek</p>
                      <Button
                        onClick={() => loadDocuments()}
                        variant="outline"
                        className="border-2 border-blue-400 hover:border-blue-600"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yenile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Documents List
                documents.map((doc, idx) => (
                  <Card key={`${doc.id}-${idx}`} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Document Header */}
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">{getFileIcon(doc.fileName)}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{doc.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {doc.category === 'general' && '📋 Genel'}
                                {doc.category === 'guide' && '📖 Kılavuz'}
                                {doc.category === 'training' && '🎓 Eğitim'}
                                {doc.category === 'mlm' && '🌳 İrfan Sistemi'}
                                {doc.category === 'spiritual' && '🕌 Manevi'}
                                {doc.category === 'financial' && '💰 Finansal'}
                                {doc.category === 'announcement' && '📢 Duyuru'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {doc.type === 'document' && '📄 Döküman'}
                                {doc.type === 'presentation' && '📊 Sunum'}
                                {doc.type === 'spreadsheet' && '📈 Tablo'}
                                {doc.type === 'image' && '🖼️ Görsel'}
                                {doc.type === 'video' && '🎥 Video'}
                                {doc.type === 'audio' && '🎵 Ses'}
                                {doc.type === 'archive' && '📦 Arşiv'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Document Description */}
                        <p className="text-sm text-gray-800 line-clamp-3">{doc.description}</p>

                        {/* Document Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-gray-800">Dosya:</span>
                            <p className="text-gray-800 truncate">{doc.fileName}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Boyut:</span>
                            <p className="text-gray-800">{formatFileSize(doc.fileSize)}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Tarih:</span>
                            <p className="text-gray-800">{new Date(doc.uploadDate).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Erişim:</span>
                            <p className="text-gray-800">
                              {doc.accessLevel === 'all' && '👥 Herkes'}
                              {doc.accessLevel === 'members' && '🏆 Üyeler'}
                              {doc.accessLevel === 'leaders' && '👑 Liderler'}
                              {doc.accessLevel === 'admins' && '⚙️ Adminler'}
                            </p>
                          </div>
                        </div>

                        {/* Document Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                  #{tag}
                                </Badge>
                              ))}
                              {doc.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  +{doc.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className={cn(
                              "flex-1 text-white",
                              ['doc-001', 'doc-002', 'doc-003'].includes(doc.id) 
                                ? "bg-indigo-600 hover:bg-indigo-700 animate-pulse" 
                                : "bg-blue-600 hover:bg-blue-700"
                            )}
                            onClick={() => downloadDocument(doc.id, doc.fileName)}
                          >
                            {doc.id === 'doc-002' ? (
                              <><Calculator className="w-4 h-4 mr-1" /> Hesapla</>
                            ) : doc.id === 'doc-001' ? (
                              <><BookOpen className="w-4 h-4 mr-1" /> Başlat</>
                            ) : (
                              <><Download className="w-4 h-4 mr-1" /> {['doc-001', 'doc-002', 'doc-003'].includes(doc.id) ? 'Uygula' : 'İndir'}</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-green-400 hover:border-green-600 hover:bg-green-50"
                            onClick={() => {
                              if (doc.id === 'doc-001' || doc.id === 'doc-002' || doc.id === 'doc-003') {
                                downloadDocument(doc.id, doc.fileName);
                              } else {
                                alert(`${doc.title} dökümanı önizleniyor...`);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {['doc-001', 'doc-002', 'doc-003'].includes(doc.id) ? 'Aç' : 'Görüntüle'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Documents Actions */}
            {documents.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-800">
                      Toplam {documents.length} döküman mevcut • Son güncelleme: Az önce
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loadDocuments();
                          alert('Döküman listesi yenilendi!');
                        }}
                        className="border-2 border-blue-400 hover:border-blue-600"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Yenile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert('Tüm dökümanlar indiriliyor...');
                        }}
                        className="border-2 border-green-400 hover:border-green-600"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Hepsini İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-time Sync Info */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">🔄 Otomatik Senkronizasyon</h4>
                    <p className="text-sm text-gray-700">
                      Admin tarafından yüklenen yeni dökümanlar otomatik olarak burada görünür.
                      Erişim izinlerinize göre filtrelenmiş dökümanları görüyorsunuz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <form onSubmit={handleProfileUpdate}>
                  <CardHeader>
                    <CardTitle>Profil Bilgilerini Güncelle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Üye ID</Label>
                      <Input value={user.memberId} readOnly className="bg-slate-100" />
                    </div>
                    <div>
                      <Label htmlFor="perf-fullName">Ad Soyad (Zorunlu)</Label>
                      <Input
                        id="perf-fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-white border-slate-300"
                        placeholder="Ad Soyad"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="perf-email">E-posta Adresi (Zorunlu)</Label>
                      <Input
                        id="perf-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white border-slate-300"
                        placeholder="E-posta adresi"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="perf-phone">Telefon Numarası (Zorunlu)</Label>
                      <Input
                        id="perf-phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white border-slate-300"
                        placeholder="Telefon numarası"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="perf-password">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</Label>
                      <Input
                        id="perf-password"
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-white border-slate-300"
                        placeholder="Yeni şifre (en az 6 karakter)"
                      />
                    </div>
                    <div>
                      <Label>Kayıt Tarihi</Label>
                      <Input
                        value={new Date(user.registrationDate).toLocaleDateString(
                          "tr-TR",
                        )}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={profileUpdating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                    >
                      {profileUpdating ? "Güncelleniyor..." : "Profil Bilgilerini Kaydet"}
                    </Button>
                  </CardContent>
                </form>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Üyelik Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Üyelik Türü</Label>
                    <Input value={user.membershipType} readOnly />
                  </div>
                  <div>
                    <Label>Durum</Label>
                    <Input value={user.isActive ? "Aktif" : "Pasif"} readOnly />
                  </div>
                  <div>
                    <Label>Referans Kodu</Label>
                    <div className="flex space-x-2">
                      <Input value={user.referralCode} readOnly />
                      <Button
                        onClick={() => copyToClipboard(user.referralCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Input value={user.role} readOnly />
                  </div>
                  {user.sponsorId && (
                    <div>
                      <Label>Sponsor ID</Label>
                      <Input value={user.sponsorId} readOnly />
                    </div>
                  )}
                </CardContent>
              </Card>

              {sponsorInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Sponsor Bilgisi</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Sponsor Adı</Label>
                      <Input value={sponsorInfo.fullName} readOnly />
                    </div>
                    <div>
                      <Label>Sponsor Üye ID</Label>
                      <Input value={sponsorInfo.memberId} readOnly />
                    </div>
                    {sponsorInfo.referralCode && (
                      <div>
                        <Label>Sponsor Referans Kodu</Label>
                        <Input value={sponsorInfo.referralCode} readOnly />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Ödeme Sistemi (Stripe Connect)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user.stripeAccountId || !user.stripeOnboardingComplete ? (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-indigo-900 mb-1">Stripe ile Kazancını Çek</h4>
                        <p className="text-sm text-indigo-700">
                          Kazançlarını banka hesabına otomatik olarak çekebilmek için Stripe Connect hesabını kurmalısın. 
                          Güvenli ve hızlı ödeme altyapısı için Stripe kullanıyoruz.
                        </p>
                      </div>
                      <Button 
                        onClick={handleStripeConnect} 
                        disabled={stripeLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                      >
                        {stripeLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Stripe'a Bağlan
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">Stripe Hesabın Bağlı</h4>
                          <p className="text-sm text-green-700">Artık ödemelerini Stripe üzerinden otomatik olarak alabilirsin.</p>
                          <div className="mt-1 font-mono text-xs text-green-600 bg-green-200/30 px-2 py-0.5 rounded inline-block">
                            ID: {user.stripeAccountId}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleStripeConnect} className="text-green-700 border-green-200 hover:bg-green-100">
                        Hesabı Yönet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blueprint" className="space-y-6">
            <MemberBlueprintManager user={user} onRefreshUser={() => fetchUserData(user.id)} />
          </TabsContent>

          <TabsContent value="zahiri" className="space-y-6">
            <Card className={`${vividTheme.statCard} bg-white shadow-xl overflow-hidden border-2 border-purple-500`}>
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 p-8 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[120%] bg-white blur-[100px] rounded-full animate-pulse"></div>
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[120%] bg-purple-500 blur-[100px] rounded-full animate-pulse delay-700"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/20 animate-bounce">
                    <Brain className="w-12 h-12 text-purple-200" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter">Zahiri Arınma Paneli</h2>
                  <p className="max-w-md mx-auto text-purple-100 font-medium">
                    Zihninizdeki kaosu dindirin, ruhunuzdaki ağırlıklardan kurtulun ve manevi potansiyelinizi açığa çıkarın.
                  </p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Hızlı Arınma</h3>
                    <p className="text-sm text-gray-700 mb-4">Günlük stres ve negatif enerjiden 5 dakikada kurtulun.</p>
                    <Button onClick={() => navigate("/zahiri-panel")} variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">Şimdi Başla</Button>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Manevi Korumalar</h3>
                    <p className="text-sm text-gray-700 mb-4">Alanınızı ve auranızı negatif etkilerden korumak için dualar.</p>
                    <Button onClick={() => navigate("/zahiri-panel")} variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white">İncele</Button>
                  </div>
                  <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-pink-600/10 rounded-xl flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">İlham Verici Sözler</h3>
                    <p className="text-sm text-gray-700 mb-4">Mürşit ve bilgelerin yolunuzu aydınlatan hikmetli sözleri.</p>
                    <Button onClick={() => navigate("/zahiri-panel")} variant="outline" className="w-full border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">Keşfet</Button>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Daha Fazlasını Mı Arıyorsunuz?</h3>
                      <p className="text-purple-100 text-sm opacity-90">Tam sürüm Zahiri Panel'de meditasyonlar, frekans müzikleri ve detaylı rehberler sizi bekliyor.</p>
                    </div>
                    <Button onClick={() => navigate("/zahiri-panel")} className="bg-white text-purple-900 hover:bg-purple-50 font-bold whitespace-nowrap">
                      Panelin Tamamına Git
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manevi" className="space-y-6">
            <Card className={`${vividTheme.statCard} bg-white shadow-xl overflow-hidden border-2 border-emerald-500`}>
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 p-8 text-center text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                    <Heart className="w-12 h-12 text-emerald-200" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter">Manevi Tekamül Paneli</h2>
                  <p className="max-w-md mx-auto text-emerald-100 font-medium">
                    Ruhsal gelişiminizi takip edin, hatimlerinizi yönetin ve manevi rehberlik alın.
                  </p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-emerald-100 bg-emerald-50/30">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">Hatim Takibi</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Grup hatimlerinde aldığınız cüzleri buradan güncelleyin.</p>
                      <Button onClick={() => navigate("/manevi-panel")} className="w-full bg-emerald-600 hover:bg-emerald-700">Cüz Seç / Güncelle</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-emerald-100 bg-emerald-50/30">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">Günün Hadisi</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-xs italic text-emerald-800 mb-4">"Din samimiyettir." (Müslim, İman, 95)</p>
                      <Button onClick={() => navigate("/manevi-panel")} variant="outline" className="w-full border-emerald-600 text-emerald-600">Hadis Arşivi</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-100 bg-emerald-50/30">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="w-6 h-6 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">Nefis Analizi</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] mb-1 font-bold text-emerald-700 uppercase">
                          <span>Nefs-i Levvame</span>
                          <span>%45</span>
                        </div>
                        <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{width: '45%'}}></div>
                        </div>
                      </div>
                      <Button onClick={() => navigate("/manevi-panel")} className="w-full bg-emerald-600">Tekamül Testi</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zahiri" className="space-y-6">
            <Card className={`${vividTheme.statCard} bg-white shadow-xl overflow-hidden border-2 border-purple-500`}>
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 p-8 text-center text-white relative overflow-hidden">
                 <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                    <Brain className="w-12 h-12 text-purple-200" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter">Zahiri Arınma Paneli</h2>
                  <p className="max-w-md mx-auto text-purple-100 font-medium">Bedeninizi ve zihninizi arındırın, rızkınızı bereketlendirin.</p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border-purple-100">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-purple-600" />
                          Aktif Arınma Programı
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="p-4 bg-purple-50 rounded-xl mb-4">
                           <p className="font-bold text-purple-900">21 Günlük Karaciğer Detoksu</p>
                           <p className="text-xs text-purple-700">Durum: Devam Ediyor (Gün 4/21)</p>
                        </div>
                        <Button onClick={() => navigate("/zahiri-panel")} className="w-full bg-purple-600">Detayları Gör</Button>
                     </CardContent>
                   </Card>

                   <Card className="border-indigo-100">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          Koruma Kalkanları
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-gray-700 mb-4">Negatif enerjilerden korunmak için aktif yöntemlerinizi yönetin.</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-indigo-100 text-indigo-800">Tuzlu Su</Badge>
                          <Badge className="bg-indigo-100 text-indigo-800">Ayetel Kürsi</Badge>
                          <Badge className="bg-indigo-100 text-indigo-800">Uçucu Yağlar</Badge>
                        </div>
                        <Button onClick={() => navigate("/zahiri-panel")} variant="outline" className="w-full border-indigo-600 text-indigo-600">Ayarları Yönet</Button>
                     </CardContent>
                   </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batini" className="space-y-6">
            <Card className={`${vividTheme.statCard} bg-white shadow-xl overflow-hidden border-2 border-amber-600`}>
              <div className="bg-gradient-to-r from-slate-900 via-amber-900 to-slate-900 p-8 text-center text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                    <Sparkles className="w-12 h-12 text-amber-200" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter text-amber-300">Batıni Sır Paneli</h2>
                  <p className="max-w-md mx-auto text-amber-100 font-medium">Hikmet ehli için derin irfan kapıları ve özel ledünni öğretiler.</p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-900 rounded-3xl border border-amber-500/30 flex flex-col items-center text-center text-white">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                      <Hexagon className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="font-bold mb-2 text-xl text-amber-100">İlm-i Ledün Dersleri</h3>
                    <p className="text-slate-400 mb-6 text-sm">Olayların örüntülerini ve manevi işaretlerini okuma sanatı.</p>
                    <Button onClick={() => navigate("/batini-panel")} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-2xl">Keşiflere Başla</Button>
                  </div>
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <Moon className="w-8 h-8 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-xl">Rüya Analizi</h3>
                    <p className="text-slate-600 mb-6 text-sm">Gördüğünüz sembollerin batıni anlamlarını AKN Group rehberliğinde çözün.</p>
                    <Button onClick={() => navigate("/batini-panel")} variant="outline" className="w-full border-amber-700 text-amber-700 font-bold h-12 rounded-2xl">Rüya Tabiri</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Siyer-i Nebi Tab */}
          <TabsContent value="siyernebi" className="space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-slate-900 text-white">
              <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                    <BookOpen className="w-10 h-10 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter text-amber-300">Siyer-i Nebi Paneli</h2>
                  <p className="max-w-2xl mx-auto text-slate-300 text-sm font-medium">
                    Alemlere rahmet olarak gönderilen Efendimiz Hz. Muhammed’in (s.a.v.) her anı insanlığa rehber olan mübarek hayatı ve sünneti şerifleri.
                  </p>
                  <Button 
                    onClick={() => downloadTextContent("Siyer-i Nebi - Hz Muhammedin Hayati", `HARRANÎ - SİYER-İ NEBİ (HZ. MUHAMMED'İN HAYATI)
----------------------------------------------
Giriş: Alemlere rahmet olarak gönderilen son Peygamber Hz. Muhammed'in (s.a.v.) mübarek hayatı, insanlık tarihi için en güzel ahlak ve hidayet rehberidir.

1. Peygamberimizin Doğumu ve Çocukluğu (Mekke Dönemi)
Peygamber Efendimiz, Miladi 20 Nisan 571 (Rebiülevvel ayının 12'nci gecesi) Pazartesi günü Mekke'de dünyaya gelmiştir. Babası Abdullah, o doğmadan önce vefat etmiştir. Annesi Amine de o henüz 6 yaşındayken vefat etmiş, ardından dedesi Abdülmuttalib'in ve 8 yaşından sonra da amcası Ebu Talib'in himayesine girmiştir.

2. Gençlik Yılları ve Evliliği (Mekke Dönemi)
Gençliğinde dürüstlüğü ve güvenilirliğiyle tanınan Peygamberimize "el-Emin" (Güvenilir Muhammed) lakabı verilmiştir. Haksızlıklarla mücadele etmek için kurulan Hilfü'l-Fudûl (Erdemliler Birliği) topluluğuna katılmıştır. 25 yaşındayken Mekke'nin soylu kadınlarından Hz. Hatice ile evlenmiştir.

3. İlk Vahiy ve Peygamberlik (Hira Mağarası)
40 yaşına geldiğinde, Nur Dağı'ndaki Hira Mağarası'nda tefekküre çekildiği bir sırada (Miladi 610) Cebrail (a.s.) vasıtasıyla "Yaratan Rabbinin adıyla oku!" ayetiyle ilk vahiy nazil olmuş ve peygamberlik vazifesi başlamıştır.

4. Hicret (Mekke'den Medine'ye Göç - 622)
Mekke'deki müşriklerin bask, işkence ve boykotlarının artması üzerine, Müslümanlar Miladi 622 yılında Medine'ye (o zamanki adıyla Yesrib) hicret etmiştir. Hicret, İslam tarihinin dönüm noktası ve Hicri takvimin başlangıcıdır.

5. Medine Dönemi ve İslam Devleti
Medine'de muhacir (Mekkeliler) ile ensar (Medineliler) kardeş ilan edilmiş, Medine Sözleşmesi ile toplumsal huzur tesis edilmiştir. İslam tebliği Medine'de hızla yayılmış, Müslümanlar kendilerini korumak için Bedir, Uhud ve Hendek gibi önemli gazvelere katılmışlardır.

6. Mekke'nin Fethi (630)
Miladi 630 yılında Peygamber Efendimiz önderliğindeki İslam ordusu Mekke'yi kansız ve savaşsız bir şekilde fethetmiştir. Kabe putlardan temizlenmiş ve genel af ilan edilerek düşmanlar bağışlanmıştır.

7. Veda Haccı ve Veda Hutbesi (632)
Peygamberimiz vefatından önce 100 bini aşkın Müslümanla Veda Haccı'nı gerçekleştirmiş ve ünlü Veda Hutbesi'ni irat etmiştir. Hutbede insan hakları, kadın hakları, eşitlik, faizin kaldırılması ve kan davalarının sonlandırılması gibi evrensel ilkeler vurgulanmıştır.

8. Vefatı (Medine - 8 Haziran 632)
Peygamber Efendimiz, Miladi 8 Haziran 632 (Hicri 12 Rebiülevvel 11) tarihinde Medine'de vefat etmiş ve Mescid-i Nebevi içindeki Ravza-i Mutahhara'ya defnedilmiştir. Allah'ın salat ve selamı O'nun ve ehli beytinin üzerine olsun.`)} 
                    className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2 rounded-full flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Siyer-i Nebi Rehberini İndir (.TXT)
                  </Button>
                </div>
              </div>
              <CardContent className="p-8 bg-slate-950 text-slate-100">
                <div className="relative border-l-2 border-amber-500/30 pl-6 ml-4 space-y-10">
                  
                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Mekke Dönemi • Miladi 571</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Mübarek Doğum ve Çocukluk Dönemi</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Peygamber Efendimiz (s.a.v.), Rebiülevvel ayının 12. gecesi (20 Nisan 571 Pazartesi) Mekke'de babasız olarak dünyaya gözlerini açtı. Annesi Amine Hanım o henüz 6 yaşındayken vefat edince, sevgili dedesi Abdülmuttalib'in korumasına girdi. Dedesi de vefat ettiğinde, amcası Ebu Talib'in sıcak yuvasına sığındı. Temiz, dürüst ve asil duruşuyla tüm çocukluğunda özel bir nur ve edep taşıdı.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Mekke Dönemi • 583 - 610</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Gençlik Çağı, El-Emin Sıfatı ve Kutlu Evlilik</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Mekke halkı O'na daha gençliğinde yalan söylemediği, emanetleri en sadık şekilde koruduğu için "El-Emin" (Güvenilir Muhammed) dedi. Zulme uğrayanların haklarını savunmak için kurulan Hilfü'l-Fudûl cemiyetinde aktif rol üstlendi. 25 yaşında, ticaret kervanını yönettiği Mekke'nin en şerefli kadınlarından Hz. Hatice ile evlendi; bu evlilikten temiz nesiller dünyaya geldi.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Nur Dağı • 610</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Nübüvvetin Başlangıcı ve İlk Vahiy</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        40 yaşına bastığında Hira Mağarası'nda tefekkür halindeyken Cebrail (a.s.) vasıtasıyla ilk vahiy ("Yaratan Rabbinin adıyla oku!") nazil oldu. İslam'ı tebliğ görevini ilk olarak eşi Hz. Hatice'ye, Hz. Ali'ye, Hz. Ebubekir'e ve Hz. Zeyd'e ulaştırdı. Putperest Mekke yöneticilerinin ağır işkencelerine, boykotlarına ve eziyetlerine rağmen imanından ve tebliğinden asla ödün vermedi.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Yolculuk • 622</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Hicret-i Mukaddese</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Müzdilife ve Medine yolunda, müşriklerin zulmünün zirveye ulaştığı, suikast planlarının yapıldığı dönemde, Allah'ın izniyle Hz. Ebubekir ile birlikte Yesrib'e (Medine) hicret etti. Bu göç sırasında Sevr Mağarası'nda sığındıkları anlar mucizelere sahne oldu. Hicret ile İslamiyet, yepyeni bir devlet ve özgürlük ortamına kavuştu.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Medine Dönemi • 622 - 630</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Medine Vesikası, Gazveler ve Tebliğin Yayılışı</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Müslümanlar (Muhacirler ve Ensar) arasında kurulan kardeşlik bağıyla Medine'de adalet temelli bir nizam kuruldu. Müdafaa amacıyla Bedir, Uhud, Hendek savaşları yapıldı, ardından Hudeybiye Antlaşması ile barış iklimi sağlandı. İslam tebliği yarımadayı aşarak krallıklara ve imparatorluklara elçiler yoluyla gönderildi.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Mekke • 630</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Mekke'nin Fethi ve Şefkat Manifestosu</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Miladi 630 yılında 10.000 kişilik muhteşem İslam ordusuyla Mekke savaşsız olarak fethedildi. Peygamberimiz (s.a.v.) Kabe'yi tavaf edip putları devirirken, kendisini yıllarca süren zulümlere maruz bırakan Mekke müşriklerine, "Bugün size kınama yoktur, hepiniz serbestsiniz!" diyerek eşsiz bir af ve merhamet dersi verdi.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-slate-950 flex items-center justify-center"></div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">Medine • 632</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Veda Hutbesi ve Refik-i A'la'ya İrtihal</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        Hayatının son yılında 100 bini aşkın Müslümanla gerçekleştirdiği Hac ibadetinde (Veda Haccı), insan haklarını, kadınların hukukunu, can ve mal güvenliğini, faizin ve ırkçılığın yasak olduğunu tüm dünyaya ilan eden meşhur "Veda Hutbesi"ni irat etti. Kısa bir süre sonra Medine'de rahatsızlanarak "Refîk-i A'lâ'ya (En Yüce Dosta)" duasıyla ruhunu teslim etti. Arkasında Kur'an ve Sünnet adında sarsılmaz iki büyük miras bıraktı.
                      </p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kadın İlmihali Tab */}
          <TabsContent value="kadinilmihali" className="space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-white text-slate-800">
              <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                    <Heart className="w-10 h-10 text-rose-100" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">İslam Kadın İlmihali</h2>
                  <p className="max-w-2xl mx-auto text-rose-100 text-sm font-medium">
                    Müslüman kadınların fıkhi meseleleri, ibadet muafiyetleri, özel halleri, ailevi hukukları ve sosyal hayat ilkelerine dair kapsamlı ilmihal rehberi.
                  </p>
                  <Button 
                    onClick={() => downloadTextContent("Islam Kadin Ilmihali", `İSLAM KADIN İLMİHALİ
--------------------
Giriş: İslam dini, kadına en yüce değeri vermiş, hak ve sorumluluklarını adaletle belirlemiştir. Kadın ilmihali, Müslüman bir kadının günlük ibadet, sosyal yaşam, aile hayatı ve fıkhi meselelerde bilmesi gereken temel kuralları içerir.

1. Temizlik ve Özel Haller (Taharet)
Müslüman bir kadının en çok bilmesi gereken konulardan biri taharettir.
- Hayız (Regl Dönemi): Kadının her ay yaşadığı özel haldir. Bu dönemde namaz kılmanıza gerek yoktur, oruç tutulmaz (orucun kazası yapılır), Kabe tavaf edilmez ve Kur'an-ı Kerim'e el sürülmez. Dönem bitiminde boy abdesti (gusül) alınması farzdır.
- Nifas (Lohusalık Dönemi): Doğum sonrası haldir. Hükümleri hayız ile aynıdır ve en fazla 40 gün sürer.
- Istihaze (Özür Kanı): Hastalık veya fizyolojik nedenlerle gelen kandır. Bu durumda ibadetlere engel yoktur, her namaz vakti için yeni bir abdest alınarak ibadet edilir.

2. İbadet Hükümleri ve Kolaylıklar
- Kadınların namazlarında erkeklerden farklı olarak bazı fiziksel uyumlar mevcuttur (secde ve rükuda daha derli toplu durma, elleri omuz hizasında kaldırma gibi).
- Cuma namazı, bayram namazı ve cenaze namazı kadınlara farz olmamakla birlikte, dilerlerse camide cemaatle kılabilirler.
- Hac ve umre ibadetinde kadınların telbiye getirirken seslerini fazla yükseltmemeleri ve ihram olarak günlük temiz, örtülü kıyafetlerini giymeleri esastır.

3. Evlilik, Aile ve Kadın Hakları
- İslam'da nikah, tarafların rızasına dayalı kutsal bir akittir. Kadının evlenirken talep ettiği güvenceye "Mehir" denir ve bu tamamen kadının kişisel hakkıdır.
- Aile hayatında eşlerin karşılıklı sevgi, saygı ve haklarına riayet etmesi emredilmiştir. Çocuk eğitimi ve aile saadeti kadının manevi liderliğinde şekillenir.

4. Sosyal Yaşam, Çalışma Hayatı ve Tesettür
- Kadının örtünmesi (tesettür), iffetini ve saygınlığını korumak adına Allah'ın emdir. Nur Suresi 31. ayet ve Ahzab Suresi 59. ayette sınırları çizilmiştir. Yüz ve eller hariç bütün vücudun örtülmesi farzdır.
- İslam, kadının meşru sınırlar çerçevesinde eğitim almasını, ilim öğrenmesini, çalışmasını ve mülk edinmesini güvence altına almıştır.`)} 
                    className="mt-4 bg-white text-rose-600 hover:bg-rose-50 font-bold px-6 py-2 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Kadın İlmihali Rehberini İndir (.TXT)
                  </Button>
                </div>
              </div>
              <CardContent className="p-8 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 font-bold text-xl">🧼</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">1. Temizlik ve Özel Haller (Fıkhi Durumlar)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Kadın fıkhının en hassas kısımlarından olan hayız (regl), nifas (lohusalık) ve istihaze (özür) konuları ibadetlerin sıhhati açısından büyük önem taşır.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-2 border-t pt-3">
                      <li>• <strong>Hayız ve Nifas:</strong> Bu günlerde namaz kılınmaz ve daha sonra kaza edilmez. Oruçlar ise Ramazan ayı sonrasında kaza edilir.</li>
                      <li>• <strong>İstihaze (Özür):</strong> Her vakit için tek abdest alarak namaz kılınabilir, oruç tutulabilir. İbadetlere engel değildir.</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 font-bold text-xl">🕌</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">2. İbadet Hükümleri ve Kolaylıklar</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Kadınların ibadetlerinde yaratılış özelliklerine ve toplumsal rollerine uygun bir takım kolaylıklar ve fıkhi esneklikler sağlanmıştır.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-2 border-t pt-3">
                      <li>• <strong>Namaz Durumu:</strong> Kadınlar rükuda, secdede ve oturuşta derli toplu dururlar. Cemaat şartı aranmaz, evde kılmaları daha faziletli görülmüştür.</li>
                      <li>• <strong>Hac ve Umre:</strong> İhram kıyafeti şartı aranmaz; sade, temiz ve tesettüre uygun elbiseleriyle ibadetlerini icra ederler.</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 font-bold text-xl">💍</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">3. Evlilik, Aile ve Kadın Hakları</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      İslam dini, nikah akdini her iki tarafın rızası üzerine bina etmiş ve kadını ailenin manevi mimarı kılarak mülkiyet ve himaye haklarını vermiştir.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-2 border-t pt-3">
                      <li>• <strong>Mehir Hakkı:</strong> Evlenirken kadının talep ettiği ve tamamen kendi tasarrufunda bulunan mal varlığı güvencesidir.</li>
                      <li>• <strong>Aile İçi Görevler:</strong> Eşlerin karşılıklı adalet, şefkat ve rıza dairesinde yuvayı kurmaları, çocukları ahlakla eğitmeleri esastır.</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 font-bold text-xl">🌸</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">4. Sosyal Yaşam, Çalışma ve Tesettür</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Müslüman kadın, toplumsal hayatta izzetiyle yer alır. Tesettür, kadının asaletini muhafaza etmek ve saygınlığını artırmak için emredilmiş ilahi bir muhafızdır.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-2 border-t pt-3">
                      <li>• <strong>İlim ve Çalışma:</strong> Kadının her türlü faydalı ilmi öğrenmesi farzdır. Kendi şerefini ve aile nizamını bozmayacak helal işlerde çalışabilir.</li>
                      <li>• <strong>Tesettür Sınırları:</strong> El, yüz ve (bazı fıkıh alimlerine göre) ayaklar dışında tüm vücudun şeffaf ve dar olmayan kıyafetle örtülmesidir.</li>
                    </ul>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* İslam Temeli Tab */}
          <TabsContent value="islamtemeli" className="space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden rounded-3xl bg-slate-900 text-white">
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                    <Sparkles className="w-10 h-10 text-amber-200" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">İslam Temeli ve Rehberi</h2>
                  <p className="max-w-2xl mx-auto text-amber-100 text-sm font-medium">
                    İslam’ın sarsılmaz temelleri, imanın rükünleri, pratik abdest alımı, 5 vakit namaz kılınış tabloları ve günlük okunacak en kıymetli dualar.
                  </p>
                  <Button 
                    onClick={() => downloadTextContent("Islam Temeli", `İSLAM TEMEL ADIMLARI, DUALAR VE NAMAZ REHBERİ
---------------------------------------------
İslam'ın beş şartı ve Müslümanların günlük hayatlarında tatbik etmesi gereken temel ibadetler, dualar ve namaz kılma rehberidir.

1. İslam'ın Beş Şartı
1. Kelime-i Şehadet Getirmek: "Eşhedü en lâ ilâhe illallah ve eşhedü enne Muhammeden abdühû ve resûlüh." (Şahitlik ederim ki Allah'tan başka ilah yoktur ve yine şahitlik ederim ki Muhammed O'nun kulu ve elçisidir.)
2. Namaz Kılmak: Günde 5 vakit namaz kılmak her akil ve baliğ Müslümana farzdır.
3. Zekat Vermek: Nisap miktarı zenginliğe sahip Müslümanların yılda bir kez mallarının %2.5'ini fakirlere vermesidir.
4. Oruç Tutmak: Ramazan ayında imsak vaktinden akşam ezanına kadar yeme, içme ve nefsi arzulardan uzak durarak ibadet etmektir.
5. Hacca Gitmek: Maddi ve fiziki imkanı olanların ömründe bir kez Kabe'yi ziyaret etmesidir.

2. Abdest Nasıl Alınır? (Sırasıyla)
1. Niyet edilir ve "Euzü-Besmele" çekilir.
2. Eller bileklere kadar 3 defa yıkanır.
3. Ağza 3 defa su verilip çalkalanır.
4. Burna 3 defa su çekilip temizlenir.
5. Yüz 3 defa yıkanır.
6. Sağ kol ve sonra sol kol dirseklerle beraber 3 defa yıkanır.
7. Islak elle başın dörtte biri meshedilir, kulaklar ve boyun meshedilir.
8. Önce sağ ayak, sonra sol ayak topuklarla beraber yıkanır.

3. 5 Vakit Namaz Rekatları ve Kılınışı
- Sabah Namazı: 2 Sünnet, 2 Farz (Toplam 4 Rekat)
- Öğle Namazı: 4 İlk Sünnet, 4 Farz, 2 Son Sünnet (Toplam 10 Rekat)
- İkindi Namazı: 4 Sünnet, 4 Farz (Toplam 8 Rekat)
- Akşam Namazı: 3 Farz, 2 Sünnet (Toplam 5 Rekat)
- Yatsı Namazı: 4 İlk Sünnet, 4 Farz, 2 Son Sünnet, 3 Vitir Vacip (Toplam 13 Rekat)

4. Temel Sure ve Dualar
- Fatiha Suresi: "Elhamdü lillâhi rabbi'l-âlemîn. Er-rahmâni'r-rahîm. Mâliki yevmi'd-dîn. İyyâke na'büdü ve iyyâke neste'în. İhdine's-sırâte'l-müstekîm. Sırâtallezîne en'amte aleyhim, ğayri'l-mağdûbi aleyhim veleddâllîn."
- İhlas Suresi: "Kul huvallâhu ehad. Allâhussamed. Lem yelid ve lem yûled. Ve lem yekun lehû kufuven ehad."
- Ayetü'l-Kürsi: Bakara Suresi 255. ayeti olup muazzam koruyucu ve manevi sırlar içerir.`)} 
                    className="mt-4 bg-white text-amber-700 hover:bg-amber-50 font-bold px-6 py-2 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    İslam Temeli Rehberini İndir (.TXT)
                  </Button>
                </div>
              </div>
              <CardContent className="p-8 bg-slate-950 text-slate-100 space-y-8">
                
                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    İslam'ın Beş Temel Şartı
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    {[
                      { title: "Kelime-i Şehadet", desc: "Dile döküp kalple tasdik etmek." },
                      { title: "Namaz Kılmak", desc: "Günde 5 vakit huzura durmak." },
                      { title: "Zekat Vermek", desc: "Malın şükrünü fakirle paylaşmak." },
                      { title: "Oruç Tutmak", desc: "Ramazan ayında nefsi arındırmak." },
                      { title: "Hacca Gitmek", desc: "İmkanı olanın Kabe'yi ziyareti." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                        <span className="text-amber-500 font-extrabold text-lg block mb-1">0{idx+1}</span>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Sırasıyla Abdest Alma Rehberi
                  </h3>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-amber-500 font-bold block">Adım 1: Niyet & Yıkama</span>
                      <p className="text-slate-300 mt-1">Euzü Besmele çekip eller bileklere kadar 3 defa ovularak yıkanır.</p>
                    </div>
                    <div>
                      <span className="text-amber-500 font-bold block">Adım 2: Ağız & Burun</span>
                      <p className="text-slate-300 mt-1">Ağıza 3 defa su verilip çalkalanır, burna 3 defa su çekilip temizlenir.</p>
                    </div>
                    <div>
                      <span className="text-amber-500 font-bold block">Adım 3: Yüz & Kollar</span>
                      <p className="text-slate-300 mt-1">Yüz 3 defa yıkanır, ardından kollar dirseklerle beraber 3 defa ovalanır.</p>
                    </div>
                    <div>
                      <span className="text-amber-500 font-bold block">Adım 4: Mesih & Ayaklar</span>
                      <p className="text-slate-300 mt-1">Baş, kulaklar ve boyun ıslak elle meshedilir; ayaklar topuklarla yıkanır.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Günlük 5 Vakit Namaz Rekatları
                  </h3>
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-sm">
                    <div className="grid grid-cols-4 bg-slate-800 p-3 font-bold text-amber-300 text-center">
                      <div>Vakit</div>
                      <div>Sünnet</div>
                      <div>Farz</div>
                      <div>Toplam Rekat</div>
                    </div>
                    {[
                      { name: "Sabah Namazı", sunnet: "2 Rekat", farz: "2 Rekat", total: "4 Rekat" },
                      { name: "Öğle Namazı", sunnet: "4 İlk + 2 Son", farz: "4 Rekat", total: "10 Rekat" },
                      { name: "İkindi Namazı", sunnet: "4 Rekat", farz: "4 Rekat", total: "8 Rekat" },
                      { name: "Akşam Namazı", sunnet: "2 Rekat", farz: "3 Rekat", total: "5 Rekat" },
                      { name: "Yatsı Namazı", sunnet: "4 İlk + 2 Son + 3 Vitir", farz: "4 Rekat", total: "13 Rekat" }
                    ].map((vakit, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-3 border-t border-slate-800 text-center">
                        <div className="font-bold text-white text-left pl-3">{vakit.name}</div>
                        <div className="text-slate-300">{vakit.sunnet}</div>
                        <div className="text-slate-300">{vakit.farz}</div>
                        <div className="text-amber-400 font-bold">{vakit.total}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                    En Önemli Sureler ve Dualar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <h4 className="font-bold text-amber-300 mb-2">Fatiha Suresi (Okunuşu & Anlamı)</h4>
                      <p className="text-slate-300 text-xs leading-relaxed italic mb-3">
                        "Elhamdü lillâhi rabbi'l-âlemîn. Er-rahmâni'r-rahîm. Mâliki yevmi'd-dîn. İyyâke na'büdü ve iyyâke neste'în. İhdine's-sırâte'l-müstekîm. Sırâtallezîne en'amte aleyhim, ğayri'l-mağdûbi aleyhim veleddâllîn."
                      </p>
                      <p className="text-slate-400 text-[10px] border-t pt-2 border-slate-800 leading-normal">
                        Hamd, Alemlerin Rabbi, Rahman, Rahim, Hesap gününün sahibi Allah'adır. Yalnız Sana ibadet eder ve yalnız Senden yardım dileriz. Bizi doğru yola ilet, kendilerine nimet verdiklerinin yoluna...
                      </p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <h4 className="font-bold text-amber-300 mb-2">Ayetü'l-Kürsi (Bakara 255. Ayet)</h4>
                      <p className="text-slate-300 text-xs leading-relaxed italic mb-3">
                        "Allâhü lâ ilâhe illâ hüvel hayyül kayyûm, lâ te'huzühû sinetün velâ nevm, lehû mâ fissemâvâti vemâ fil ard, menzellezî yeşfeu indehû illâ bi-iznih..."
                      </p>
                      <p className="text-slate-400 text-[10px] border-t pt-2 border-slate-800 leading-normal">
                        Allah ki, O'ndan başka ilah yoktur. O diridir, kayyûmdur. Kendisine ne gaflet gelir ne de uyku. Göklerde ve yerde ne varsa hepsi O'nundur. İzni olmadan huzurunda şefaat edecek kimdir?
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Video className="w-7 h-7" />
                  Zoom Eğitimleri
                </CardTitle>
                <p className="text-blue-100">Yaklaşan ve aktif Zoom eğitim oturumlarına tek tıkla katılın</p>
              </CardHeader>
            </Card>

            {trainingsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-3" />
                <p className="text-gray-600">Eğitimler yükleniyor...</p>
              </div>
            ) : upcomingTrainings.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">Henüz Eğitim Yok</h3>
                  <p className="text-gray-400">Yeni bir Zoom eğitimi planlandığında burada görünecek ve bildirim alacaksınız.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTrainings.map((training, idx) => {
                  const scheduledDate = new Date(training.scheduledAt);
                  const isPast = scheduledDate < new Date();
                  const isHost = training.authorizedHosts?.includes(user?.id);
                  return (
                    <Card key={`${training.id}-${idx}`} className={`border-2 ${isPast ? "border-gray-200 opacity-70" : "border-blue-200 shadow-md hover:shadow-lg transition-shadow"}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{training.title}</CardTitle>
                          <div className="flex flex-col gap-1">
                            {isHost && <Badge className="bg-purple-600 text-white text-xs">🎙️ Eğitimci</Badge>}
                            {isPast ? (
                              <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Tamamlandı</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Yaklaşıyor</Badge>
                            )}
                          </div>
                        </div>
                        {training.description && <p className="text-sm text-gray-600 mt-1">{training.description}</p>}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{scheduledDate.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>{scheduledDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} ({training.duration} dk)</span>
                          </div>
                        </div>
                        {training.password && (
                          <div className="flex items-center gap-2 text-sm bg-yellow-50 border border-yellow-200 p-2 rounded-lg">
                            <Lock className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">Şifre: {training.password}</span>
                          </div>
                        )}
                        <a
                          href={training.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isPast ? "bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none" : isHost ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"}`}
                        >
                          <Video className="w-4 h-4" />
                          {isHost ? "🎙️ Eğitimci Olarak Katıl" : "🎥 Zoom'a Katıl"}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Team View Modal */}
        <Dialog open={teamViewModalOpen} onOpenChange={setTeamViewModalOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User2 className="w-5 h-5" />
                <span>
                  {selectedMemberForTeamView?.fullName} - Ekip Görünümü
                </span>
              </DialogTitle>
              <DialogDescription>
                {selectedMemberForTeamView?.memberId} üyesinin ekip yapısı ve detayları
              </DialogDescription>
            </DialogHeader>

            {selectedMemberForTeamView && (
              <div className="space-y-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant={teamViewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setTeamViewMode('list')}
                    className="flex items-center space-x-2"
                  >
                    <List className="w-4 h-4" />
                    <span>Liste Görünümü</span>
                  </Button>
                  <Button
                    variant={teamViewMode === 'tree' ? 'default' : 'outline'}
                    onClick={() => setTeamViewMode('tree')}
                    className="flex items-center space-x-2"
                  >
                    <TreePine className="w-4 h-4" />
                    <span>Ağaç Görünümü</span>
                  </Button>
                </div>

                {/* Member Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedMemberForTeamView.fullName} - Ekip Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-gray-800">Direkt Üye</p>
                        <p className="text-xl font-bold text-blue-600">
                          {selectedMemberForTeamView.directReferrals}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Network className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-gray-800">Toplam Ekip</p>
                        <p className="text-xl font-bold text-green-600">
                          {memberTeamData.length}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm text-gray-800">Yatırım</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${selectedMemberForTeamView.totalInvestment}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Award className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm text-gray-800">Seviye</p>
                        <p className="text-lg font-bold text-orange-600">
                          {selectedMemberForTeamView.careerLevel}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* List View */}
                {teamViewMode === 'list' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <List className="w-5 h-5" />
                        <span>Ekip Listesi ({memberTeamData.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {memberTeamData.length > 0 ? (
                        <div className="w-full overflow-x-auto">
                          <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Üye ID</TableHead>
                              <TableHead>İsim</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Seviye</TableHead>
                              <TableHead>Pozisyon</TableHead>
                              <TableHead>Yatırım</TableHead>
                              <TableHead>Durum</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memberTeamData.map((teamMember, idx) => (
                              <TableRow key={`${teamMember.id}-${idx}`}>
                                <TableCell className="font-mono">
                                  {teamMember.memberId}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {teamMember.fullName}
                                </TableCell>
                                <TableCell>{teamMember.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {teamMember.careerLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      teamMember.position === "direct"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {teamMember.position === "direct"
                                      ? "Direkt"
                                      : "Monoline Hattı"}
                                  </Badge>
                                </TableCell>
                                <TableCell>${teamMember.totalInvestment}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      teamMember.isActive ? "default" : "secondary"
                                    }
                                  >
                                    {teamMember.isActive ? "Aktif" : "Pasif"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      ) : (
                        <div className="text-center py-8 text-gray-700">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Bu üyenin henüz ekip üyesi bulunmuyor.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tree View */}
                {teamViewMode === 'tree' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TreePine className="w-5 h-5" />
                        <span>💎 Tek Hat Gönül Yolu Görünümü</span>
                      </CardTitle>
                      <CardDescription>
                        {selectedMemberForTeamView.fullName} üyesinin gönül yolu yapısı
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">💎 İrfan Sistemi Gönül Ağı</h4>
                          <div className="text-center space-y-2">
                            <div className="text-lg font-bold text-purple-600">
                              Pozisyon #{Math.floor(Math.random() * 1000) + 1}
                            </div>
                            <div className="text-sm text-gray-800">
                              Tek hat irfan sisteminde sıralı yerleşim
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{selectedMemberForTeamView.directReferrals || 0}</div>
                            <div className="text-sm text-gray-800">Direkt Referanslar</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{selectedMemberForTeamView.level || 1}</div>
                            <div className="text-sm text-gray-800">İrfan Seviyesi</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Team Placement Modal */}
        <Dialog open={placementModal} onOpenChange={setPlacementModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-orange-600" />
                <span>🎯 Takım Yerleştirme</span>
              </DialogTitle>
              <DialogDescription>
                {selectedPlacement && `${selectedPlacement.newUserData.fullName} için takım pozisyonu seçin`}
              </DialogDescription>
            </DialogHeader>

            {selectedPlacement && (
              <div className="space-y-6">
                {/* New Member Info */}
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedPlacement.newUserData.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedPlacement.newUserData.fullName}</h3>
                        <p className="text-sm text-gray-800">{selectedPlacement.newUserData.email}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="outline">📱 {selectedPlacement.newUserData.phone}</Badge>
                          <Badge variant="outline">📦 {selectedPlacement.newUserData.membershipType}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monoline Confirmation */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900">📍 Monoline Hattı Onayı</h3>
                  <Card
                    className="cursor-pointer border-2 transition-colors bg-white hover:border-purple-400 border-purple-200"
                    onClick={() => placeMemberInTeam(selectedPlacement.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <TrendingUp className="text-purple-600 w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-lg mb-1 italic">Hattı Aktifleştir</h4>
                      <p className="text-sm text-gray-700 mb-4">
                        Yeni üyeyi küresel Monoline (Tek Hat) havuzuna dahil ederek sponsor bonusunuzu kazanın.
                      </p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold h-12 text-lg rounded-xl">
                        Onayla ve Bonus Kazan
                      </Button>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

        <SystemPresentation open={isPresentationOpen} onOpenChange={setIsPresentationOpen} referralCode={user?.referralCode} />

        {/* Contribution Calculator Modal */}
        <Dialog open={isCalculatorsOpen} onOpenChange={setIsCalculatorsOpen}>
          <DialogContent className="sm:max-w-[700px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <Calculator className="w-6 h-6 text-indigo-600" />
                Ruhsal Gelişim Katkı Payı Hesaplama
              </DialogTitle>
              <DialogDescription>
                Ekip potansiyelinizi ve manevi yatırım getirinizi hesaplayın
              </DialogDescription>
            </DialogHeader>
            <ContributionCalculator />
            <DialogFooter>
              <Button onClick={() => setIsCalculatorsOpen(false)} className="bg-indigo-600 hover:bg-indigo-700">Kapat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generic Guide Modal */}
        <Dialog open={guideModalOpen} onOpenChange={setGuideModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {selectedGuide?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
              {selectedGuide?.content}
            </div>
            <DialogFooter>
              <Button onClick={() => setGuideModalOpen(false)}>Anladım</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Assistant Chatbot */}
        <AIAssistant
          userId={user?.id}
          panelType="member"
          context={{
            careerLevel: user?.careerLevel?.name,
            totalTeamSize: user?.totalTeamSize,
            wallet: user?.wallet?.balance,
          }}
          position="bottom-right"
        />
      </div>
    </div>
  );
}
