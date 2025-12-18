"use client";
import Link from "next/link";

import { TextLoop } from "@/components/motion-primitives/text-loop";

export function Header() {
	return (
		<header className="mb-8 flex items-center justify-between">
			<div>
				<Link
					href="/"
					className="font-medium text-black dark:text-white">
					Nguyen Duc Nhat
				</Link>
				<br />
				<TextLoop
					className="text-zinc-600 dark:text-zinc-500"
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
		</header>
	);
}
