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

interface Mentor {
  id: string;
  name: string;
  level: string;
  rating: number;
  topic: string;
  cost: number; // Zaman kredisi
  availability: "available" | "busy";
  avatar?: string;
}

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
  const [timeCredits, setTimeCredits] = useState(user?.blueprintSettings?.timeCredits || user?.timeCredits || 1);
  const [walletBalance, setWalletBalance] = useState(user?.wallet?.balance || 0);
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: "mentor-1",
      name: "Ahmet Yıldırım",
      level: "Monoline Lideri",
      rating: 4.9,
      topic: "Manevi Satış Stratejileri",
      cost: 1,
      availability: "available",
    },
    {
      id: "mentor-2",
      name: "Esra Demir",
      level: "Kamil Seviye Lider",
      rating: 5.0,
      topic: "Alt Ağaç Organizasyon Yönetimi",
      cost: 2,
      availability: "available",
    },
    {
      id: "mentor-3",
      name: "Selin Kaya",
      level: "Mürşid Seviye Lider",
      rating: 4.8,
      topic: "Siyer-i Nebi ile Ticari Ahlak",
      cost: 1,
      availability: "available",
    },
  ]);

  const [educationRequests, setEducationRequests] = useState<EducationRequest[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedEducationRequest, setSelectedEducationRequest] = useState<EducationRequest | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [showEducationRequests, setShowEducationRequests] = useState(false);
  const [showOfferEducation, setShowOfferEducation] = useState(false);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [sessionParticipants, setSessionParticipants] = useState<any[]>([]);
  const [offerTopic, setOfferTopic] = useState("");
  const [offerDescription, setOfferDescription] = useState("");

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

  // Mentor seansı rezerve et
  const handleReserveMentorSession = async (mentor: Mentor) => {
    if (timeCredits < mentor.cost) {
      toast({
        title: "Yetersiz Kredi",
        description: `Bu seansa ${mentor.cost} kredi gerekiyor. Şu an ${timeCredits} krediniz var.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/timebank/reserve-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: mentor.id,
          mentorName: mentor.name,
          topic: mentor.topic,
          cost: mentor.cost,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeCredits((prev) => prev - mentor.cost);
        if (onCreditsUpdate) onCreditsUpdate(timeCredits - mentor.cost);
        setShowReservation(false);
        setSelectedMentor(null);
        toast({
          title: "Seansa Kabul Edildi",
          description: `${mentor.name} ile seans rezerve edildi. Zoom link'i e-mail adresinize gönderilecektir.`,
        });
      } else {
        toast({
          title: "Hata",
          description: data.error || "Seansa katılırken hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Seansa katılırken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Eğitim talebi kabul et ve canlı oturumu başlat
  const handleAcceptEducationRequest = async (request: EducationRequest) => {
    try {
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
        toast({
          title: "Eğitim Başladı",
          description: `${request.requesterName} ile canlı eğitim oturumu başladı.`,
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Eğitim başlatılırken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Eğitim tamamlandı - Para transferi yapılsın
  const handleCompleteEducation = async (request: EducationRequest) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/timebank/complete-education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: request.id,
          requesterId: request.requesterId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Mentor +1 kredi ve +$5 almaktadır
        setTimeCredits((prev) => prev + 1);
        setWalletBalance((prev) => prev + 5);
        if (onCreditsUpdate) onCreditsUpdate(timeCredits + 1);
        setShowLiveSession(false);
        toast({
          title: "Eğitim Tamamlandı",
          description: "1 Zaman Kredisi ve $5 cüzdanınıza eklendi.",
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
      toast({
        title: "Hata",
        description: "Eğitim tamamlanırken hata oluştu.",
        variant: "destructive",
      });
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
                Uzmanlığı ortak değer birimi yapıyoruz!
              </p>
              <Button
                onClick={() => setShowOfferEducation(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🎤 Eğitim Sun
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentorluğu Kullan */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Aktif Alabileceğiniz Mentorluk Eğitimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-slate-950 border border-slate-800 p-4 rounded-lg hover:border-purple-600/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-white">{mentor.name}</h4>
                  <p className="text-xs text-slate-400">{mentor.level}</p>
                  <p className="text-sm text-purple-300 font-semibold mt-2">
                    {mentor.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-white font-bold">
                    {mentor.rating}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">
                    {mentor.cost} Zaman Kredisi
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setShowReservation(true);
                  }}
                  disabled={timeCredits < mentor.cost}
                  className="bg-purple-600 hover:bg-purple-700 text-xs"
                >
                  Seansı Rezerve Et
                </Button>
              </div>
            </div>
          ))}
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
              {educationRequests.length > 0 ? (
                educationRequests.map((request) => (
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
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Eğitimi Başlat (Zoom)
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
                  <p className="text-slate-400">Şu an eğitim talebi yok</p>
                </div>
              )}
            </TabsContent>

            {/* Student Tab - Eğitim Talebi Oluştur */}
            <TabsContent value="student" className="space-y-4">
              <div className="bg-slate-900 border border-emerald-600/30 p-4 rounded-lg">
                <p className="text-sm text-emerald-300 mb-3">
                  💡 Diğer üyelerin sunduğu eğitime katılabilirsiniz. Eğitim alındıktan sonra cüzdanınızdan $5 ödeme yapılacaktır.
                </p>
                <Button
                  onClick={() => setShowOfferEducation(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
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
                          const token = localStorage.getItem("accessToken");
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
                              title: "Eğitime Katıldınız",
                              description: `Zoom linki: ${data.zoomLink}`,
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Hata",
                            description: "Eğitime katılırken hata oluştu.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Eğitime Katıl
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

      {/* Eğitim Sun */}
      <Dialog open={showOfferEducation} onOpenChange={setShowOfferEducation}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              🎤 Sisteme 1 Saatlik Eğitim Sun
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Siz de bir saat eğitim sunarak +1 Zaman Kredisi ve $5 kazanın
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
                if (!offerTopic || !offerDescription) {
                  toast({
                    title: "Eksik Bilgi",
                    description: "Lütfen tüm alanları doldurunuz.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  const token = localStorage.getItem("accessToken");
                  const res = await fetch("/api/timebank/requests/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      topic: offerTopic,
                      description: offerDescription,
                      level: user?.careerLevel?.displayName,
                    }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    setOfferTopic("");
                    setOfferDescription("");
                    setShowOfferEducation(false);
                    toast({
                      title: "Eğitim Talebi Oluşturuldu",
                      description: "Eğitim talebiniz sisteme eklenmiştir. Eğitim talep edenleri bekliyorsunuz.",
                    });
                    loadEducationRequests();
                  }
                } catch (error) {
                  toast({
                    title: "Hata",
                    description: "Eğitim talebi oluşturulamadı.",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Eğitim Sunmaya Hazırım
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canlı Eğitim Oturumu */}
      <Dialog open={showLiveSession} onOpenChange={setShowLiveSession}>
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
                  Eğitim devam ediyor...
                </p>
              </div>
            </div>

            {/* Katılımcılar */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Eğitime Katılan Üyeler ({sessionParticipants.length})
              </h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {sessionParticipants.length > 0 ? (
                  sessionParticipants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between bg-slate-950 p-2 rounded">
                      <div>
                        <p className="text-sm text-white font-medium">{participant.userName}</p>
                        <p className="text-xs text-slate-400">ID: {participant.userId}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Katılıyor</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">Henüz katılımcı yok</p>
                )}
              </div>
            </div>

            {/* Ödeme Bilgisi */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Seans Süresi: 1 Saat</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Kazanç: 1 Zaman Kredisi + $5 USD</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Sohbet
              </Button>
              <Button
                onClick={() => selectedEducationRequest && handleCompleteEducation(selectedEducationRequest)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Eğitim Tamamlandı
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
