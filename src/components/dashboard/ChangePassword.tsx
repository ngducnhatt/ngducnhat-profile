"use client";

import React, { useState } from "react";
import { ShieldCheck, Key, ArrowRight, StickyNote, UploadCloud, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

/**
 * Component đổi mật khẩu và bảo mật.
 * Đã xóa các đoạn mô tả thừa theo yêu cầu.
 */
export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.message || "Đã xảy ra lỗi" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ" });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { label: "Ghi chú của tôi", icon: StickyNote, href: "/dashboard/notes", color: "text-orange-500" },
    { label: "Quản lý tệp tin", icon: UploadCloud, href: "/dashboard/uploads", color: "text-blue-500" },
    { label: "Xác thực 2 lớp", icon: Smartphone, href: "/dashboard/2fa", color: "text-green-500" },
  ];

  return (
    <div className="bg-[#2c2c2e] rounded-3xl lg:rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Change Password Form */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="bg-green-500/10 p-2.5 rounded-xl">
              <ShieldCheck className="text-green-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">Bảo mật tài khoản</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto lg:mx-0">
            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs font-semibold text-[#8e8e93] ml-1 uppercase tracking-wider">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs font-semibold text-[#8e8e93] ml-1 uppercase tracking-wider">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs font-semibold text-[#8e8e93] ml-1 uppercase tracking-wider">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div className={clsx(
                "p-4 rounded-2xl text-sm font-medium flex items-center gap-2",
                message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="flex-1">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#e5e5ea] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cập nhật mật khẩu"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Right Side: Quick Access Links */}
        <div className="w-full lg:w-80 p-6 sm:p-8 lg:p-10 bg-[#3a3a3c]/30">
          <h3 className="text-xs lg:text-sm font-bold uppercase tracking-widest text-[#8e8e93] mb-6">Truy cập nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-4 bg-[#1c1c1e]/50 rounded-2xl border border-white/5 hover:bg-white hover:text-black group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={20} className={clsx(link.color, "group-hover:text-black transition-colors")} />
                  <span className="text-sm font-semibold">{link.label}</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all hidden lg:block" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
