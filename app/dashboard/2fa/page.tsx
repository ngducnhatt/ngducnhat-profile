'use client'

import { motion } from 'motion/react'
import { FormEvent, useEffect, useState } from 'react'

import { ShieldCheck, Trash2, WandSparkles } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { generateTOTP, getTimeWindow } from '@/lib/totp'
import { cn } from '@/lib/utils'

type TokenEntry = {
    id: string
    label: string
    secret: string
    active: boolean
    created_at: string
}

const STORAGE_KEY = 'twofa.entries.v1'

const stripCode = (secret: string) => (secret.split('|')[0] ?? secret)

const normalizeForTotp = (secret: string) => stripCode(secret).replace(/[^A-Z2-7]/gi, '').toUpperCase()

const formatForInput = (secret: string) =>
    stripCode(secret)
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
        .match(/.{1,4}/g)
        ?.join(' ') ?? ''

const EXAMPLE_SECRET = 'ggrs x7zg v2hi mnem xyxc 3v65 4jw2 bxfa'
const BASE32_REGEX = /^[A-Z2-7]+$/

const getSecretValidationMessage = (secret: string) => {
    if (!secret) return 'Secret TOTP không được để trống.'
    if (!BASE32_REGEX.test(secret)) return 'Secret chỉ nhận chữ A-Z và số 2-7 (Base32).'
    if (secret.length < 16) return 'Secret cần tối thiểu 16 ký tự để sinh mã 6 số ổn định.'
    return null
}

const fallbackId = () => `twofa-${Date.now()}-${Math.random().toString(16).slice(2)}`

const toId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return fallbackId()
}

const readEntriesFromStorage = (): TokenEntry[] => {
    if (typeof window === 'undefined') return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter((entry): entry is Partial<TokenEntry> => typeof entry === 'object' && entry !== null)
            .map((entry) => ({
                id: entry.id ?? toId(),
                label: entry.label ?? 'Secret',
                secret: normalizeForTotp(entry.secret ?? ''),
                active: entry.active ?? true,
                created_at: entry.created_at ?? new Date().toISOString(),
            }))
            .filter((entry) => entry.secret)
    } catch {
        return []
    }
}

const persistEntries = (entries: TokenEntry[]) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

const TwoFAPage = () => {
    const { role } = useAuth()

    const [entries, setEntries] = useState<TokenEntry[]>([])
    const [form, setForm] = useState({ label: '', secret: '' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tick, setTick] = useState(Date.now())
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [codes, setCodes] = useState<Record<string, string>>({})
    const [previewCode, setPreviewCode] = useState('------')
    const [showEditor, setShowEditor] = useState(false)

    const updateEntries = (nextEntries: TokenEntry[]) => {
        setEntries(nextEntries)
        try {
            persistEntries(nextEntries)
        } catch {
            setError('Không thể lưu danh sách 2FA trên trình duyệt.')
        }
    }

    useEffect(() => {
        const loaded = readEntriesFromStorage()
        setEntries(loaded)
        setLoading(false)
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setTick(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        let cancelled = false
        const computeCodes = async () => {
            const nowCodes: Record<string, string> = {}
            await Promise.all(
                entries.map(async (entry) => {
                    try {
                        nowCodes[entry.id] = await generateTOTP(entry.secret)
                    } catch {
                        nowCodes[entry.id] = '------'
                    }
                }),
            )
            if (!cancelled) {
                setCodes(nowCodes)
            }
        }
        computeCodes()
        return () => {
            cancelled = true
        }
    }, [entries, tick])

    if (role !== 'admin') {
        return (
            <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-100">
                Chức năng chỉ dành cho admin.
            </div>
        )
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        const label = form.label.trim()
        const normalizedSecret = normalizeForTotp(form.secret)
        const validationError = getSecretValidationMessage(normalizedSecret)

        if (!label || !normalizedSecret || validationError) {
            setError(validationError ?? 'Secret TOTP không hợp lệ.')
            return
        }

        if (editingId) {
            const updatedEntries = entries.map((entry) =>
                entry.id === editingId ? { ...entry, label, secret: normalizedSecret } : entry,
            )
            updateEntries(updatedEntries)
            setEditingId(null)
            setForm({ label: '', secret: '' })
            setError(null)
            return
        }

        const newEntry: TokenEntry = {
            id: toId(),
            label,
            secret: normalizedSecret,
            active: true,
            created_at: new Date().toISOString(),
        }

        const nextEntries = [newEntry, ...entries]
        updateEntries(nextEntries)
        setForm({ label: '', secret: '' })
        setError(null)
        setShowEditor(false)
    }

    const handleDelete = (id: string) => {
        const nextEntries = entries.filter((entry) => entry.id !== id)
        updateEntries(nextEntries)
        if (editingId === id) {
            setEditingId(null)
            setForm({ label: '', secret: '' })
        }
    }

    const toggleActive = (id: string, active: boolean) => {
        setError(null)
        const nextEntries = entries.map((entry) =>
            entry.id === id ? { ...entry, active: !active } : entry,
        )
        updateEntries(nextEntries)
    }

    const normalizedFormSecret = normalizeForTotp(form.secret)
    const inlineValidation =
        form.secret.trim() !== '' ? getSecretValidationMessage(normalizedFormSecret) : null

    useEffect(() => {
        let cancelled = false
        const computePreview = async () => {
            if (!normalizedFormSecret || inlineValidation) {
                setPreviewCode('------')
                return
            }
            try {
                const code = await generateTOTP(normalizedFormSecret)
                if (!cancelled) setPreviewCode(code)
            } catch {
                if (!cancelled) setPreviewCode('------')
            }
        }
        computePreview()
        return () => {
            cancelled = true
        }
    }, [inlineValidation, normalizedFormSecret, tick])

    const { expiresIn: secondsRemaining, period } = getTimeWindow(30, tick)
    const cycleProgress = ((period - secondsRemaining) / period) * 100

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Bảo mật</p>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Trình quản lý 2FA</h1>
                    <p className="text-sm text-zinc-500">
                        Nhập secret key TOTP (giống Google Authenticator) để tạo mã 6 số mỗi 30s. Secret chỉ lưu trên
                        trình duyệt của bạn.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null)
                            setForm({ label: '', secret: '' })
                            setError(null)
                            setShowEditor(true)
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition hover:border-white/30 hover:bg-white/10"
                    >
                        + Thêm secret
                    </button>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-zinc-300 backdrop-blur sm:self-start">
                        <span>Chu kỳ 30s</span>
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                            <span className="block h-full bg-white" style={{ width: `${cycleProgress}%` }} />
                        </div>
                        <span>{secondsRemaining}s</span>
                    </div>
                </div>
            </div>

            <motion.section
                className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.25)] backdrop-blur dark:border-white/10 dark:from-neutral-950 dark:via-neutral-900 dark:to-black"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">Secret đang hoạt động</p>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mã 6 số realtime</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                        <WandSparkles className="h-3.5 w-3.5" />
                        <span>{loading ? '...' : entries.length}</span>
                    </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {!loading && entries.length === 0 && (
                        <p className="col-span-full rounded-3xl border border-white/10 bg-black/40 py-6 text-center text-sm text-zinc-500">
                            Chưa có secret nào.
                        </p>
                    )}
                    {entries.map((entry) => (
                        <motion.article
                            key={entry.id}
                            className={cn(
                                'rounded-3xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)]',
                                entry.active
                                    ? 'border-slate-400/50 bg-gradient-to-br from-slate-200/70 via-white to-white dark:from-neutral-900/40 dark:via-neutral-900/20 dark:to-black'
                                    : 'border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:border-white/10 dark:from-neutral-900/60 dark:to-black',
                            )}
                            layout
                        >
                            <div className="flex items-center justify-between text-sm text-slate-900 dark:text-white">
                                <span className="font-semibold">{entry.label}</span>
                                <div className="flex gap-2">
                                    <button
                                        className="text-xs text-slate-800 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-100"
                                        type="button"
                                        onClick={() => {
                                            setEditingId(entry.id)
                                            setForm({ label: entry.label, secret: entry.secret })
                                            setShowEditor(true)
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="text-xs text-red-600 hover:text-red-500 dark:text-red-200 dark:hover:text-red-100"
                                        type="button"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-3xl tracking-[0.22em] text-slate-900 dark:text-white">
                                {codes[entry.id] ?? '------'}
                            </p>
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                                {formatForInput(entry.secret)}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <button
                                    type="button"
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-xs transition',
                                        entry.active
                                            ? 'border-slate-500/50 text-slate-800 dark:border-white/20 dark:text-white'
                                            : 'border-slate-200/80 text-zinc-500 dark:border-white/10 dark:text-zinc-400',
                                    )}
                                    onClick={() => toggleActive(entry.id, entry.active)}
                                >
                                    {entry.active ? 'Đang bật' : 'Đang tắt'}
                                </button>
                                <span>Còn {secondsRemaining}s</span>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </motion.section>

            {showEditor && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur dark:bg-black/60">
                    <motion.form
                        onSubmit={handleSubmit}
                        className="w-[90vw] max-w-sm rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)] dark:border-white/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:text-white"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Cấu hình</p>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {editingId ? 'Cập nhật secret' : 'Thêm secret mới'}
                                </h2>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-slate-400 dark:text-slate-200" />
                        </div>
                        <div className="mt-5 space-y-4 text-sm text-zinc-300">
                            <label className="block">
                                Nhãn hiển thị
                                <input
                                    type="text"
                                className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 placeholder:text-zinc-500 focus:border-slate-400/60 focus:outline-none dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-zinc-700 dark:focus:border-white/30"
                                    value={form.label}
                                    onChange={(event) => {
                                        setError(null)
                                        setForm((prev) => ({ ...prev, label: event.target.value }))
                                    }}
                                    required
                                />
                            </label>
                            <label className="block">
                                Secret TOTP (giữ nguyên chữ thường/số)
                                <input
                                    type="text"
                                className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 placeholder:text-zinc-500 focus:border-slate-400/60 focus:outline-none dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-zinc-700 dark:focus:border-white/30"
                                    value={form.secret}
                                    onChange={(event) => {
                                        setError(null)
                                        setForm((prev) => ({
                                            ...prev,
                                            secret: event.target.value,
                                        }))
                                    }}
                                    required
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Ví dụ: <span className="font-mono text-zinc-300">{EXAMPLE_SECRET}</span>. Chỉ loại
                                    bỏ dấu cách/ký tự lạ, không thay đổi 0/1/O/L.
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((prev) => ({
                                                ...prev,
                                                secret: EXAMPLE_SECRET,
                                            }))
                                        }
                                        className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-zinc-300 transition hover:border-white/30"
                                    >
                                        Dán secret mẫu
                                    </button>
                                    <span>Dán secret Google Authenticator vào để xem mã 6 số.</span>
                                </div>
                            </label>
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/30">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Xem trước mã</p>
                                        <p className="text-sm text-zinc-400">
                                            Mã 6 số thay đổi mỗi 30s giống Google Authenticator.
                                        </p>
                                        <p className="font-mono text-xs text-zinc-300">
                                            {normalizedFormSecret || '...'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-3xl tracking-[0.22em] text-white">{previewCode}</p>
                                        <p className="text-xs text-zinc-500">Còn {secondsRemaining}s</p>
                                    </div>
                                </div>
                                {inlineValidation ? (
                                    <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                                        {inlineValidation}
                                    </p>
                                ) : normalizedFormSecret ? (
                                    <p className="mt-3 rounded-xl border border-slate-300/80 bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:border-slate-500/40 dark:bg-slate-800/60 dark:text-slate-100">
                                        Secret hợp lệ và đang sinh mã 6 số.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-slate-100 dark:bg-white dark:text-zinc-900"
                            >
                                {editingId ? 'Lưu' : 'Thêm mã'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEditor(false)}
                                className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-zinc-300 hover:border-white/30"
                            >
                                Đóng
                            </button>
                        </div>
                        {error && (
                            <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                                {error}
                            </p>
                        )}
                    </motion.form>
                </div>
            )}
        </div>
    )
}

export default TwoFAPage
