import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'

// import { Footer } from './footer'
import './globals.css'

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
        default: 'Nguyen Duc Nhat - Portfolio',
        template: '%s | Nguyen Duc Nhat',
    },
    description: 'Nguyen Duc Nhat is a web developer.',
    icons: {
        icon: '/logo.svg',
        shortcut: '/logo.png',
        apple: '/logo.png',
    }
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
                    <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-geist)] bg-white dark:bg-zinc-950">
                        <main className="flex-grow ">{children}</main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout
