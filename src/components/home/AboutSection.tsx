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
							I am a Web Developer focused on website interface design, application security, and user experience. I build web applications with modern interfaces, high performance, good scalability, and maintainable code.
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-0.5">-</span>
						<span>
							I have experience working across different parts of web systems, from interface design and user experience optimization (UI/UX) to backend development, API development, database integration, and system deployment.
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-0.5">-</span>
						<span>
							The technologies I mainly use include: Next.js, React, Tailwind CSS, and Node.js.
                            <br />I also work with both SQL and NoSQL databases, including: MySQL, Supabase, Neon Database, and MongoDB.
						</span>
					</li>
				</ul>
			</div>
		</motion.section>
	);
}
