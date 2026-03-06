import React from "react";
import { 
  StickyNote, 
  UploadCloud
} from "lucide-react";
import ChangePassword from "@/components/dashboard/ChangePassword";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Trang Tổng quan người dùng.
 * Đã lược bỏ Hoạt động gần đây và Thao tác nhanh theo yêu cầu.
 */
export default async function UserDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true }
    });

    const [notesCount, uploadsCount] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.upload.count({ where: { userId } })
    ]);

    const stats = [
      { label: "Ghi chú cá nhân", value: `${notesCount} bản ghi`, icon: StickyNote, color: "bg-orange-500/10 text-orange-500", href: "/dashboard/notes" },
      { label: "Tổng số tệp tin", value: `${uploadsCount} tệp`, icon: UploadCloud, color: "bg-blue-500/10 text-blue-500", href: "/dashboard/uploads" },
    ];

    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xin chào, {user?.name || user?.username}</h1>
          <p className="text-[#8e8e93] mt-1">Mọi thứ đều sẵn sàng để bạn tiếp tục công việc.</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-[#2c2c2e] p-8 rounded-[2rem] border border-white/5 shadow-xl group hover:border-white/10 transition-all">
              <div className={`p-4 rounded-3xl w-fit ${stat.color} mb-6 transition-transform group-hover:scale-110`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-[#8e8e93] text-sm mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Change Password Section */}
        <ChangePassword />
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <p className="text-[#8e8e93]">Phiên làm việc hết hạn. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }
}
