import { NextResponse } from "next/server";
import { fetchProjects } from "@/lib/data";

export async function GET() {
	try {
		const data = await fetchProjects();
		return NextResponse.json(data);
	} catch (err) {
		console.error("Failed to fetch projects:", err);
		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Failed to fetch projects",
			},
			{ status: 500 },
		);
	}
}
