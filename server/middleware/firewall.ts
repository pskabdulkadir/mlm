import { Request, Response, NextFunction } from "express";
import LoggerService, { LogContext } from "../lib/logger";

interface BanRecord {
  ip: string;
  reason: string;
  expiresAt: number;
}

// In-memory threat map
export const bannedIPs = new Map<string, BanRecord>();

// Admin function to clear bans (for development)
export function clearAllBans() {
  bannedIPs.clear();
  console.log("[FIREWALL] All IP bans cleared by admin");
}

// Simple sliding window request count to prevent rapid DDoS/DoS spikes per IP
const requestLog = new Map<string, { timestamp: number; count: number }>();

const GLOBAL_DDoS_MAX_PER_MINUTE = 1000; // max 1000 requests/minute (safe threshold for single user + dev testing)
const AUTO_BAN_DURATION_MS = 5 * 60 * 1000; // 5 minutes auto-ban (not 24 hours for dev)

export function firewallMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.ip || req.socket.remoteAddress || "").replace("::ffff:", "");

  // Skip firewall in development for localhost
  if (process.env.NODE_ENV === "development" && (ip === "127.0.0.1" || ip === "localhost" || ip === "::1")) {
    return next();
  }

  // 1. Check if IP is currently banned
  const ban = bannedIPs.get(ip);
  if (ban) {
    if (Date.now() < ban.expiresAt) {
      LoggerService.warn(`[SHIELD BLOCKED] Blocked connection from banned IP: ${ip}. Reason: ${ban.reason}`, { context: LogContext.SYSTEM });
      return res.status(403).json({
        error: "Erişim Reddedildi - GÜVENLİK KALKANI",
        message: "Sistem güvenliği nedeniyle IP adresiniz geçici olarak engellenmiştir.",
        reason: ban.reason,
        expiresAt: new Date(ban.expiresAt).toLocaleString("tr-TR")
      });
    } else {
      bannedIPs.delete(ip); // Ban expired
    }
  }

  // 2. Global rate limiter for DoS/DDoS protection (sliding window)
  const now = Date.now();
  const reqData = requestLog.get(ip) || { timestamp: now, count: 0 };
  
  if (now - reqData.timestamp > 60 * 1000) {
    // Reset window
    reqData.timestamp = now;
    reqData.count = 1;
  } else {
    reqData.count += 1;
  }
  requestLog.set(ip, reqData);

  if (reqData.count > GLOBAL_DDoS_MAX_PER_MINUTE) {
    // Auto ban IP for DDoS attempt
    bannedIPs.set(ip, {
      ip,
      reason: "DDoS/DoS Saldırı Teşebbüsü (Aşırı İstek Oranı)",
      expiresAt: now + AUTO_BAN_DURATION_MS
    });
    LoggerService.error(`[DDoS ATTACK] IP ${ip} exceeded maximum requests/minute (${reqData.count}). Auto-banned for 24 hours.`, { context: LogContext.SYSTEM });
    return res.status(429).json({
      error: "Güvenlik Sistemi: DDoS Koruması",
      message: "Aşırı hızlı istek gönderimi nedeniyle IP adresiniz 24 saatliğine engellenmiştir."
    });
  }

  // 3. Scan inputs for dangerous SQL/NoSQL Injection & malicious payloads
  const payloadStr = JSON.stringify({
    body: req.body || {},
    query: req.query || {},
    params: req.params || {}
  });

  const hackerPatterns = [
    // SQL Injections
    /UNION\s+SELECT/i,
    /OR\s+\d+=\d+/i,
    /SELECT\s+\*\s+FROM/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    // NoSQL Injections
    /\{\s*"\$(ne|gt|lt|gte|lte|in|nin|regex|where)"/i,
    /\$(ne|gt|lt|gte|lte|in|nin|regex|where)\b/i,
    // HTML / Script injection (XSS)
    /<script/i,
    /javascript:/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ];

  if (hackerPatterns.some(pattern => pattern.test(payloadStr))) {
    // Serious threat: immediate auto-ban for 24 hours
    bannedIPs.set(ip, {
      ip,
      reason: "Zararlı İstek / Veri Enjeksiyon Teşebbüsü (Hacker Saldırısı)",
      expiresAt: now + AUTO_BAN_DURATION_MS
    });
    LoggerService.error(`[HACKER ATTACK] Malicious payload detected from IP ${ip}. Auto-banned for 24 hours. Payload: ${payloadStr.slice(0, 300)}...`, { context: LogContext.SYSTEM });
    return res.status(403).json({
      error: "Erişim Engellendi (Zararlı İstek)",
      message: "Güvenlik kalkanı tarafından zararlı veri enjeksiyon teşebbüsü algılandı. IP adresiniz 24 saatliğine engellendi."
    });
  }

  next();
}
