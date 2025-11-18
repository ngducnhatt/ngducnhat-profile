import type { ReactNode } from 'react'

import { Header } from '@/app/header'

const SiteLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative mx-auto w-full max-w-screen-md px-4 pt-20">
            <Header />
            {children}
        </div>
    )
}

export default SiteLayout
