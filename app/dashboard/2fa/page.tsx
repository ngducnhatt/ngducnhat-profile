'use client'

import { motion } from 'motion/react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { totp } from 'otplib'

import { ShieldCheck, Trash2, WandSparkles } from 'lucide-react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { useAuth } from '@/components/providers/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

type TokenEntry = {
    id: string
    label: string
    secret: string
    active: boolean
    created_at: string
}

totp.options = { digits: 6, step: 30 }

const generateCode = (secret: string) => {
    try {
        return totp.generate(secret)
    } catch {
        return '------'
    }
}

const TwoFAPage = () => {
    const { role } = useAuth()
    const supabase = useMemo(() => getSupabaseClient(), [])

    const [entries, setEntries] = useState<TokenEntry[]>([])
    const [form, setForm] = useState({ label: '', secret: '' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tick, setTick] = useState(Date.now())
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const loadTokens = useCallback(async () => {
        setLoading(true)
        const { data, error: fetchError } = await supabase
            .from('twofa_tokens')
            .select('id,label,secret,active,created_at')
            .order('created_at', { ascending: false })

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setEntries(data ?? [])
            setError(null)
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        if (role !== 'admin') return
        loadTokens()
        const channel = supabase
            .channel('twofa_tokens')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'twofa_tokens' },
                () => loadTokens(),
            )
            .subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadTokens, role, supabase])

    useEffect(() => {
        const timer = setInterval(() => setTick(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (role !== 'admin') {
        return (
            <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-100">
                Chức năng chỉ dành cho admin.
            </div>
        )
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!form.label || !form.secret) return

        if (editingId) {
            const { error: updateError } = await supabase
                .from('twofa_tokens')
                .update({ label: form.label, secret: form.secret })
                .eq('id', editingId)
            if (updateError) {
                setError(updateError.message)
                return
            }
            setEditingId(null)
            setForm({ label: '', secret: '' })
            loadTokens()
            return
        }

        const { error: insertError } = await supabase
            .from('twofa_tokens')
            .insert({ label: form.label, secret: form.secret, active: true })

        if (insertError) {
            setError(insertError.message)
            return
        }
        setForm({ label: '', secret: '' })
        loadTokens()
    }

    const handleDelete = async (id: string) => {
        const { error: deleteError } = await supabase.from('twofa_tokens').delete().eq('id', id)
        if (deleteError) {
            setError(deleteError.message)
        }
        if (editingId === id) {
            setEditingId(null)
            setForm({ label: '', secret: '' })
        }
        loadTokens()
    }

    const toggleActive = async (id: string, active: boolean) => {
        const { error: toggleError } = await supabase
            .from('twofa_tokens')
            .update({ active: !active })
            .eq('id', id)
        if (toggleError) {
            setError(toggleError.message)
            return
        }
        loadTokens()
    }

    const minutesRemaining = 30 - Math.floor((tick / 1000) % 30)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-semibold text-white"
                    >
                        Trình quản lý 2FA
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Dữ liệu đọc trực tiếp từ Supabase, cập nhật mã theo thời gian thực.
                    </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zinc-500">
                    {minutesRemaining}s
                </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <motion.form
                    onSubmit={handleSubmit}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-zinc-400" />
                        <h2 className="text-lg font-semibold text-white">
                            {editingId ? 'Cập nhật mã' : 'Thêm mã mới'}
                        </h2>
                    </div>
                    <div className="mt-5 space-y-4 text-sm text-zinc-300">
                        <label className="block">
                            Nhãn hiển thị
                            <input
                                type="text"
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
                                value={form.label}
                                onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                                required
                            />
                        </label>
                        <label className="block">
                            Secret
                            <input
                                type="text"
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
                                value={form.secret}
                                onChange={(event) => setForm((prev) => ({ ...prev, secret: event.target.value }))}
                                required
                            />
                        </label>
                    </div>
                    <div className="mt-5 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                        >
                            {editingId ? 'Lưu' : 'Thêm mã'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null)
                                    setForm({ label: '', secret: '' })
                                }}
                                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:border-white/30"
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                    {error && (
                        <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                            {error}
                        </p>
                    )}
                </motion.form>

                <motion.section
                    className="rounded-[24px] border border-white/10 bg-black/35 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Mã đang hoạt động</h2>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                            <WandSparkles className="h-3.5 w-3.5" />
                            <span>{loading ? '...' : entries.length}</span>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {!loading && entries.length === 0 && (
                            <p className="col-span-full rounded-3xl border border-white/10 bg-black/30 py-6 text-center text-sm text-zinc-500">
                                Chưa có mã nào.
                            </p>
                        )}
                        {entries.map((entry) => (
                            <motion.article
                                key={entry.id}
                                className={cn(
                                    'rounded-3xl border border-white/10 p-4',
                                    entry.active ? 'bg-white/10' : 'bg-black/20',
                                )}
                                layout
                            >
                                <div className="flex items-center justify-between text-sm text-white">
                                    <span className="font-semibold">{entry.label}</span>
                                    <div className="flex gap-2">
                                        <button
                                            className="text-xs text-emerald-300"
                                            type="button"
                                            onClick={() => {
                                                setEditingId(entry.id)
                                                setForm({ label: entry.label, secret: entry.secret })
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="text-xs text-red-300"
                                            type="button"
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-3 font-mono text-3xl tracking-[0.2em] text-white">
                                    {generateCode(entry.secret)}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                                    <button
                                        type="button"
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-xs transition',
                                            entry.active
                                                ? 'border-emerald-500/40 text-emerald-200'
                                                : 'border-white/10 text-zinc-400',
                                        )}
                                        onClick={() => toggleActive(entry.id, entry.active)}
                                    >
                                        {entry.active ? 'Đang bật' : 'Đang tắt'}
                                    </button>
                                    <span>{minutesRemaining}s làm mới</span>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    )
}

export default TwoFAPage
