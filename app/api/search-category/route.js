import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/";
const API_Key = process.env.GOOGLE_API;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const radius = searchParams.get("radius");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!category || !radius || !lat || !lng) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${BASE_URL}textsearch/json?query=${category}&location=${lat},${lng}&radius=${radius}&key=${API_Key}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`API call failed with status: ${res.status}`);
    }

    const product = await res.json();

    if (product.status !== "OK") {
      return NextResponse.json({ error: product.error_message || "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error("Error fetching places data:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
