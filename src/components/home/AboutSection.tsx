"use client";
import { motion } from "framer-motion";

type Props = {
	variants: any;
	transition: any;
};

export default function AboutSection({ variants, transition }: Props) {
	return (
		<motion.section variants={variants} transition={transition}>
			<div className="flex-1">
				<ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
					<li className="flex items-start gap-2">
						<span className="mt-0.5">-</span>
						<span>
							I specialize in web development technologies,
							including JavaScript, React, and more.
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-0.5">-</span>
						<span>
							I'm continuously expanding my knowledge in both
							Frontend and Backend technologies.
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-0.5">-</span>
						<span>
							I actively create and manage Discord-related
							projects, such as bots, servers, and applications.
						</span>
					</li>
				</ul>
			</div>
		</motion.section>
	);
}
