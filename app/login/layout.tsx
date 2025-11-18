import type { ReactNode } from 'react'

const SiteLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative mx-auto w-full max-w-screen-md px-4 pt-20">
            {children}
        </div>
    )
}

export default SiteLayout
