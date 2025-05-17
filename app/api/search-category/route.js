import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/";
const API_Key = process.env.GOOGLE_API;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const radius = searchParams.get("radius");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const res = await fetch(
    `${BASE_URL}textsearch/json?query=${category}&location=${lat},${lng}&radius=${radius}&key=${API_Key}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const product = await res.json();
  return NextResponse.json({ product });
}
