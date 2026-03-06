"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { 
  LayoutDashboard, 
  StickyNote, 
  UploadCloud, 
  ShieldCheck, 
  Users, 
  LogOut,
  ChevronRight,
  Menu,
  Heart,
  ChevronLeft,
  X
} from "lucide-react";
import { clsx } from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
  id: string;
  name: string | null;
  role: string;
}

/**
 * Layout chung cho Admin và Dashboard người dùng.
 * Đã tối ưu hóa Tailwind Classes chuẩn v4.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cấu hình SWR ở chế độ Fetch-Once: Chỉ tải 1 lần duy nhất trong suốt phiên làm việc
  const { data: user } = useSWR<User>("/api/auth/me", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isAdmin = user?.role === "ADMIN" || pathname.startsWith("/admin");
  const baseRoute = isAdmin ? "/admin" : "/dashboard";

  const menuItems = [
    { label: "Tổng quan", icon: LayoutDashboard, href: baseRoute },
    { label: "Ghi chú", icon: StickyNote, href: `${baseRoute}/notes` },
    { label: "Tải lên", icon: UploadCloud, href: `${baseRoute}/uploads` },
    { label: "Mã 2FA", icon: ShieldCheck, href: `${baseRoute}/2fa` },
    ...(isAdmin ? [{ label: "Người dùng", icon: Users, href: "/admin/users" }] : []),
    ...(!isAdmin ? [{ label: "Ủng hộ", icon: Heart, href: "/dashboard/support" }] : []),
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#1c1c1e] text-white font-sans overflow-x-hidden">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} className="rounded-none" />
          <h2 className="text-lg font-bold">{isAdmin ? "Admin" : "Dashboard"}</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-[#2c2c2e]">
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar Section */}
      <>
        {/* Mobile Overlay */}
        <div 
          className={clsx(
            "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside 
          className={clsx(
            "bg-[#1c1c1e] transition-all duration-300 border-r border-white/5 flex flex-col shrink-0",
            // Mobile states
            "fixed inset-y-0 left-0 z-60 lg:static lg:z-auto lg:inset-auto",
            isMobileMenuOpen ? "translate-x-0 w-70" : "-translate-x-full lg:translate-x-0",
            // Desktop states
            isSidebarOpen ? "lg:w-72" : "lg:w-20"
          )}
        >
          <div className="flex h-full flex-col p-4 sticky top-0 max-h-screen">
            {/* Logo & Header */}
            <div className="mb-6 flex items-center justify-between px-2 pt-2 lg:pt-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0">
                  <Image src="/logo.svg" alt="Logo" width={32} height={32} className="rounded-none" />
                </div>
                <h2 className={clsx(
                  "text-xl font-bold tracking-tight transition-all duration-300 whitespace-nowrap",
                  !isSidebarOpen ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                )}>
                  {isAdmin ? "Admin" : "Dashboard"}
                </h2>
              </div>
              <button 
                onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-xl bg-[#2c2c2e] p-2 hover:bg-[#3a3a3c] transition-all"
              >
                {isMobileMenuOpen ? <X size={20} /> : (isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />)}
              </button>
            </div>

            <nav className="space-y-1 mt-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group relative",
                      isActive 
                        ? "bg-white text-black shadow-lg" 
                        : "text-[#8e8e93] hover:bg-[#2c2c2e] hover:text-white"
                    )}
                  >
                    <div className="min-w-6 flex justify-center shrink-0">
                      <item.icon size={22} />
                    </div>
                    <span className={clsx(
                      "font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden",
                      (!isSidebarOpen && !isMobileMenuOpen) ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {/* Đăng xuất - Nằm ngay dưới Menu */}
              <div className="pt-4 mt-4 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 px-3 py-3 rounded-2xl text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors"
                >
                  <div className="min-w-6 flex justify-center shrink-0">
                    <LogOut size={22} />
                  </div>
                  <span className={clsx(
                    "font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden",
                    (!isSidebarOpen && !isMobileMenuOpen) ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                  )}>
                    Đăng xuất
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </aside>
      </>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full text-white">
          {children}
        </div>
      </main>
    </div>
  );
}
