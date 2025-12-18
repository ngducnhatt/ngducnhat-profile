import { supabase } from "@/lib/supabase/client";

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
	start: string;
	end: string;
};

export const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
        console.error("Error fetching projects:", JSON.stringify(error, null, 2));
        return [];
    }
    return data;
};

export const fetchWork = async () => {
    const { data, error } = await supabase.from("works").select("*");
    if (error) {
        console.error("Error fetching work experience:", JSON.stringify(error, null, 2));
        return [];
    }
    return data;
};
