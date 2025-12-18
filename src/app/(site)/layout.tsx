import type { ReactNode } from 'react'

import { Footer } from '@/components/home/footer'
import { Header } from '@/components/home/header'

const SiteLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pt-16">
            <Header />
            <div className="flex-1 w-full">{children}</div>
            <Footer />
        </div>
    )
}

export default SiteLayout
