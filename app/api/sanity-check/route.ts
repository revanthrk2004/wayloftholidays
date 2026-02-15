import { NextResponse } from "next/server";
import { getHomeData } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

  let home: any = null;
  let error: any = null;

  try {
    home = await getHomeData();
  } catch (e: any) {
    error = e?.message || String(e);
  }

  return NextResponse.json({
    env: { projectId, dataset, apiVersion },
    hasHome: !!home,
    homePreview: home
      ? {
          heroTitle: home.heroTitle,
          heroSubtitle: home.heroSubtitle,
          tripsCount: home.trips?.length ?? 0,
        }
      : null,
    error,
  });
}
