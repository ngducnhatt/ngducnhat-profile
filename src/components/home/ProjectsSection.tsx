"use client";
import {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContent,
	MorphingDialogTitle,
	MorphingDialogImage,
	MorphingDialogSubtitle,
	MorphingDialogClose,
	MorphingDialogDescription,
	MorphingDialogContainer,
} from "@/components/motion-primitives/morphing-dialog";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Project } from "@/lib/data";

type Props = {
	variants: any;
	transition: any;
};

export default function ProjectsSection({ variants, transition }: Props) {
	const [projects, setProjects] = useState<Project[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const getProjects = async () => {
			try {
				const res = await fetch("/api/data/projects");
				if (!res.ok) {
					const errorData = await res.json();
					setError(errorData.error || "Failed to load projects");
					return;
				}
				const data = (await res.json()) as Project[];
				if (data && data.length > 0) {
					const sortedData = data.sort((a, b) => a.id - b.id);
					setProjects(sortedData);
				}
			} catch (err) {
				console.error("Failed to load projects:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to load projects",
				);
			}
		};
		getProjects();
	}, []);

	return (
		<motion.section variants={variants} transition={transition}>
			<h3 className="mb-5 text-lg font-medium">Project</h3>
			{error && (
				<div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
					{error}
				</div>
			)}
			<div className="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 sm:justify-items-start">
				{projects?.map((project: Project) => (
					<MorphingDialog
						key={project.id}
						transition={{
							type: "spring",
							bounce: 0.05,
							duration: 0.25,
						}}>
						<MorphingDialogTrigger
							style={{
								borderRadius: "12px",
							}}
							className="flex max-w-67.5 flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
							<MorphingDialogImage
								src={project.image_url}
								alt={project.name}
								className="h-48 w-full object-cover"
							/>
							<div className="flex grow flex-row items-end justify-between px-3 py-2">
								<div>
									<MorphingDialogTitle className="text-zinc-950 dark:text-zinc-50 text-">
										{project.name}
									</MorphingDialogTitle>
								</div>
							</div>
						</MorphingDialogTrigger>
						<MorphingDialogContainer>
							<MorphingDialogContent
								style={{
									borderRadius: "24px",
								}}
								className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-125">
								<MorphingDialogImage
									src={project.image_url}
									alt={project.name}
									className="h-full w-full"
								/>
								<div className="p-6">
									<MorphingDialogTitle className="text-2xl text-zinc-950 dark:text-zinc-50">
										{project.name}
									</MorphingDialogTitle>
									<MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
										{project.description}
									</MorphingDialogSubtitle>
									<MorphingDialogDescription
										disableLayoutAnimation
										variants={{
											initial: {
												opacity: 0,
												scale: 0.8,
												y: 100,
											},
											animate: {
												opacity: 1,
												scale: 1,
												y: 0,
											},
											exit: {
												opacity: 0,
												scale: 0.8,
												y: 100,
											},
										}}>
										<a
											className="mt-2 inline-flex text-zinc-500 underline"
											href={project.project_url}
											target="_blank"
											rel="noopener noreferrer">
											{project.project_url}
										</a>
									</MorphingDialogDescription>
								</div>
								<MorphingDialogClose className="text-zinc-50" />
							</MorphingDialogContent>
						</MorphingDialogContainer>
					</MorphingDialog>
				))}
			</div>
		</motion.section>
	);
}
