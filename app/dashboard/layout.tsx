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
} from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'

type NavItem = {
    label: string
    href: string
    icon: ComponentType<{ className?: string }>
    roles?: Array<'admin' | 'user'>
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Tổng quan',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Note',
        href: '/dashboard/note',
        icon: NotebookPen,
    },
    {
        label: 'Upload image',
        href: '/dashboard/image-upload',
        icon: FileImage,
    },
    {
        label: 'Đổi mật khẩu',
        href: '/dashboard/change-password',
        icon: KeyRound,
    },
    {
        label: '2FA',
        href: '/dashboard/2fa',
        icon: ShieldCheck,
        roles: ['admin'],
    },
    {
        label: 'Quản lý người dùng',
        href: '/dashboard/users',
        icon: Users2,
        roles: ['admin'],
    },
]

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, role, loading, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [loading, router, user])

    const filteredNav = useMemo(() => {
        return NAV_ITEMS.filter((item) => {
            if (!item.roles) return true
            return item.roles.includes(role ?? 'user')
        })
    }, [role])

    if (loading || (!user && typeof window === 'undefined')) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950 text-zinc-200">
                <span className="text-sm uppercase tracking-[0.5em] text-zinc-500">Đang tải…</span>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const handleSignOut = async () => {
        await signOut()
        router.replace('/login')
    }

    return (
        <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-50">
            <motion.aside
                animate={{ width: collapsed ? 88 : 272 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="relative flex flex-col border-r border-white/5 bg-black/30 px-4 py-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]"
            >
                <button
                    className="mb-6 flex items-center gap-3 rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-zinc-400"
                    onClick={() => setCollapsed((prev) => !prev)}
                    type="button"
                >
                    <MenuIcon className="h-4 w-4" />
                    <span className={cn(collapsed && 'hidden')}>Menu</span>
                </button>

                <div className={cn('mb-8 space-y-1', collapsed && 'items-center')}>

                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.p
                                key="user-email"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="text-base font-semibold text-white"
                            >
                                {user.email}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    {!collapsed && (
                        <p className="text-xs text-zinc-500">
                            {role === 'admin' ? 'Admin control' : 'Member workspace'}
                        </p>
                    )}
                </div>

                <nav className="flex-1 space-y-1">
                    {filteredNav.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm text-zinc-400 transition hover:border-white/10 hover:text-white',
                                    active && 'border-white/10 bg-white/5 text-white',
                                    collapsed && 'justify-center gap-0',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
                        type="button"
                    >
                        <LogOut className="h-4 w-4" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </motion.aside>

            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-5 text-sm text-zinc-300 backdrop-blur">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Xin chào</p>
                        <p className="text-lg font-semibold text-white">{user.email}</p>
                    </div>

                </header>
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-black">
                    <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
