'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { DownloadIcon, FileImage, Send, Trash2 } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

type UploadRecord = {
    id: string
    caption: string | null
    file_url: string | null
    file_id: string | null
    created_at: string
}

const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
const FILE_BASE = BOT_TOKEN ? `https://api.telegram.org/file/bot${BOT_TOKEN}` : ''

const ImageUploadPage = () => {
    const { user } = useAuth()
    const supabase = useMemo(() => getSupabaseClient(), [])

    const [file, setFile] = useState<File | null>(null)
    const [caption, setCaption] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)
    const [uploads, setUploads] = useState<UploadRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showEditor, setShowEditor] = useState(false)

    const loadUploads = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('image_uploads')
            .select('id,caption,file_url,file_id,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        if (!error) {
            setUploads(data ?? [])
            setMessage(null)
        } else {
            setMessage(error.message)
            setStatus('error')
        }
        setLoading(false)
    }, [supabase, user])

    useEffect(() => {
        if (!user) return
        loadUploads()
        const channel = supabase
            .channel(`image_uploads_${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'image_uploads', filter: `user_id=eq.${user.id}` },
                () => loadUploads(),
            )
            .subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadUploads, supabase, user])

    const uploadToTelegram = (payload: FormData) => {
        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100)
                    setUploadProgress(percent)
                }
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText))
                        } catch (error) {
                            reject(error)
                        }
                    } else {
                        reject(new Error('Upload thất bại.'))
                    }
                }
            }
            xhr.onerror = () => reject(new Error('Không thể gửi ảnh.'))
            xhr.open('POST', `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`)
            xhr.send(payload)
        })
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!file) {
            setStatus('error')
            setMessage('Hãy chọn một ảnh để tải lên.')
            return
        }
        if (!BOT_TOKEN || !CHAT_ID) {
            setStatus('error')
            setMessage('Thiếu cấu hình Telegram bot. Kiểm tra .env.')
            return
        }

        try {
            setStatus('loading')
            setMessage('Đang gửi tới Telegram Bot...')
            setUploadProgress(0)

            const formData = new FormData()
            formData.append('chat_id', CHAT_ID)
            formData.append('caption', caption || `Upload từ ${user?.email ?? 'dashboard'}`)
            formData.append('photo', file)

            const json = await uploadToTelegram(formData)
            if (!json?.ok) {
                throw new Error(json?.description ?? 'Không thể gửi ảnh.')
            }

            const photoSizes = json.result?.photo ?? []
            const fileId = photoSizes[photoSizes.length - 1]?.file_id

            let filePath: string | null = null
            if (fileId) {
                const getFileResponse = await fetch(
                    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
                )
                const getFileJson = await getFileResponse.json()
                if (getFileJson?.result?.file_path) {
                    filePath = getFileJson.result.file_path
                }
            }

            const { error } = await supabase.from('image_uploads').insert({
                caption: caption || null,
                file_id: fileId ?? null,
                file_url: filePath,
                user_id: user?.id ?? null,
            })
            if (error) {
                throw new Error(error.message)
            }

            await loadUploads()
            setUploadProgress(100)
            setStatus('success')
            setMessage('Đã tải lên thành công!')
            setFile(null)
            setCaption('')
            setShowEditor(false)
            setTimeout(() => setUploadProgress(0), 800)
        } catch (err) {
            setStatus('error')
            setMessage(err instanceof Error ? err.message : 'Không thể tải lên.')
            setUploadProgress(0)
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        const { error } = await supabase
            .from('image_uploads')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        if (error) {
            setStatus('error')
            setMessage(error.message)
        }
        await loadUploads()
    }

    const buildFileUrl = (path: string | null) => {
        if (!path || !FILE_BASE) return null
        return `${FILE_BASE}/${path}`
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Telegram bot</p>
                    <h1 className="text-3xl font-semibold text-white">Tải ảnh qua bot</h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Sử dụng token và chat id cấu hình sẵn trong .env, lưu metadata trên Supabase.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setFile(null)
                            setCaption('')
                            setMessage(null)
                            setStatus('idle')
                            setUploadProgress(0)
                            setShowEditor(true)
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition hover:border-white/30 hover:bg-white/10"
                    >
                        + Thêm ảnh
                    </button>
                </div>
            </div>

            <motion.section
                className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.25)] backdrop-blur dark:border-white/10 dark:from-neutral-950 dark:via-neutral-900 dark:to-black"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Thư viện</p>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ảnh đã tải lên</h2>
                    </div>
                    <span className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                        {loading ? '...' : `${uploads.length} tệp`}
                    </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {!loading && uploads.length === 0 && (
                        <p className="col-span-full rounded-3xl border border-white/10 bg-black/40 py-6 text-center text-sm text-zinc-500">
                            Chưa có ảnh nào.
                        </p>
                    )}
                    {uploads.map((upload) => {
                        const src = buildFileUrl(upload.file_url)
                        return (
                            <motion.article
                                key={upload.id}
                                className="flex flex-col rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-3 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:border-white/10 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-black dark:text-white"
                                layout
                            >
                                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-black/40">
                                    {src ? (
                                        <Image
                                            src={src}
                                            alt={upload.caption ?? 'Upload'}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                                            Không có xem trước
                                        </div>
                                    )}
                                </div>
                                <p className="mt-3 text-sm font-semibold">
                                    {upload.caption ?? 'Không có chú thích'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    {new Date(upload.created_at).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                    })}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    {src ? (
                                        <a
                                            href={src}
                                            download
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-slate-800 hover:border-slate-400 dark:border-white/15 dark:text-slate-100 dark:hover:border-white/30"
                                        >
                                            <DownloadIcon className="h-3.5 w-3.5" />
                                            Tải về
                                        </a>
                                    ) : (
                                        <span className="text-zinc-500">Không có URL</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(upload.id)}
                                        className="inline-flex items-center gap-1 rounded-full border border-red-400/50 px-3 py-1 text-red-700 hover:bg-red-100 dark:border-red-400/40 dark:text-red-200 dark:hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Xóa
                                    </button>
                                </div>
                            </motion.article>
                        )
                    })}
                </div>
            </motion.section>

            {showEditor && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur dark:bg-black/60">
                    <motion.form
                        className="w-[90vw] max-w-sm rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)] dark:border-white/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:text-white"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                    >
                        <div className="flex items-center gap-3">
                            <FileImage className="h-5 w-5 text-slate-500 dark:text-slate-200" />
                            <h2 className="text-lg font-semibold">Thông tin tải lên</h2>
                        </div>
                        <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-zinc-300">
                            <label className="block">
                                Tiêu đề
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 placeholder:text-zinc-500 focus:border-slate-400/60 focus:outline-none dark:border-white/12 dark:bg-black/30 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/30"
                                    value={caption}
                                    onChange={(event) => setCaption(event.target.value)}
                                    placeholder="Mô tả ảnh (tuỳ chọn)"
                                />
                            </label>
                            <label className="block">
                                Chọn ảnh
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 w-full rounded-2xl border border-dashed border-slate-200/80 bg-white px-4 py-3 text-slate-900 focus:border-slate-400/60 focus:outline-none dark:border-white/20 dark:bg-black/25 dark:text-white dark:focus:border-white/30"
                                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                />
                            </label>
                            {file && (
                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-black/30 dark:text-zinc-400">
                                    <p className="text-sm text-slate-900 dark:text-white">{file.name}</p>
                                    <p>
                                        {(file.size / 1024).toFixed(1)} KB · {file.type || 'image'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900"
                                disabled={status === 'loading' || (uploadProgress > 0 && uploadProgress < 100)}
                            >
                                {status === 'loading' ? 'Đang gửi...' : 'Tải lên'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEditor(false)}
                                className="rounded-2xl border border-slate-200/70 px-4 py-3 text-sm text-slate-500 transition hover:border-slate-300 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/30"
                            >
                                Đóng
                            </button>
                        </div>
                        {uploadProgress > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500">
                                    <span>Tiến độ</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-slate-700 transition-all dark:bg-white"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        {message && (
                            <p
                            className={cn(
                                'mt-4 rounded-2xl border px-4 py-3 text-sm',
                                status === 'error'
                                    ? 'border-red-500/40 bg-red-500/10 text-red-100'
                                    : 'border-slate-300/80 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-white',
                            )}
                        >
                            {message}
                        </p>
                    )}
                    </motion.form>
                </div>
            )}
        </div>
    )
}

export default ImageUploadPage
