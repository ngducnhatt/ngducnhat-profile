"use client";
import { Spotlight } from "@/components/motion-primitives/spotlight";
import { useEffect, useState } from "react";
import { Work } from "@/lib/data";
import { motion } from "framer-motion";

type Props = {
	variants: any;
	transition: any;
};

export default function WorkExperienceSection({ variants, transition }: Props) {
	const [works, setWork] = useState<Work[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const getWork = async () => {
			try {
				const res = await fetch("/api/data/works");
				if (!res.ok) {
					const errorData = await res.json();
					setError(
						errorData.error || "Failed to load work experience",
					);
					return;
				}
				const data = (await res.json()) as Work[];
				if (data && data.length > 0) {
					const sortedData = data.sort((a, b) => a.id - b.id);
					setWork(sortedData);
				}
			} catch (err) {
				console.error("Failed to load work experience:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to load work experience",
				);
			}
		};
		getWork();
	}, []);

	return (
		<motion.section variants={variants} transition={transition}>
			<h3 className="mb-5 text-lg font-medium">Work Experience</h3>
			{error && (
				<div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
					{error}
				</div>
			)}
			<div className="flex flex-col space-y-2">
				{works?.map((job: Work) => (
					<a
						key={job.id}
						href={job.link}
						target="_blank"
						rel="noopener noreferrer"
						className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-px dark:bg-zinc-600/30">
						<Spotlight size={64} />
						<div className="relative rounded-[15px] bg-white p-4 dark:bg-zinc-950">
							<div className="flex justify-between">
								<div>
									<h4 className="dark:text-zinc-100">
										{job.title}
									</h4>
									<p className="text-zinc-500 dark:text-zinc-400">
										{job.company}
									</p>
								</div>
								<p className="text-zinc-600 dark:text-zinc-400">
									{job.start} - {job.end}
								</p>
							</div>
						</div>
					</a>
				))}
			</div>
		</motion.section>
	);
}
