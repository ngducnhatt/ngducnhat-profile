import { fetchSiteInfo } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const info = await fetchSiteInfo();
		return NextResponse.json(info, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
			},
		});
	} catch (err) {
		return NextResponse.json({ error: "Failed to fetch site info" }, { status: 500 });
	}
}
