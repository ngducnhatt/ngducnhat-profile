import React from "react";
import { 
  Users, 
  StickyNote, 
  UploadCloud, 
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import ChangePassword from "@/components/dashboard/ChangePassword";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Trang Tổng quan Admin.
 * Hiển thị các thống kê nhanh của hệ thống.
 */
export default async function AdminOverview() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let adminName = "Admin";

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const admin = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { name: true } as any
      }) as any;
      if (admin?.name) adminName = admin.name as string;
    } catch (e) {}
  }

  // Fetch real stats with explicit number casting
  const statsData = await Promise.all([
    prisma.user.count(),
    prisma.note.count(),
    prisma.upload.count()
  ]);
  
  const totalUsers = statsData[0] as number;
  const totalNotes = statsData[1] as number;
  const totalUploads = statsData[2] as number;

  // Fetch recent activity with ANY to bypass type sync issues
  const [recentNotes, recentUploads, recentUsers] = await Promise.all([
    prisma.note.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { 
          select: { name: true, email: true, username: true } as any
        } 
      } as any
    }) as Promise<any[]>,
    prisma.upload.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { 
          select: { name: true, email: true, username: true } as any
        } 
      } as any
    }) as Promise<any[]>,
    prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, username: true, createdAt: true } as any
    }) as Promise<any[]>
  ]);

  const activities = [
    ...recentNotes.map(n => ({
      id: n.id,
      type: "Ghi chú",
      content: `${n.user?.name || n.user?.username || n.user?.email} đã tạo ghi chú: ${n.title}`,
      time: n.createdAt,
      link: `/admin/notes`
    })),
    ...recentUploads.map(u => ({
      id: u.id,
      type: "Tải lên",
      content: `${u.user?.name || u.user?.username || u.user?.email} đã tải lên: ${u.name}`,
      time: u.createdAt,
      link: `/admin/uploads`
    })),
    ...recentUsers.map(u => ({
      id: u.username || u.email,
      type: "Người dùng",
      content: `Người dùng mới đăng ký: ${u.name || u.username || u.email}`,
      time: u.createdAt,
      link: `/admin/users`
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  const stats = [
    { label: "Người dùng", value: totalUsers.toString(), icon: Users, color: "bg-blue-500/10 text-blue-500" },
    { label: "Ghi chú", value: totalNotes.toString(), icon: StickyNote, color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Tải lên", value: totalUploads.toString(), icon: UploadCloud, color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chào mừng quay lại, {adminName}</h1>
        <p className="text-[#8e8e93] mt-1">Dưới đây là thống kê hệ thống của bạn hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#2c2c2e] p-6 rounded-4xl border border-white/5 shadow-xl transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <div>
              <p className="text-[#8e8e93] text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Change Password Section */}
      <ChangePassword />

      {/* Recent Activity */}
      <div className="bg-[#2c2c2e] p-8 rounded-4xl border border-white/5 shadow-xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#8e8e93]" />
            Hoạt động gần đây
          </h2>
        </div>
        <div className="space-y-4">
          {activities.length > 0 ? activities.map((activity, idx) => (
            <div key={`${activity.id}-${idx}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
              <div className="bg-[#3a3a3c] p-2.5 rounded-xl group-hover:bg-[#48484a] transition-colors">
                {activity.type === "Ghi chú" ? <StickyNote size={20} className="text-yellow-500" /> : 
                 activity.type === "Tải lên" ? <UploadCloud size={20} className="text-purple-500" /> : 
                 <Users size={20} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.content}</p>
                <p className="text-xs text-[#8e8e93] mt-0.5">
                  {formatDistanceToNow(activity.time, { addSuffix: true, locale: vi })}
                </p>
              </div>
              <a href={activity.link} className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[#3a3a3c] rounded-full hover:bg-white hover:text-black transition-all">
                <Eye size={14} />
                Chi tiết
              </a>
            </div>
          )) : (
            <p className="text-[#8e8e93] text-center py-8">Chưa có hoạt động nào gần đây.</p>
          )}
        </div>
      </div>
    </div>
  );
}
