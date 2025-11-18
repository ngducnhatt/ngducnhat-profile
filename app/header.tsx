'use client'
import Link from 'next/link'

import { TextEffect } from '@/components/motion-primitives/text-effect'

export function Header() {
    return (
        <header className="mb-8 flex items-center justify-between">
            <div>
                <Link href="/" className="font-medium text-black dark:text-white">
                    Ngducnhat
                </Link>
                <TextEffect
                    as="p"
                    preset="fade"
                    per="char"
                    className="text-zinc-600 dark:text-zinc-500"
                    delay={0.5}
                >
                    Dev & Sec
                </TextEffect>
            </div>
        </header>
    )
}
