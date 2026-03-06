import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
      </div>
      <div className="space-y-2 text-center text-white">
        <h3 className="text-xl font-bold tracking-tight">Đang tải dữ liệu...</h3>
        <p className="text-[#8e8e93] text-sm animate-pulse">Vui lòng đợi trong giây lát.</p>
      </div>
    </div>
  );
}
