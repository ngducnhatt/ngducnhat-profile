'use client'

import { motion } from 'motion/react'
import { FormEvent, useMemo, useState } from 'react'

import { UsersRound } from 'lucide-react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'

type ManagedUser = {
    id: string
    email: string
    role: 'admin' | 'user'
    status: 'active' | 'invited' | 'blocked'
}

const UsersPage = () => {
    const { role } = useAuth()
    const [users, setUsers] = useState<ManagedUser[]>([
        { id: '1', email: 'ngducnhat@admin.com', role: 'admin', status: 'active' },
        { id: '2', email: 'user@example.com', role: 'user', status: 'active' },
    ])
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ email: '', role: 'user' as 'admin' | 'user', status: 'active' as ManagedUser['status'] })

    const filteredUsers = useMemo(() => {
        return users.filter((user) => user.email.toLowerCase().includes(search.toLowerCase()))
    }, [search, users])

    if (role !== 'admin') {
        return (
            <div className="rounded-[32px] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-100">
                Chức năng này chỉ dành cho admin.
            </div>
        )
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!form.email) return

        if (editingId) {
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === editingId ? { ...user, ...form } : user,
                ),
            )
            setEditingId(null)
        } else {
            setUsers((prev) => [
                { id: crypto.randomUUID(), email: form.email, role: form.role, status: form.status },
                ...prev,
            ])
        }
        setForm({ email: '', role: 'user', status: 'active' })
    }

    const handleEdit = (user: ManagedUser) => {
        setEditingId(user.id)
        setForm({ email: user.email, role: user.role, status: user.status })
    }

    const handleDelete = (id: string) => {
        setUsers((prev) => prev.filter((user) => user.id !== id))
        if (editingId === id) {
            setEditingId(null)
            setForm({ email: '', role: 'user', status: 'active' })
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-semibold text-white"
                    >
                        Quản lý người dùng
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        CRUD đầy đủ: tạo mới, chỉnh sửa quyền và trạng thái tài khoản.
                    </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-zinc-500">
                    {users.length} tài khoản
                </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <motion.form
                    onSubmit={handleSubmit}
                    className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <UsersRound className="h-5 w-5 text-zinc-400" />
                        <h2 className="text-lg font-semibold text-white">
                            {editingId ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                        </h2>
                    </div>
                    <div className="mt-6 space-y-4 text-sm text-zinc-200">
                        <label className="block">
                            Email
                            <input
                                type="email"
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
                                value={form.email}
                                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                placeholder="user@example.com"
                                required
                            />
                        </label>
                        <label className="block">
                            Vai trò
                            <select
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                                value={form.role}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, role: event.target.value as 'admin' | 'user' }))
                                }
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                        <label className="block">
                            Trạng thái
                            <select
                                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                                value={form.status}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: event.target.value as ManagedUser['status'],
                                    }))
                                }
                            >
                                <option value="active">Active</option>
                                <option value="invited">Invited</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </label>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                        >
                            {editingId ? 'Lưu' : 'Thêm người dùng'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition hover:border-white/40"
                                onClick={() => {
                                    setEditingId(null)
                                    setForm({ email: '', role: 'user', status: 'active' })
                                }}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </motion.form>

                <motion.section
                    className="rounded-[32px] border border-white/10 bg-black/40 p-6 backdrop-blur"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-white">Danh sách</h2>
                        <input
                            type="text"
                            placeholder="Tìm theo email…"
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none sm:w-64"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <div className="mt-6 space-y-3">
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                                layout
                            >
                                <div>
                                    <p className="font-semibold">{user.email}</p>
                                    <p className="text-xs text-zinc-400">
                                        {user.role.toUpperCase()} • {user.status}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200 transition hover:border-white/30"
                                        type="button"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="rounded-full border border-red-500/50 px-3 py-1 text-xs text-red-200 transition hover:bg-red-500/10"
                                        type="button"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Xoá
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {!filteredUsers.length && (
                            <p className="rounded-3xl border border-white/10 bg-black/40 py-6 text-center text-sm text-zinc-400">
                                Không tìm thấy người dùng phù hợp.
                            </p>
                        )}
                    </div>
                </motion.section>
            </div>
        </div>
    )
}

export default UsersPage
