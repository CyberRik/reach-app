"use client"
import Header from "@/components/Header";
import Map from "@/components/Map";
import CategorySearch from "@/components/CategorySearch";
import {useState,useEffect} from 'react'
import GlobalApi from '@/Shared/GlobalApi';
import ActiveEvents from "@/components/EventNavigation/ActiveEvents";
import EventModal from "@/components/EventNavigation/EventModal";

export default function Home() {
  const [category,setcategory]=useState("Hospitals")
  const [rad,setrad]=useState(2500) //not necessarily described in a defined unit of distance
  const [categoryResults,setcategoryResults]=useState([])
  const [alerts,setalerts]=useState([])
  const [modal,setModal]=useState(false)
  const [event,setEvent]=useState(null)

  const getPlaces=(cate)=>{
    GlobalApi.getGooglePlaces(cate,rad).then((res)=>{
      if (res && res.data) {
        console.log('API Response for', cate, ':', res.data);
        const results = res.data.product?.results || res.data.results || [];
        console.log('Processed results for', cate, ':', results);
        setcategoryResults((prev) => {
          const newResults = [...prev, [cate, results]];
          console.log('Updated categoryResults:', newResults);
          console.log(`CategoryResults after adding ${cate}:`, newResults);
          return newResults;
        });
      } else {
        console.warn('No data received for', cate, res);
      }
    }).catch(error => {
      console.error('Error fetching places for', cate, ':', error);
    });
  }
  useEffect(()=>{
    setcategoryResults([])
    if(category==="All Resources"){
    getPlaces("Medical-Equipment")
    getPlaces("Fire-Equipment")
    getPlaces("Hospitals")
    }else if(category==="All Alerts"){
    getPlaces("Medical")
    getPlaces("Fire")
    getPlaces("Crime")
    }else{
    getPlaces(category)}
  },[category,rad])

  useEffect(()=>{
    GlobalApi.getAlerts().then((res)=>{
      if(res && res.data){
        const masterAlerts = res.data;
        const allAlertsArray = [];

        for (const categoryKey in masterAlerts) {
          if (Object.hasOwnProperty.call(masterAlerts, categoryKey)) {
            const categoryData = masterAlerts[categoryKey];
            const results = categoryData?.product?.results || categoryData?.results;
            if (Array.isArray(results)) {
              allAlertsArray.push(...results);
            }
          }
        }
        console.log("Flattened alerts array before setting state:", allAlertsArray);
        setalerts(allAlertsArray);
      } else {
         console.warn('No alerts data received:', res);
        setalerts([]);
      }
    }).catch(error => {
      console.error('Error fetching alerts:', error);
      setalerts([]);
    });
  },[])

  return (<>
    <Header />

    {/* Absolutely positioned container for the Map to fill the area below the header */}
    <div style={{ position: 'absolute', top: '64px', left: '0', right: '0', bottom: '0' }}>
      {/* Category Search positioned relative to the map container - always show */}
      <div className="absolute top-[8px] left-3 z-120">
          <CategorySearch category={category} setcategory={setcategory} />
      </div>

      {/* Always render the Google Map */}
      <Map results={categoryResults} className="w-full h-full"/>

    </div>

    {/* Active Events dashboard - always shown */}
    <ActiveEvents alerts={alerts} setModal={setModal} setEvent={setEvent} onIncidentSelect={(incident) => console.log('Incident selected:', incident)} />
      
    {/* Event Modal - show only if modal state is true */}
    {modal ? 
      // Pass setModal to the modal so it can close itself
      (<EventModal setModal={setModal} incident={event}/>):
      null
    }
  </>
  );
}
