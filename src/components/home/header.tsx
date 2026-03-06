"use client";
import Link from "next/link";
import Image from "next/image";
import { TextLoop } from "@/components/motion-primitives/text-loop";

/**
 * Header trang chủ Portfolio.
 * Logo đã được chuyển sang dạng VUÔNG.
 */
export function Header() {
	return (
		<header className="mb-8 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Link href="/">
					{/* Logo VUÔNG */}
					<Image src="/logo.svg" alt="Logo" width={48} height={48} className="rounded-none shadow-lg" />
				</Link>
				<div>
					<Link
						href="/"
						className="font-bold text-black dark:text-white text-lg leading-tight">
						Nguyen Duc Nhat
					</Link>
					<br />
					<TextLoop
						className="text-zinc-600 dark:text-zinc-500 text-sm"
						transition={{
							type: "spring",
							stiffness: 900,
							damping: 80,
							mass: 10,
						}}
						variants={{
							initial: {
								y: 20,
								rotateX: 90,
								opacity: 0,
								filter: "blur(4px)",
							},
							animate: {
								y: 0,
								rotateX: 0,
								opacity: 1,
								filter: "blur(0px)",
							},
							exit: {
								y: -20,
								rotateX: -90,
								opacity: 0,
								filter: "blur(4px)",
							},
						}}>
						<span>chilling</span>
						<span>coding</span>
						<span>zzz</span>
					</TextLoop>
				</div>
			</div>
		</header>
	);
}
