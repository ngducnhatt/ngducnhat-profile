type Project = {
	name: string;
	description: string;
	link: string;
	video: string;
	id: string;
};

type WorkExperience = {
	company: string;
	title: string;
	start: string;
	end: string;
	link: string;
	id: string;
};


type SocialLink = {
	label: string;
	link: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
	{
		label: "Github",
		link: "https://github.com/ngducnhatt",
	},
	{
		label: "LinkedIn",
		link: "#",
	},
	{
		label: "Facebook",
		link: "#",
	},
];

export const EMAIL = "nhaatjisme@gmail.com";
