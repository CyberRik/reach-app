"use client"
import Header from "@/components/Header";
import Map from "@/components/Map";
import CategorySearch from "@/components/CategorySearch";
import {useState,useEffect} from 'react'
import GlobalApi from '@/Shared/GlobalApi';

export default function Home() {
  const [category,setcategory]=useState("Hospitals")
  const [rad,setrad]=useState(2500) //not necessarily described in a defined unit of distance
  const [categoryResults,setcategoryResults]=useState([])

  const getPlaces=(cate)=>{
    GlobalApi.getGooglePlaces(cate,rad).then((res)=>{
      if (res && res.data) {
        console.log('API Response for', cate, ':', res.data);
        const results = res.data.product?.results || res.data.results || [];
        console.log('Processed results for', cate, ':', results);
        setcategoryResults((prev) => {
          const newResults = [...prev, [cate, results]];
          console.log('Updated categoryResults:', newResults);
          return newResults;
        });
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
  return (<>
    <Header />
    <div className="relative w-full h-full">
    <CategorySearch category={category} setcategory={setcategory} />
    <Map results={categoryResults}/>
    </div>
    </>
  );
}
