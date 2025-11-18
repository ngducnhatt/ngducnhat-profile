'use client'

import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { NotebookPen, WandSparkles } from 'lucide-react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { useAuth } from '@/components/providers/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

type Note = {
    id: string
    title: string
    content: string
    color: string
    updated_at: string
}

const palette = ['#f97316', '#eab308', '#22d3ee', '#14b8a6', '#a855f7', '#ef4444']

const NotePage = () => {
    const { user } = useAuth()
    const supabase = useMemo(() => getSupabaseClient(), [])

    const [notes, setNotes] = useState<Note[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ title: '', content: '', color: palette[0] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadNotes = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error: fetchError } = await supabase
            .from('notes')
            .select('id,title,content,color,updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setNotes(data ?? [])
            setError(null)
        }
        setLoading(false)
    }, [supabase, user])

    useEffect(() => {
        if (!user) return
        loadNotes()
        const channel = supabase
            .channel(`notes-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes',
                    filter: `user_id=eq.${user.id}`,
                },
                () => loadNotes(),
            )
            .subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadNotes, supabase, user])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!user || !form.title.trim()) return

        if (editingId) {
            const { error: updateError } = await supabase
                .from('notes')
                .update({
                    title: form.title,
                    content: form.content,
                    color: form.color,
                })
                .eq('id', editingId)
                .eq('user_id', user.id)

            if (updateError) {
                setError(updateError.message)
                return
            }
            setEditingId(null)
            setForm({ title: '', content: '', color: palette[0] })
            loadNotes()
            return
        }

        const { error: insertError } = await supabase.from('notes').insert({
            title: form.title,
            content: form.content,
            color: form.color,
            user_id: user.id,
        })
        if (insertError) {
            setError(insertError.message)
            return
        }
        setForm({ title: '', content: '', color: palette[0] })
        loadNotes()
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        const { error: deleteError } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        if (deleteError) {
            setError(deleteError.message)
        }
        if (editingId === id) {
            setEditingId(null)
            setForm({ title: '', content: '', color: palette[0] })
        }
        loadNotes()
    }

    const startEdit = (note: Note) => {
        setEditingId(note.id)
        setForm({ title: note.title, content: note.content, color: note.color })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-semibold text-white"
                    >
                        Quản lý ghi chú
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Đồng bộ trực tiếp với Supabase, hỗ trợ thêm/sửa/xoá full CRUD.
                    </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zinc-500">
                    {notes.length} ghi chú
                </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <motion.form
                    onSubmit={handleSubmit}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Editor</p>
                            <h2 className="text-xl font-semibold text-white">
                                {editingId ? 'Cập nhật ghi chú' : 'Tạo ghi chú mới'}
                            </h2>
                        </div>
                        <NotebookPen className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="mt-5 space-y-4">
                        <label className="block text-sm text-zinc-300">
                            Tiêu đề
                            <input
                                type="text"
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                                value={form.title}
                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                            />
                        </label>
                        <label className="block text-sm text-zinc-300">
                            Nội dung
                            <textarea
                                className="mt-1 h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                                value={form.content}
                                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                            />
                        </label>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p>Màu thẻ</p>
                            <div className="flex flex-wrap gap-3">
                                {palette.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn(
                                            'h-8 w-8 rounded-full border-2 border-transparent transition',
                                            form.color === color && 'border-white',
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setForm((prev) => ({ ...prev, color }))}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                        >
                            {editingId ? 'Lưu cập nhật' : 'Thêm ghi chú'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null)
                                    setForm({ title: '', content: '', color: palette[0] })
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
                        <h2 className="text-lg font-semibold text-white">Danh sách</h2>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                            <WandSparkles className="h-3.5 w-3.5" />
                            <span>{loading ? 'Đang tải' : `${notes.length} mục`}</span>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {!loading && notes.length === 0 && (
                            <p className="col-span-full rounded-3xl border border-white/10 bg-black/30 py-6 text-center text-sm text-zinc-500">
                                Chưa có ghi chú nào.
                            </p>
                        )}
                        {notes.map((note) => (
                            <motion.article
                                key={note.id}
                                className="flex flex-col rounded-3xl border border-white/10 p-4"
                                style={{ background: `${note.color}15` }}
                                layout
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">{note.title}</p>
                                    <div className="flex gap-1">
                                        <button
                                            className="rounded-full px-2 py-1 text-xs text-zinc-200 hover:bg-white/20"
                                            type="button"
                                            onClick={() => startEdit(note)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="rounded-full px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                                            type="button"
                                            onClick={() => handleDelete(note.id)}
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-3 flex-1 text-sm text-zinc-200">{note.content}</p>
                                <div className="mt-4 text-xs text-zinc-500">
                                    Cập nhật:{' '}
                                    {new Date(note.updated_at).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                    })}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    )
}

export default NotePage
