import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Global error handler caught:", err);
  return res.status(err.status || 500).json({
    error: err.message || "Bir iç sunucu hatası oluştu.",
    success: false
  });
}
