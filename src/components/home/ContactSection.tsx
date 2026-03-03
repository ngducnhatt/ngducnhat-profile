"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useSiteInfo() {
	return useSWR<{
		email: string;
		social_links: { label: string; link: string }[];
	}>("/api/data/site", fetcher);
}
import { Magnetic } from "@/components/motion-primitives/magnetic";

function SocialLink({ label, link }: { label: string; link: string }) {
	return (
		<Magnetic intensity={0.3}>
			<a
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				className="rounded-full bg-zinc-100 px-2.5 py-1 text-sm dark:bg-zinc-800">
				{label}
			</a>
		</Magnetic>
	);
}

export default function ContactSection({
	variants,
	transition,
}: {
	variants: any;
	transition: any;
}) {
	const { data, error } = useSiteInfo();
	const [copied, setCopied] = useState(false);

	const copyEmail = async () => {
		if (!data?.email) return;
		try {
			await navigator.clipboard.writeText(data.email);
			setCopied(true);
		} catch {}
	};

	useEffect(() => {
		if (!copied) return;
		const t = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(t);
	}, [copied]);

	return (
		<motion.section variants={variants} transition={transition}>
			<h3 className="mb-5 text-lg font-medium">Contact</h3>
			<p className="mb-5 text-zinc-600 dark:text-zinc-400">
				Mail to me{" "}
				<button onClick={copyEmail} className="underline">
					{data?.email}
				</button>
				{copied && (
					<span className="ml-2 rounded-full bg-zinc-200 px-2 py-1 text-xs">
						Copied
					</span>
				)}
			</p>
			<div className="flex gap-3">
				{data?.social_links.map((s) => (
					<SocialLink key={s.label} {...s} />
				))}
			</div>
		</motion.section>
	);
}
