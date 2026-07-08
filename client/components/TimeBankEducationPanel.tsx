/**
 * Time Bank Education Panel
 * Zaman Kredisi ile Mentorluğu Yönetme Sistemi
 * Mentor seanslarını rezerve etme, eğitim verme ve kredileri harita etme
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Clock,
  Star,
  Zap,
  Users,
  Video,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EducationRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  topic: string;
  description: string;
  level: string;
  timestamp: Date;
  status: "pending" | "accepted" | "in_progress" | "completed";
  mentorId?: string;
  zoomLink?: string;
  startTime?: Date;
  participants?: Array<{ userId: string; userName: string; joinedAt: Date }>;
}

interface TimeBankEducationPanelProps {
  user: any;
  onCreditsUpdate?: (credits: number) => void;
}

export default function TimeBankEducationPanel({
  user,
  onCreditsUpdate,
}: TimeBankEducationPanelProps) {
  const { toast } = useToast();
  const [timeCredits, setTimeCredits] = useState(user?.blueprintSettings?.timeCredits || user?.timeCredits || 0);
  const [walletBalance, setWalletBalance] = useState(user?.wallet?.balance || 0);

  const [educationRequests, setEducationRequests] = useState<EducationRequest[]>([]);
  const [selectedEducationRequest, setSelectedEducationRequest] = useState<EducationRequest | null>(null);
  const [showEducationRequests, setShowEducationRequests] = useState(false);
  const [showOfferEducation, setShowOfferEducation] = useState(false);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [sessionParticipants, setSessionParticipants] = useState<any[]>([]);
  const [offerTopic, setOfferTopic] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [participantRefreshInterval, setParticipantRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load user's time credits
  useEffect(() => {
    const loadUserCredits = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("/api/timebank/credits", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTimeCredits(data.timeCredits || 0);
        }
      } catch (error) {
        console.error("Failed to load time credits:", error);
      }
    };

    loadUserCredits();
  }, []);

  // Eğitim talep edenleri göster
  const loadEducationRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/timebank/requests?status=pending`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEducationRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to load education requests:", error);
    }
  };

  useEffect(() => {
    if (showEducationRequests) {
      loadEducationRequests();
    }
  }, [showEducationRequests]);

  // Cleanup interval when dialog closes
  useEffect(() => {
    return () => {
      if (participantRefreshInterval) {
        clearInterval(participantRefreshInterval);
      }
    };
  }, [participantRefreshInterval]);


  // Load participants for a session (live update)
  const loadSessionParticipants = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/timebank/session/${requestId}/participants`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessionParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
  };

  // Eğitim talebi kabul et ve canlı oturumu başlat
  const handleAcceptEducationRequest = async (request: EducationRequest) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/timebank/accept-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedEducationRequest(request);
        setSessionParticipants([
          { userId: request.requesterId, userName: request.requesterName, joinedAt: new Date() }
        ]);
        setShowLiveSession(true);

        // Katılımcıları 5 saniyede bir güncelle
        const interval = setInterval(() => {
          loadSessionParticipants(request.id);
        }, 5000);
        setParticipantRefreshInterval(interval);

        toast({
          title: "Eğitim Başladı",
          description: `Canlı eğitim oturumu başladı. Katılımcılar otomatik güncelleniyor.`,
        });
      } else {
        toast({
          title: "Hata",
          description: data.error || "Eğitim başlatılırken hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Eğitim başlatılırken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eğitim tamamlandı - Para transferi yapılsın
  const handleCompleteEducation = async (request: EducationRequest) => {
    try {
      setIsLoading(true);

      // Katılımcı güncelleme intervali temizle
      if (participantRefreshInterval) {
        clearInterval(participantRefreshInterval);
        setParticipantRefreshInterval(null);
      }

      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/timebank/complete-education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Mentor +1 kredi ve +tüm katılımcılardan earnings almaktadır
        const totalEarnings = data.totalEarnings || 5; // fallback
        setTimeCredits((prev) => prev + 1);
        setWalletBalance((prev) => prev + totalEarnings);
        if (onCreditsUpdate) onCreditsUpdate(timeCredits + 1);
        setShowLiveSession(false);

        toast({
          title: "Eğitim Başarıyla Tamamlandı! 🎉",
          description: `${data.participantCount} katılımcıdan toplam $${totalEarnings} kazandınız. +1 Zaman Kredisi eklendi.`,
        });

        loadEducationRequests();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Eğitim tamamlanırken hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing education:", error);
      toast({
        title: "Hata",
        description: "Eğitim tamamlanırken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zaman Kredisi Özeti */}
      <Card className="bg-gradient-to-r from-violet-950 to-purple-950 border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/30 rounded-lg">
                <Clock className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Zaman Krediniz</p>
                <p className="text-3xl font-black text-purple-100">
                  {timeCredits} Kredi
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-300 mb-2">
                1 saatlik eğitim sunarak +1 Zaman Kredisi ve +$5 kazanın
              </p>
              <Button
                onClick={() => setShowOfferEducation(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🎤 Eğitim Talep Oluştur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Eğitim Talepleri (Mentor Görünümü) ve Eğitim Sunumları (Student Görünümü) */}
      <Dialog open={showEducationRequests} onOpenChange={setShowEducationRequests}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eğitim Seansları</DialogTitle>
            <DialogDescription className="text-slate-400">
              Eğitim talep edenlere mentorluk yaparak +1 Zaman Kredisi ve $5 kazanın, veya eğitime katılarak bilgi alın.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="mentor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900">
              <TabsTrigger value="mentor">🎤 Eğitim Sunma</TabsTrigger>
              <TabsTrigger value="student">📚 Talep Oluştur</TabsTrigger>
              <TabsTrigger value="available">✅ Katılabileceğim</TabsTrigger>
            </TabsList>

            {/* Mentor Tab - Eğitim Talepleri */}
            <TabsContent value="mentor" className="space-y-4">
              {educationRequests.filter(r => r.requesterId !== user?.id && r.status === "pending").length > 0 ? (
                educationRequests
                  .filter(r => r.requesterId !== user?.id && r.status === "pending")
                  .map((request) => (
                  <div
                    key={request.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-purple-600/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white">
                          {request.requesterName}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {request.level}
                        </p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300">
                        {request.status === "pending" ? "Bekleniyor" : request.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-purple-300 font-semibold mb-2">
                      Konu: {request.topic}
                    </p>
                    <p className="text-sm text-slate-300 mb-4">
                      {request.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-950 rounded text-xs text-slate-400">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Kazanç: 1 Zaman Kredisi + $5 USD
                    </div>

                    {request.status === "pending" && (
                      <Button
                        onClick={() => handleAcceptEducationRequest(request)}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {isLoading ? "Başlatılıyor..." : "Eğitimi Başlat (Zoom)"}
                      </Button>
                    )}
                    {request.status === "in_progress" && (
                      <div className="w-full p-2 bg-emerald-500/20 text-emerald-300 rounded text-sm text-center">
                        Eğitim Devam Ediyor...
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">
                    {educationRequests.length === 0
                      ? "Şu an eğitim talebi yok"
                      : "Beklemiş olan eğitim talebi bulunmamaktadır"}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Student Tab - Eğitim Talebi Oluştur */}
            <TabsContent value="student" className="space-y-4">
              <div className="bg-slate-900 border border-blue-600/30 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-3">
                  💡 Belirli bir konu hakkında eğitim almak istiyorsanız, buradan talep oluşturun. Sistem içindeki mentorlar talebinizi görebilecek ve eğitim sunabilecekler. Eğitim aldıktan sonra cüzdanınızdan $5 ödeme yapılacaktır.
                </p>
                <Button
                  onClick={() => setShowOfferEducation(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  + Eğitim Talebi Oluştur
                </Button>
              </div>
            </TabsContent>

            {/* Available Tab - Katılabileceğim Eğitimler */}
            <TabsContent value="available" className="space-y-4">
              {educationRequests.filter(r => r.status === "in_progress").length > 0 ? (
                educationRequests.filter(r => r.status === "in_progress").map((request) => (
                  <div
                    key={request.id}
                    className="bg-slate-900 border border-emerald-600/30 p-4 rounded-lg hover:border-emerald-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white">
                          {request.requesterName} tarafından veriliyor
                        </h4>
                        <p className="text-xs text-slate-400">
                          {request.level}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">
                        Aktif
                      </Badge>
                    </div>

                    <p className="text-sm text-purple-300 font-semibold mb-2">
                      Konu: {request.topic}
                    </p>
                    <p className="text-sm text-slate-300 mb-4">
                      {request.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-950 rounded text-xs text-slate-400">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Tutar: $5 USD
                    </div>

                    <Button
                      onClick={async () => {
                        // Check wallet balance
                        if (walletBalance < 5) {
                          toast({
                            title: "Yetersiz Bakiye",
                            description: `Cüzdanızda yeterli bakiye yok. Gerekli: $5, Mevcut: $${walletBalance}`,
                            variant: "destructive",
                          });
                          return;
                        }

                        // Join session
                        try {
                          setIsLoading(true);
                          const token = localStorage.getItem("accessToken");
                          if (!token) {
                            toast({
                              title: "Hata",
                              description: "Lütfen yeniden giriş yapınız.",
                              variant: "destructive",
                            });
                            return;
                          }

                          const res = await fetch("/api/timebank/join-session", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ requestId: request.id }),
                          });

                          const data = await res.json();
                          if (data.success) {
                            toast({
                              title: "Eğitime Katıldınız ✅",
                              description: `${request.requesterName} tarafından verilen eğitime katıldınız. Zoom linki: ${data.zoomLink}`,
                            });
                          } else {
                            toast({
                              title: "Hata",
                              description: data.error || "Eğitime katılırken hata oluştu.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error("Error joining session:", error);
                          toast({
                            title: "Hata",
                            description: "Eğitime katılırken hata oluştu. Lütfen daha sonra tekrar deneyin.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {isLoading ? "Katılınıyor..." : "Eğitime Katıl"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Şu an katılabileceğiniz aktif eğitim yok</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEducationRequests(false)}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eğitim Talep Oluştur */}
      <Dialog open={showOfferEducation} onOpenChange={setShowOfferEducation}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              🎤 Eğitim Talep Oluştur
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Belirli bir konuda eğitim almak istiyorsanız, buradan talep oluşturun. Sistem içindeki mentorlar talebinizi görebilecek ve eğitim sunabilecekler.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Eğitim Konusu</Label>
              <Input
                placeholder="Örn: Monoline Satış Stratejileri"
                value={offerTopic}
                onChange={(e) => setOfferTopic(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Detaylı Açıklama</Label>
              <Textarea
                placeholder="Bu eğitimde neler öğrenilecek?"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white"
                rows={3}
              />
            </div>

            <Button
              onClick={async () => {
                if (!offerTopic || offerTopic.trim().length === 0) {
                  toast({
                    title: "Eksik Bilgi",
                    description: "Lütfen eğitim konusu giriniz.",
                    variant: "destructive",
                  });
                  return;
                }

                if (!offerDescription || offerDescription.trim().length === 0) {
                  toast({
                    title: "Eksik Bilgi",
                    description: "Lütfen eğitim açıklaması giriniz.",
                    variant: "destructive",
                  });
                  return;
                }

                if (offerTopic.length < 3) {
                  toast({
                    title: "Hata",
                    description: "Eğitim konusu en az 3 karakter olmalıdır.",
                    variant: "destructive",
                  });
                  return;
                }

                if (offerDescription.length < 10) {
                  toast({
                    title: "Hata",
                    description: "Eğitim açıklaması en az 10 karakter olmalıdır.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  setIsLoading(true);
                  const token = localStorage.getItem("accessToken");
                  if (!token) {
                    toast({
                      title: "Hata",
                      description: "Lütfen yeniden giriş yapınız.",
                      variant: "destructive",
                    });
                    return;
                  }

                  const res = await fetch("/api/timebank/requests/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      topic: offerTopic.trim(),
                      description: offerDescription.trim(),
                      level: user?.careerLevel?.displayName || "Başlangıç",
                    }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    toast({
                      title: "Eğitim Talebi Oluşturuldu ✅",
                      description: "Eğitim talebiniz sisteme eklenmiştir. Mentorlar tarafından kabul edilmeyi bekliyor.",
                    });
                    // Temizle ve kapat
                    setTimeout(() => {
                      setOfferTopic("");
                      setOfferDescription("");
                      setShowOfferEducation(false);
                    }, 500);
                    // Listeyi güncelle
                    loadEducationRequests();
                  } else {
                    toast({
                      title: "Hata",
                      description: data.error || "Eğitim talebi oluşturulamadı.",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  console.error("Error creating education request:", error);
                  toast({
                    title: "Hata",
                    description: "Eğitim talebi oluşturulamadı. Lütfen daha sonra tekrar deneyin.",
                    variant: "destructive",
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "İşleniyor..." : "Talep Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canlı Eğitim Oturumu */}
      <Dialog open={showLiveSession} onOpenChange={(open) => {
        if (!open && participantRefreshInterval) {
          clearInterval(participantRefreshInterval);
          setParticipantRefreshInterval(null);
        }
        setShowLiveSession(open);
      }}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500 animate-pulse" />
              Canlı Eğitim Oturumu: {selectedEducationRequest?.topic}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Zoom Embed Simülasyonu */}
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center border-2 border-red-500">
              <div className="text-center">
                <Video className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-white font-bold">Zoom Toplantısı Aktif</p>
                <p className="text-slate-400 text-sm mt-1">
                  Eğitim devam ediyor... ({sessionParticipants.length} katılımcı)
                </p>
              </div>
            </div>

            {/* Katılımcılar - Live Güncelleme */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Eğitime Katılan Üyeler ({sessionParticipants.length})
                <span className="text-xs text-slate-400 ml-auto">🔄 Otomatik güncelleniyor</span>
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {sessionParticipants.length > 0 ? (
                  sessionParticipants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{participant.userName}</p>
                        <p className="text-xs text-slate-400">ID: {participant.userId}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Katılıyor</Badge>
                        <span className="text-xs text-slate-400">-$5</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm py-4 text-center">Katılımcı bekleniyor...</p>
                )}
              </div>
            </div>

            {/* Ödeme Bilgisi */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Seans Süresi: 1 Saat</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">
                  Kazanç: 1 Zaman Kredisi + ${sessionParticipants.length * 5} USD ({sessionParticipants.length} × $5)
                </span>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded">
                ℹ️ Eğitim tamamlandığında, {sessionParticipants.length} katılımcının tamamından para çekilecektir.
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <Phone className="w-4 h-4 mr-2" />
                {isLoading ? "İşleniyor..." : "Sohbet"}
              </Button>
              <Button
                onClick={() => selectedEducationRequest && handleCompleteEducation(selectedEducationRequest)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || sessionParticipants.length === 0}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isLoading ? "Tamamlanıyor..." : "Eğitim Tamamlandı"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
