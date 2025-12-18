"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
import { Tilt } from "@/components/motion-primitives/tilt";

export function Spotify() {
	const { data, error, isLoading } = useSWR("/api/now-playing", fetcher, {
		refreshInterval: 5000,
	});

	if (error) return <div>Failed to load Spotify data</div>;
	if (isLoading) return <div>Loading Spotify data...</div>;

	if (!data || (!data.isPlaying && !data.uri)) {
		return <div>Not playing anything on Spotify</div>;
	}

	const spotifyEmbedUrl = `https://open.spotify.com/embed/track/${data.uri.split(":").pop()}?utm_source=generator&theme=0`;

	return (
		<Tilt rotationFactor={3} isRevese>
			<div className=" rounded-3xl overflow-hidden flex  flex-col items-center justify-center space-y-4">
				<iframe
					src={spotifyEmbedUrl}
					width="100%"
					height="152"
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Spotify Player"></iframe>
			</div>
		</Tilt>
	);
}
