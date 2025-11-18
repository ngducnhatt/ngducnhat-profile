import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'

import { Footer } from './footer'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#ffffff',
}

export const metadata: Metadata = {
    metadataBase: new URL('https://example.com'),
    alternates: {
        canonical: '/',
    },
    title: {
        default: 'Ngducnhat - Portfolio',
        template: '%s | Ngducnhat',
    },
    description: 'Ngducnhat is a web developer.',
}

const geist = Geist({
    variable: '--font-geist',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-zinc-950`}
            >
                <ThemeProvider
                    enableSystem={true}
                    attribute="class"
                    storageKey="theme"
                    defaultTheme="system"
                >
                    <AuthProvider>
                        <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-inter-tight)] bg-white dark:bg-zinc-950">
                            <main className="flex-1">{children}</main>
                            <div className="mx-auto w-full max-w-screen-2xl px-4 pb-12 pt-16">
                                <Footer />
                            </div>
                        </div>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout
