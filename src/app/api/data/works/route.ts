import { fetchWork } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const works = await fetchWork();
		return NextResponse.json(works, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
			},
		});
	} catch (err) {
		return NextResponse.json({ error: "Failed to fetch works" }, { status: 500 });
	}
}
