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
  const [timeCredits, setTimeCredits] = useState(user?.timeCredits || 1);
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

  const [educationRequests, setEducationRequests] = useState<EducationRequest[]>(
    []
  );
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [showEducationRequests, setShowEducationRequests] = useState(false);
  const [showOfferEducation, setShowOfferEducation] = useState(false);
  const [showLiveSession, setShowLiveSession] = useState(false);

  // Eğitim talep edenleri göster
  const loadEducationRequests = async () => {
    try {
      const res = await fetch(`/api/timebank/requests?status=pending`);
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
      const res = await fetch("/api/timebank/reserve-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
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
        toast({
          title: "Seansa Kabul Edildi",
          description: `${mentor.name} ile seans rezerve edildi. Zoom link'i e-mail adresinize gönderilecektir.`,
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
      const res = await fetch("/api/timebank/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          mentorId: user?.id,
          mentorName: user?.fullName,
          zoomLink: `https://zoom.us/j/${Math.random()
            .toString(36)
            .substring(7)}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
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

  // Eğitim tamamlandı - Kredi transfer et
  const handleCompleteEducation = async (request: EducationRequest) => {
    try {
      const res = await fetch("/api/timebank/complete-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          mentorId: user?.id,
          requesterId: request.requesterId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeCredits((prev) => prev + 1); // Eğitim veren +1 kredi alır
        if (onCreditsUpdate) onCreditsUpdate(timeCredits + 1);
        setShowLiveSession(false);
        toast({
          title: "Eğitim Tamamlandı",
          description: "1 Zaman Kredisi hesabınıza eklendi.",
        });
        loadEducationRequests(); // Listeyi yenile
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

      {/* Eğitim Talepleri */}
      <Dialog open={showEducationRequests} onOpenChange={setShowEducationRequests}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eğitim Talepleri</DialogTitle>
            <DialogDescription className="text-slate-400">
              Sisteme eğitim sunmak isteyen üyeler. +1 Zaman Kredisi kazanın.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {educationRequests.length > 0 ? (
              educationRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-lg"
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

                  {request.status === "pending" && (
                    <Button
                      onClick={() => handleAcceptEducationRequest(request)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Eğitimi Başlat (Zoom)
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Şu an eğitim talebi yok</p>
              </div>
            )}
          </div>

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
              Siz de bir saat eğitim sunarak +1 Zaman Kredisi kazanın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Eğitim Konusu</Label>
              <Input
                placeholder="Örn: Monoline Satış Stratejileri"
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Detaylı Açıklama</Label>
              <Textarea
                placeholder="Bu eğitimde neler öğrenilecek?"
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Uygun Saatler</Label>
              <Input
                type="datetime-local"
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <Button
              onClick={() => {
                setShowOfferEducation(false);
                setShowEducationRequests(true);
                loadEducationRequests();
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
              Canlı Eğitim Oturumu
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

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Seans Süresi: 1 Saat</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">
                  Katılımcı: Eğitim Alan Üye
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Sohbet
              </Button>
              <Button
                onClick={() => handleCompleteEducation(educationRequests[0])}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Eğitim Tamamlandı (+1 Kredi)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
