'use client'

import { motion } from 'motion/react'
import { FileImage, NotebookPen } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/components/providers/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-client'

type StatValue = number | null

const DashboardPage = () => {
    const { user, role } = useAuth()
    const supabase = useMemo(() => getSupabaseClient(), [])
    const [stats, setStats] = useState<{ notes: StatValue; images: StatValue }>({
        notes: null,
        images: null,
    })
    const [loadingStats, setLoadingStats] = useState(true)

    const fetchCounts = useCallback(async () => {
        if (!user) return
        setLoadingStats(true)

        const [notesRes, imageRes] = await Promise.all([
            supabase.from('notes').select('id', { head: true, count: 'exact' }).eq('user_id', user.id),
            supabase
                .from('image_uploads')
                .select('id', { head: true, count: 'exact' })
                .eq('user_id', user.id),
        ])

        setStats({
            notes: notesRes.count ?? 0,
            images: imageRes.count ?? 0,
        })
        setLoadingStats(false)
    }, [supabase, user])

    useEffect(() => {
        fetchCounts()
    }, [fetchCounts])

    const statCards = [
        {
            label: 'Ghi chú',
            value: stats.notes,
            icon: NotebookPen,
        },
        {
            label: 'Ảnh đã tải lên',
            value: stats.images,
            icon: FileImage,
        },
    ]

    return (
        <div className="space-y-6">
            <motion.section
                className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-6 shadow-[0_40px_140px_rgba(0,0,0,0.45)] sm:p-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.45em] text-black dark:text-zinc-400">Xin chào</p>
                        <h1 className="text-3xl font-semibold  text-black dark:text-white sm:text-4xl">
                            {user ? `Chào mừng ${user.email}` : 'Chào mừng bạn trở lại'}
                        </h1>
                        <p className="max-w-2xl text-sm text-zinc-400">
                            {role === 'admin'
                                ? 'Bạn đang ở chế độ quản trị: quản lý người dùng và toàn bộ dữ liệu.'
                                : 'Bắt đầu ngày mới với ghi chú, tải tài liệu và theo dõi nhiệm vụ.'}
                        </p>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs uppercase tracking-[0.3em] text-zinc-400 sm:w-auto sm:flex-col sm:items-end sm:gap-1 sm:px-4">
                        <span className="text-[11px]">Trang tổng quan</span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white">
                            {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => (
                        <motion.div
                            key={card.label}
                            className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-6 backdrop-blur"
                            whileHover={{ scale: 1.01 }}
                        >
                            <card.icon className="h-5 w-5 text-zinc-400" />
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{card.label}</p>
                            <p className="text-3xl font-semibold text-white">
                                {loadingStats ? '...' : card.value ?? '--'}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}

export default DashboardPage
