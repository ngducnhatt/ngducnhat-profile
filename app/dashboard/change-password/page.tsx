'use client'

import { motion } from 'motion/react'
import { FormEvent, useState } from 'react'

import { Lock } from 'lucide-react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { useAuth } from '@/components/providers/auth-provider'
import { getSupabaseClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

const ChangePasswordPage = () => {
    const { user } = useAuth()
    const supabase = getSupabaseClient()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (newPassword !== confirmPassword) {
            setStatus('error')
            setMessage('Mật khẩu mới không khớp.')
            return
        }
        if (newPassword.length < 6) {
            setStatus('error')
            setMessage('Mật khẩu phải lớn hơn 6 kí tự.')
            return
        }

        if (!user?.email) {
            setStatus('error')
            setMessage('Không tìm thấy tài khoản hiện tại.')
            return
        }

        try {
            setStatus('loading')
            setMessage('Đang cập nhật mật khẩu…')

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                throw new Error('Mật khẩu hiện tại không đúng.')
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) {
                throw error
            }

            setStatus('success')
            setMessage('Đổi mật khẩu thành công!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            setStatus('error')
            setMessage(error instanceof Error ? error.message : 'Không thể đổi mật khẩu.')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-3xl font-semibold text-white"
                    >
                        Đổi mật khẩu
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Bảo mật tài khoản Supabase Auth trực tiếp từ dashboard.
                    </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-zinc-500">
                    {user?.email}
                </span>
            </div>

            <motion.form
                className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-zinc-400" />
                    <h2 className="text-lg font-semibold text-white">Thông tin mật khẩu</h2>
                </div>
                <div className="mt-6 space-y-4 text-sm text-zinc-300">
                    <label className="block">
                        Mật khẩu hiện tại
                        <input
                            type="password"
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            placeholder="••••••"
                            required
                        />
                    </label>
                    <label className="block">
                        Mật khẩu mới
                        <input
                            type="password"
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="••••••"
                            required
                        />
                    </label>
                    <label className="block">
                        Nhập lại mật khẩu
                        <input
                            type="password"
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="••••••"
                            required
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white py-3 text-base font-semibold text-zinc-900 transition hover:bg-zinc-100"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
                </button>
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
        </div>
    )
}

export default ChangePasswordPage
