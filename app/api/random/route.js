import { NextResponse } from "next/server";

function getrandomlat(lat,rad){
    lat=Number(lat)
    rad=rad/21300
    return Number(lat-rad+(Math.random()*(rad)*2))
}

function getrandomlng(lng,rad){
    lng=Number(lng)
    rad=rad/21300
    return Number(lng-rad+(Math.random()*(rad)*2))
}

function createformatteddict(computed_lat,computed_lng){
    return {"geometry":{"location":{"lat":computed_lat,"lng":computed_lng}}}
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const radius = Number(searchParams.get("radius"))
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))

  const noofplaces=40+Math.round((Math.random()*20))
  const product={
    "results":
        []
  }
  for(let i=0;i<noofplaces;i+=1){
    const Location_lat = getrandomlat(lat, radius);
    const Location_lng = getrandomlng(lng, radius);
    product["results"].push(createformatteddict(Location_lat,Location_lng))
  }

  return NextResponse.json({ product });
}