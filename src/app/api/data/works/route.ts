import { NextResponse } from "next/server";
import { fetchWork } from "@/lib/data";

export async function GET() {
	try {
		const data = await fetchWork();
		return NextResponse.json(data);
	} catch (err) {
		console.error("Failed to fetch work experience:", err);
		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Failed to fetch work experience",
			},
			{ status: 500 },
		);
	}
}
