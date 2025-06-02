import { NextResponse } from "next/server";
//eventDataFormatting
function formatEventdata({id,event_code,event_type, /* Remove report_time */ category,alert_lat,alert_lng,address,responder_lat,responder_lng,volunteers,responders,status_message,updates,smart_tech_data,starred_media,regular_media, reportedAt /* Add reportedAt */}){
// Define the mock updates data to be used as a default
const defaultMockUpdates = [
    { headline: "Volunteer Arrived at Scene", description: "Volunteer #1234 is assisting with CPR. Defibrillator still needed.", time: new Date(Date.now() - 7 * 60 * 1000) }, // Approx 7 minutes ago
    { headline: "ETA Confirmed for Ambulance", description: "Ambulance WGN-2021 & 5 minutes away. Team ready for defibrillator use.", time: new Date(Date.now() - 6 * 60 * 1000) }, // Approx 6 minutes ago
    { headline: "Defibrillator En Route", description: "Volunteer #22 picked up a defibrillator from the nearest facility, ETA 3 minutes.", time: new Date(Date.now() - 5 * 60 * 1000) }, // Approx 5 minutes ago
    { headline: "Condition Update", description: "Patient's pulse is weak. First responders recommend additional oxygen support.", time: new Date(Date.now() - 4 * 60 * 1000) }, // Approx 4 minutes ago
    { headline: "Additional Medical Supplies Needed", description: "Oxygen mask and kit required urgently. Volunteer #12 coordinating with nearby clinic.", time: new Date(Date.now() - 3 * 60 * 1000) }, // Approx 3 minutes ago
];

// Define the mock media data to be used as a default
const defaultMockMedia = {
    starred: "/Starred_media.png",
    regular: ["/media 1.png", "/media 2.png", "/media 3.png"]
};

return {
    "results":[{
        "id":id,
        "event_code":event_code,
        "event_type":event_type,
        // Use reportedAt here
        "reportedAt":reportedAt,
        "category":category,
        "address":address,
        "geometry":{"location":{"lat":alert_lat,"lng":alert_lng}},
        "assigned":{
            "volunteers":volunteers ||{
            "basic":["#1234","#22"],
            "Intermediate":["#12"],
            "Advanced":[""]},
            "responders":responders || [""]
        },
        "smart_tech_data":smart_tech_data || {"heart_rate":"35 BPM","SpO2":"92%","temperature":"37.8°C"},
        "status_message":status_message || "",
        "updates":updates || defaultMockUpdates,
        "Media":{
            "starred":starred_media || defaultMockMedia.starred,
            "regular":regular_media || defaultMockMedia.regular
        },
        "responder_location": {
            "lat": responder_lat,
            "lng": responder_lng
        }
    }]
}}

export async function GET(request){
    const {searchParams}= new URL(request.url)
    const category = searchParams.get("category");
    const Medicalevent1= formatEventdata({id:45,event_code:"CVX",event_type:"Cardiac Event",category:"Medical",alert_lat:38.625196855855506,alert_lng:-90.115183317234, responder_lat: 38.7, responder_lng: -90.2, address:"1359 North 31st Street, East St. Louis, IL 62204", reportedAt: new Date(Date.now() - 5 * 60 * 1000),responders:["WGN-2021"]})
    const Fireevent1= formatEventdata({id:47,event_code:"F1V",event_type:"Structure Fire",category:"Fire",alert_lat:38.605196855855506,alert_lng:-90.015183317234, responder_lat: 38.5, responder_lng: -90.3, address:"90 Cedar Drive, Fairview Heights,East St. Louis, IL 62208", reportedAt: new Date(Date.now() - 10 * 60 * 1000), volunteers: { basic: ["#301"]}})
    const Crimeevent1= formatEventdata({id:40,event_code:"RR",event_type:"Robbery",category:"Crime",alert_lat:38.925196855855506,alert_lng:-90.125183317234, responder_lat: 39.0, responder_lng: -90.4,address:"Harris Lane, Madison County,St.Louis, IL 62002", reportedAt: new Date(Date.now() - 25 * 60 * 1000), volunteers: { Intermediate: ["#55", "#61"]}})
    const MasterOfAlerts={
        "Medical":{
            "product":{"results":[Medicalevent1.results[0]]}},
        "Fire":{
            "product":{"results":[Fireevent1.results[0]]}},
        "Crime":{
            "product":{"results":[Crimeevent1.results[0]]}}
    }
    if(category){
    console.log("Sending categorized alerts from API:", MasterOfAlerts[category]);
    return NextResponse.json(MasterOfAlerts[category])
    }else{
        console.log("Sending all alerts from API:", MasterOfAlerts);
        return NextResponse.json(MasterOfAlerts)
    }
}