"use client";
import AboutSection from "@/components/home/AboutSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import WorkExperienceSection from "@/components/home/WorkExperienceSection";
import ContactSection from "@/components/home/ContactSection";
import SpotifySection from "@/components/home/SpotifySection";
import { motion } from "framer-motion";

const VARIANTS_SECTION = {
	hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
	visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const TRANSITION_SECTION = { duration: 0.3 };

const VARIANTS_CONTAINER = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
	return (
		<motion.main
			className="mx-auto flex max-w-3xl flex-col space-y-24"
			variants={VARIANTS_CONTAINER}
			initial="hidden"
			animate="visible">
			<AboutSection
				variants={VARIANTS_SECTION}
				transition={TRANSITION_SECTION}
			/>
			<ProjectsSection
				variants={VARIANTS_SECTION}
				transition={TRANSITION_SECTION}
			/>
			<WorkExperienceSection
				variants={VARIANTS_SECTION}
				transition={TRANSITION_SECTION}
			/>
			<ContactSection
				variants={VARIANTS_SECTION}
				transition={TRANSITION_SECTION}
			/>
			<SpotifySection
				variants={VARIANTS_SECTION}
				transition={TRANSITION_SECTION}
			/>
		</motion.main>
	);
}
