'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ComponentType } from 'react'

import {
    FileImage,
    KeyRound,
    LayoutDashboard,
    LogOut,
    MenuIcon,
    NotebookPen,
    ShieldCheck,
    Users2,
    X,
} from 'lucide-react'

import { Footer } from '@/app/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'

type NavItem = {
    label: string
    href: string
    icon: ComponentType<{ className?: string }>
    roles?: Array<'admin' | 'user'>
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Ghi chú', href: '/dashboard/note', icon: NotebookPen },
    { label: 'Tải ảnh', href: '/dashboard/image-upload', icon: FileImage },
    { label: 'Đổi mật khẩu', href: '/dashboard/change-password', icon: KeyRound },
    { label: '2FA', href: '/dashboard/2fa', icon: ShieldCheck, roles: ['admin'] },
    { label: 'Quản lý người dùng', href: '/dashboard/users', icon: Users2, roles: ['admin'] },
]

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, role, loading, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [loading, router, user])

    const filteredNav = useMemo(
        () => NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role ?? 'user')),
        [role],
    )

    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    if (loading || (!user && typeof window === 'undefined')) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 text-slate-700 dark:from-black dark:to-zinc-950 dark:text-slate-200">
                <span className="text-sm uppercase tracking-[0.5em] text-slate-500 dark:text-slate-500">
                    Đang tải...
                </span>
            </div>
        )
    }

    if (!user) return null

    const handleSignOut = async () => {
        await signOut()
        router.replace('/login')
    }

    const NavLinks = ({ isCollapsed, onNavigate }: { isCollapsed?: boolean; onNavigate?: () => void }) => (
        <nav className="flex-1 space-y-1">
            {filteredNav.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300/60 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-white',
                            active &&
                                'border-slate-500/60 bg-gradient-to-r from-slate-800/40 via-slate-700/20 to-transparent text-slate-900 shadow-[0_16px_60px_rgba(0,0,0,0.2)] dark:border-white/20 dark:from-white/10 dark:via-white/5 dark:text-white',
                            isCollapsed && 'justify-center gap-0',
                        )}
                        onClick={onNavigate}
                    >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                )
            })}
        </nav>
    )

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-slate-50">
            <AnimatePresence>
                {mobileNavOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                    >
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-black/90 px-4 py-5 shadow-2xl"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-white">{user.email}</p>
                                    <p className="text-xs text-slate-400">
                                        {role === 'admin' ? 'Quyền quản trị' : 'Không gian làm việc'}
                                    </p>
                                </div>
                                <button
                                    className="rounded-full border border-white/10 p-2 text-slate-400 hover:border-white/20 hover:text-white"
                                    onClick={() => setMobileNavOpen(false)}
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <NavLinks onNavigate={() => setMobileNavOpen(false)} />
                            <div className="mt-4 space-y-3">
                                <button
                                    onClick={handleSignOut}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
                                    type="button"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.aside
                animate={{ width: collapsed ? 88 : 272 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="relative hidden flex-col border-r border-slate-200/60 bg-gradient-to-b from-slate-100 via-white to-slate-200 px-4 py-6 text-slate-900 shadow-[inset_-1px_0_0_rgba(0,0,0,0.06)] dark:border-white/10 dark:from-black dark:via-neutral-950 dark:to-black dark:text-white md:flex"
            >
                <div className="mb-6 flex items-center justify-between">
                    {!collapsed && (
                        <div className="space-y-2">
                            <div className="text-2xl font-bold leading-none">ADMIN</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                    )}
                    <button
                        className={cn(
                            'flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/15 dark:text-slate-200 dark:hover:border-white/35 dark:hover:bg-white/10',
                            collapsed && 'mx-auto',
                        )}
                        onClick={() => setCollapsed((prev) => !prev)}
                        type="button"
                    >
                        <MenuIcon className="h-4 w-4" />
                        {!collapsed && <span>Menu</span>}
                    </button>
                </div>

                <div className={cn('mb-6 space-y-1', collapsed && 'items-center')}>
                    <NavLinks isCollapsed={collapsed} />
                </div>

                <div className="mt-auto space-y-3">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                        type="button"
                    >
                        <LogOut className="h-4 w-4" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </motion.aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 py-4 text-sm text-slate-700 backdrop-blur dark:border-white/5 dark:bg-white/5 dark:text-slate-300 md:px-6 md:py-5">
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 transition hover:border-slate-300 hover:bg-white/70 md:hidden dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:bg-white/10"
                            onClick={() => setMobileNavOpen(true)}
                            type="button"
                        >
                            <MenuIcon className="h-4 w-4" />
                            <span>Menu</span>
                        </button>
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">
                                Xin chào
                            </p>
                            <p className="text-lg font-semibold text-black dark:text-white">{user.email}</p>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-black dark:via-zinc-950 dark:to-black">
                    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
                </main>
                <div className="bg-white/80 dark:bg-black/60">
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
