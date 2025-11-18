'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { DownloadIcon, FileImage, Send, Trash2 } from 'lucide-react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
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
            setMessage('Hãy chọn một ảnh để upload.')
            return
        }
        if (!BOT_TOKEN || !CHAT_ID) {
            setStatus('error')
            setMessage('Thiếu cấu hình Telegram bot. Kiểm tra .env.')
            return
        }

        try {
            setStatus('loading')
            setMessage('Đang gửi đến Telegram Bot…')
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
            setMessage('Đã upload thành công!')
            setFile(null)
            setCaption('')
            setTimeout(() => setUploadProgress(0), 800)
        } catch (err) {
            setStatus('error')
            setMessage(err instanceof Error ? err.message : 'Không thể upload.')
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-semibold text-white"
                    >
                        Upload ảnh qua Telegram Bot
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Sử dụng token và chat id cấu hình sẵn trong .env, lưu metadata trên Supabase.
                    </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zinc-500">
                    BOT
                </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <motion.form
                    className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <FileImage className="h-5 w-5 text-zinc-400" />
                        <h2 className="text-lg font-semibold text-white">Thông tin upload</h2>
                    </div>
                    <div className="mt-5 space-y-4 text-sm text-zinc-300">
                        <label className="block">
                            Tiêu đề
                            <input
                                type="text"
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
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
                                className="mt-1 w-full rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                            />
                        </label>
                        {file && (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-400">
                                <p className="text-sm text-white">{file.name}</p>
                                <p>
                                    {(file.size / 1024).toFixed(1)} KB • {file.type || 'image'}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-base font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed"
                        disabled={status === 'loading' || (uploadProgress > 0 && uploadProgress < 100)}
                    >
                        <Send className="h-4 w-4" />
                        {status === 'loading' ? 'Đang gửi…' : 'Upload'}
                    </button>
                    {uploadProgress > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>Ti?n d?</span>
                                <span>${uploadProgress}%</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-white transition-all"
                                    style={{ width: '${uploadProgress}%' }}
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
                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
                            )}
                        >
                            {message}
                        </p>
                    )}
                </motion.form>

                <motion.section
                    className="rounded-[24px] border border-white/10 bg-black/35 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Ảnh đã upload</h2>
                        <span className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                            {loading ? '...' : `${uploads.length} files`}
                        </span>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {!loading && uploads.length === 0 && (
                            <p className="col-span-full rounded-3xl border border-white/10 bg-black/30 py-6 text-center text-sm text-zinc-500">
                                Chưa có ảnh nào.
                            </p>
                        )}
                        {uploads.map((upload) => {
                            const src = buildFileUrl(upload.file_url)
                            return (
                                <motion.article
                                    key={upload.id}
                                    className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-3"
                                    layout
                                >
                                    <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
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
                                                Không có preview
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-white">
                                        {upload.caption ?? 'Không có caption'}
                                    </p>
                                    <p className="text-xs text-zinc-500">
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
                                                className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-emerald-200 hover:border-white/40"
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
                                            className="inline-flex items-center gap-1 rounded-full border border-red-500/50 px-2 py-1 text-red-200 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Xoá
                                        </button>
                                    </div>
                                </motion.article>
                            )
                        })}
                    </div>
                </motion.section>
            </div>
        </div>
    )
}

export default ImageUploadPage
