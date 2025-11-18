type Project = {
    name: string
    description: string
    link: string
    video: string
    id: string
}

type WorkExperience = {
    company: string
    title: string
    start: string
    end: string
    link: string
    id: string
}

type BlogPost = {
    title: string
    description: string
    link: string
    uid: string
}

type SocialLink = {
    label: string
    link: string
}

export const PROJECTS: Project[] = [
    {
        name: 'Alune  - Discord Bot',
        description:
            'Showing champion details and random champion by roles in League of Legends.',
        link: '#',
        video: '#',
        id: 'project1',
    },
    {
        name: 'Personal Website',
        description: 'Notes, Short Url, 2fa Authenticator',
        link: '#',
        video: '#',
        id: 'project2',
    },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
    {
        company: 'Viettel Cyber Security',
        title: 'Intern - Web Security',
        start: '2022',
        end: '2023',
        link: 'https://viettelsecurity.com/vi/',
        id: 'work1',
    },
    {
        company: 'Viettel Network',
        title: 'Intern - Web Developer',
        start: '2023',
        end: '2024',
        link: '#',
        id: 'work2',
    },
    {
        company: 'Freelance',
        title: 'Web Developer',
        start: '2019',
        end: 'Present',
        link: '#',
        id: 'work3',
    },
]

export const BLOG_POSTS: BlogPost[] = [
    {
        title: 'Exploring the Intersection of Design, AI, and Design Engineering',
        description: 'How AI is changing the way we design',
        link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
        uid: 'blog-1',
    },
    {
        title: 'Why I left my job to start my own company',
        description:
            'A deep dive into my decision to leave my job and start my own company',
        link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
        uid: 'blog-2',
    },
    {
        title: 'What I learned from my first year of freelancing',
        description: 'A look back at my first year of freelancing and what I learned',
        link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
        uid: 'blog-3',
    },
    {
        title: 'How to Export Metadata from MDX for Next.js SEO',
        description:
            'A guide on exporting metadata from MDX files to leverage Next.js SEO features.',
        link: '/blog/example-mdx-metadata',
        uid: 'blog-4',
    },
]

export const SOCIAL_LINKS: SocialLink[] = [
    {
        label: 'Github',
        link: 'https://github.com/ngducnhatt',
    },
    {
        label: 'LinkedIn',
        link: '#',
    },
    {
        label: 'Facebook',
        link: '#',
    },
]

export const EMAIL = 'nhaatjisme@gmail.com'
