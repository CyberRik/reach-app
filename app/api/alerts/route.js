import { NextResponse } from "next/server";
//eventDataFormatting
function formatEventdata({id,event_code,event_type,alert_lat,alert_lng,address,responder_lat,responder_lng,volunteers,responders,status_message,updates,smart_tech_data,starred_media,regular_media}){
return {
    "results":[{
        "id":id,
        "event_code":event_code,
        "event_type":event_type,
        "geometry":{"location":{"lat":alert_lat,"lng":alert_lng}},
        "assigned":{
            "volunteers":volunteers ||{
            "basic":[""],
            "Intermediate":[""],
            "Advanced":[""]},
            "responders":responders || [""]
        },
        "status_message":status_message || "",
        "updates":updates || [{"headline":"","description":""}],
        "smart_tech_data":smart_tech_data || {"heart_rate":"","SpO2":"","temperature":""},
        "Media":{"starred":starred_media || "","regular":regular_media || [""]}
    }]
}}

export async function GET(request){
    const {searchParams}= new URL(request.url)
    const category = searchParams.get("category");
    const Medicalevent1= formatEventdata({id:45,event_code:"CVX",event_type:"Cardiac Event",alert_lat:38.625196855855506,alert_lng:-90.115183317234})
    const Fireevent1= formatEventdata({id:47,event_code:"F1V",event_type:"Fire Hazard",alert_lat:38.605196855855506,alert_lng:-90.015183317234})
    const Crimeevent1= formatEventdata({id:40,event_code:"RR",event_type:"Burgalry",alert_lat:38.925196855855506,alert_lng:-90.125183317234})
    const MasterOfAlerts={
        "Medical":{
            "product":{"results":[Medicalevent1.results[0]]}},
        "Fire":{
            "product":{"results":[Fireevent1.results[0]]}},
        "Crime":{
            "product":{"results":[Crimeevent1.results[0]]}}
    }
    return NextResponse.json(MasterOfAlerts[category])
}