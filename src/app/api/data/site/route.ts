import { NextResponse } from "next/server";
import { fetchSiteInfo } from "@/lib/data";

export async function GET() {
	try {
		const data = await fetchSiteInfo();
		return NextResponse.json(data);
	} catch (err) {
		console.error("Failed to fetch site info:", err);
		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Failed to fetch site info",
			},
			{ status: 500 },
		);
	}
}
