'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { getSupabaseClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

const LoginPage = () => {
    const router = useRouter()
    const supabase = useMemo(() => getSupabaseClient(), [])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setStatus('loading')
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            setStatus('success')
            setMessage('Đăng nhập thành công')

            setTimeout(() => {
                router.push('/dashboard')
            }, 900)
        } catch (error) {
            setStatus('error')
            if (error instanceof Error) {
                setMessage(error.message)
            } else {
                setMessage('Không thể đăng nhập, thử lại nhé.')
            }
        }
    }

    const isDisabled = status === 'loading'

    const renderMessage = () => {
        const baseClass =
            'rounded-2xl border px-4 py-3 text-sm transition-colors duration-200 flex items-center'

        if (status === 'error') {
            return (
                <p
                    className={cn(
                        baseClass,
                        'border-red-500/30 bg-red-500/10 text-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100',
                    )}
                >
                    {message}
                </p>
            )
        }

        if (status === 'success') {
            return (
                <p
                    className={cn(
                        baseClass,
                        'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
                    )}
                >
                    {message}
                </p>
            )
        }

        return (
            <p className={cn(baseClass, 'border-zinc-800/60 bg-transparent text-zinc-400')}>
                {message}
            </p>
        )
    }

    return (
        <motion.main
            className="relative isolate overflow-hidden rounded-[40px] border border-zinc-900/60 bg-zinc-950/80 px-6 py-12 shadow-[0_30px_160px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-10 lg:px-14"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col justify-center gap-6">
                    <TextEffect
                        as="h1"
                        per="word"
                        preset="fade-in-blur"
                        className="text-4xl font-semibold leading-tight text-white md:text-5xl"
                    >
                        Ngducnhat
                    </TextEffect>
                    <Link href={'/'} className="text-base text-zinc-500">Về trang chủ</Link>
                </div>

                <motion.section
                    className="w-full max-w-md self-center rounded-[32px] border border-white/5 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white">Đăng nhập</h2>
                    </div>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <label className="block text-sm font-medium text-white">
                            Email
                            <div className="mt-1 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-white focus-within:ring-2 focus-within:ring-white/30">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="example@mail.com"
                                    className="h-12 w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
                                    required
                                    disabled={isDisabled}
                                />
                            </div>
                        </label>
                        <label className="block text-sm font-medium text-white">
                            Mật khẩu
                            <div className="mt-1 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-white focus-within:ring-2 focus-within:ring-white/30">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="******"
                                    className="h-12 w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
                                    required
                                    minLength={6}
                                    disabled={isDisabled}
                                />
                            </div>
                        </label>
                        <div className="flex items-center justify-between text-sm text-zinc-400">
                            <span></span>
                            <Link href="/" className="font-medium text-white hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isDisabled}
                                className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-base font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-400"
                            >
                                {isDisabled ? 'Đang xác thực…' : 'Đăng nhập'}
                            </button>
                            <div className="min-h-[56px]">
                                {message ? (
                                    renderMessage()
                                ) : (
                                    <div
                                        className="h-full rounded-2xl border border-transparent"
                                        aria-hidden
                                    />
                                )}
                            </div>
                        </div>
                    </form>
                </motion.section>
            </div>
        </motion.main>
    )
}

export default LoginPage
