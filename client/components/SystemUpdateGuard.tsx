import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, RefreshCw, Power, ShieldAlert, Wrench } from "lucide-react";

interface SystemUpdateGuardProps {
  children: React.ReactNode;
}

export const SystemUpdateGuard: React.FC<SystemUpdateGuardProps> = ({ children }) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check user role for admin control panel access
  useEffect(() => {
    const checkRole = () => {
      try {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const user = JSON.parse(userStr);
          const isUserAdmin = user && (user.role === "admin" || user.email === "programaktif@gmail.com");
          setIsAdmin(!!isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      }
    };

    checkRole();
    // Listen for storage events or storage updates
    window.addEventListener("storage", checkRole);
    return () => window.removeEventListener("storage", checkRole);
  }, []);

  // Poll update status from server
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/auth/system-update-status");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsUpdating(!!data.isSystemUpdating);
            setIsCompleted(!!data.systemUpdateCompletedMessage);
          }
        }
      } catch (error) {
        // Ignore network errors during updates/restarts
      }
    };

    // Run immediately
    checkStatus();

    // Poll every 4 seconds
    const intervalId = setInterval(checkStatus, 4000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // End update mode (Admin only function)
  const handleEndUpdate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/admin/system-update-toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: false }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsUpdating(false);
          setIsCompleted(true);
          // Auto clear completion screen after 3 seconds
          setTimeout(() => {
            setIsCompleted(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Failed to end update:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showOverlay = isUpdating || isCompleted;

  return (
    <>
      {/* Real Application Content */}
      <div className={showOverlay ? "pointer-events-none select-none blur-sm transition-all duration-500" : "transition-all duration-500"}>
        {children}
      </div>

      {/* Global System Update Block Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/95 p-4 md:p-8 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Decorative light elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header Icon / Loader */}
              <div className="relative z-10 flex justify-center mb-8">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                      className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center border border-dashed border-purple-500/50"
                    >
                      <Wrench className="w-10 h-10 text-purple-400" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                      className="absolute top-1 right-1 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Content Text Section */}
              <div className="relative z-10 space-y-4">
                <motion.h2
                  layout
                  className={`text-2xl md:text-3xl font-black tracking-tight ${
                    isCompleted ? "text-emerald-400" : "text-purple-300"
                  }`}
                >
                  {isCompleted ? "GÜNCELLEME TAMAMLANDI!" : "TÜM PANELLER GÜNCELLEME AŞAMASINDA"}
                </motion.h2>

                <motion.p
                  layout
                  className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto"
                >
                  {isCompleted
                    ? "Tüm paneller başarıyla optimize edildi ve güncellendi. Sistem yeniden aktif ediliyor. İyi çalışmalar dileriz!"
                    : "Sistem yöneticisi tarafından tüm paneller üzerinde güncellemeler ve iyileştirmeler yapılmaktadır. Bu işlem sırasında veri güvenliğiniz için tüm işlemler geçici olarak durdurulmuştur."}
                </motion.p>
              </div>

              {/* Progress/Simulated updates bar */}
              {!isCompleted && (
                <div className="relative z-10 mt-8 max-w-md mx-auto">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "10%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 120, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                    <span>GÜNCELLEMELER YÜKLENİYOR</span>
                    <span className="animate-pulse">LÜTFEN BEKLEYİNİZ...</span>
                  </div>
                </div>
              )}

              {/* Admin Override Section */}
              {isAdmin && isUpdating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 mt-10 p-6 bg-slate-950/50 border border-slate-800 rounded-2xl max-w-md mx-auto space-y-4"
                >
                  <div className="flex items-center gap-2 text-amber-500 justify-center">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                    <span className="text-xs font-bold font-mono tracking-widest uppercase">YÖNETİCİ KONTROLÜ</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Yönetici olarak sistemi güncelleme moduna aldınız. İşlemlerinizi bitirdiyseniz sistemi tüm kullanıcılara tekrar açmak için aşağıdaki butonu kullanabilirsiniz.
                  </p>
                  <button
                    onClick={handleEndUpdate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/40 transition-all border border-emerald-500 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4 text-emerald-100" />
                    )}
                    <span>GÜNCELLEMEYİ TAMAMLA VE SİSTEMİ AÇ</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
