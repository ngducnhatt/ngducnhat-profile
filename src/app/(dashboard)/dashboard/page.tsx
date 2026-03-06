import React from "react";
import { 
  StickyNote, 
  UploadCloud
} from "lucide-react";
import ChangePassword from "@/components/dashboard/ChangePassword";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";
import Link from "next/link";
import { unstable_cache } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// Cache cho Name (Revalidate sau 1h)
const getCachedName = (userId: string) =>
  unstable_cache(
    async () => {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      return u?.name;
    },
    [`user-name-${userId}`],
    { revalidate: 3600, tags: [`user-${userId}`] }
  )();

// Cache cho Stats (Revalidate sau 60s)
const getStats = (userId: string) =>
  unstable_cache(
    async () => {
      const [n, up] = await Promise.all([
        prisma.note.count({ where: { userId } }),
        prisma.upload.count({ where: { userId } })
      ]);
      return { notesCount: n, uploadsCount: up };
    },
    [`user-stats-${userId}`],
    { revalidate: 60, tags: [`stats-${userId}`] }
  )();

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Fetch dữ liệu song song
    const [name, usernameObj, stats] = await Promise.all([
      getCachedName(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { username: true } }),
      getStats(userId)
    ]);

    const { notesCount, uploadsCount } = stats;

    const statsConfig = [
      { label: "Ghi chú cá nhân", value: `${notesCount} bản ghi`, icon: StickyNote, color: "bg-orange-500/10 text-orange-500", href: "/dashboard/notes" },
      { label: "Tổng số tệp tin", value: `${uploadsCount} tệp`, icon: UploadCloud, color: "bg-blue-500/10 text-blue-500", href: "/dashboard/uploads" },
    ];

    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Xin chào, {name || usernameObj?.username}</h1>
          <p className="text-[#8e8e93] mt-1">Mọi thứ đều sẵn sàng để bạn tiếp tục công việc.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statsConfig.map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-[#2c2c2e] p-8 rounded-[2rem] border border-white/5 shadow-xl group hover:border-white/10 transition-all">
              <div className={`p-4 rounded-3xl w-fit ${stat.color} mb-6 transition-transform group-hover:scale-110`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-[#8e8e93] text-sm mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>
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
