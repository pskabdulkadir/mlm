/**
 * Action Progress Tracker Component
 * Tüm Otonom Akıllı Yönetim işlemlerinin gerçek zamanlı takibi
 * Detaylı bilgilendirme paneli açma işlevi
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
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  Zap,
  Heart,
  Users,
  BookOpen,
  Compass,
} from "lucide-react";

interface ActionProgress {
  id: string;
  actionType: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  progress: number; // 0-100
  steps: ActionStep[];
  result?: any;
  error?: string;
  category: "operational" | "psychology" | "social" | "knowledge" | "simulation";
}

interface ActionStep {
  name: string;
  status: "pending" | "completed" | "failed";
  timestamp?: Date;
  details?: string;
}

interface ActionProgressTrackerProps {
  action: ActionProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionProgressTracker({
  action,
  isOpen,
  onClose,
}: ActionProgressTrackerProps) {
  const [displayedAction, setDisplayedAction] = useState<ActionProgress | null>(
    action
  );

  useEffect(() => {
    setDisplayedAction(action);
  }, [action]);

  if (!displayedAction) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      operational: <Zap className="w-5 h-5" />,
      psychology: <Heart className="w-5 h-5" />,
      social: <Users className="w-5 h-5" />,
      knowledge: <BookOpen className="w-5 h-5" />,
      simulation: <Compass className="w-5 h-5" />,
    };
    return icons[category] || <Info className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-amber-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "in_progress":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "failed":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "in_progress":
        return "İşlem Devam Ediyor";
      case "failed":
        return "Başarısız";
      default:
        return "Bekleniyor";
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("tr-TR");
  };

  const formatDuration = (start: Date, end?: Date) => {
    const duration = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              {getCategoryIcon(displayedAction.category)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-white">
                {displayedAction.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1">
                {displayedAction.description}
              </DialogDescription>
            </div>
            <Badge className={`border font-mono text-xs ${getStatusColor(displayedAction.status)}`}>
              {getStatusText(displayedAction.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* İşlem Özeti */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white">İşlem Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Başlangıç Zamanı:</span>
                  <div className="text-white font-mono font-bold">
                    {formatTime(displayedAction.startTime)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Süre:</span>
                  <div className="text-white font-mono font-bold">
                    {formatDuration(displayedAction.startTime, displayedAction.endTime)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Genel İlerleme</span>
                  <span className="text-white font-bold text-sm">{displayedAction.progress}%</span>
                </div>
                <Progress value={displayedAction.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Adımlar / Detaylar */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white">İşlem Adımları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedAction.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : step.status === "failed" ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-medium text-sm">{step.name}</span>
                        {step.timestamp && (
                          <span className="text-slate-500 text-xs font-mono">
                            {formatTime(step.timestamp)}
                          </span>
                        )}
                      </div>
                      {step.details && (
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hata Detayları */}
          {displayedAction.status === "failed" && displayedAction.error && (
            <Card className="bg-red-950/20 border-red-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm font-bold text-red-300">
                    Hata Detayları
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-200 text-sm bg-red-950/20 p-3 rounded-lg border border-red-900/30 font-mono">
                  {displayedAction.error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sonuç Detayları */}
          {displayedAction.status === "completed" && displayedAction.result && (
            <Card className="bg-emerald-950/20 border-emerald-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <CardTitle className="text-sm font-bold text-emerald-300">
                    Sonuç
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/30 text-sm space-y-2">
                  {typeof displayedAction.result === "object" ? (
                    <pre className="text-emerald-200 text-xs overflow-auto max-h-40 font-mono">
                      {JSON.stringify(displayedAction.result, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-emerald-200">{displayedAction.result}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
          >
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
