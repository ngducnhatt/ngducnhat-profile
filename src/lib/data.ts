import { get } from "@vercel/edge-config";

export type Project = {
	id: number;
	name: string;
	description: string;
	image_url: string;
	project_url: string;
};

export type Work = {
	id: number;
	title: string;
	company: string;
	link: string;
	start: string | number;
	end: string | number;
};

export type SocialLink = {
	label: string;
	link: string;
};

export type SiteInfo = {
	email: string;
	social_links: SocialLink[];
};

/**
 * Fetch projects from Edge Config (server-side only)
 * Used by /api/projects route
 */
export const fetchProjects = async (): Promise<Project[]> => {
	if (!process.env.EDGE_CONFIG) {
		throw new Error("EDGE_CONFIG environment variable not set");
	}
	try {
		const data = await get<Project[]>("projects");
		return data ?? [];
	} catch (err) {
		console.error("Error reading projects from Edge Config:", err);
		throw err;
	}
};

/**
 * Fetch work experience from Edge Config (server-side only)
 * Used by /api/works route
 */
export const fetchWork = async (): Promise<Work[]> => {
	if (!process.env.EDGE_CONFIG) {
		throw new Error("EDGE_CONFIG environment variable not set");
	}
	try {
		const data = await get<Work[]>("works");
		return data ?? [];
	} catch (err) {
		console.error("Error reading works from Edge Config:", err);
		throw err;
	}
};

export const fetchSiteInfo = async (): Promise<SiteInfo> => {
	if (!process.env.EDGE_CONFIG) {
		throw new Error("EDGE_CONFIG environment variable not set");
	}
	try {
		const email = await get<string>("email");
		const social_links = await get<SocialLink[]>("social_links");
		return {
			email: email ?? "",
			social_links: social_links ?? [],
		};
	} catch (err) {
		console.error("Error reading site info from Edge Config:", err);
		throw err;
	}
};
