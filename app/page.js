"use client"
import Header from "@/components/Header";
import Map from "@/components/Map";
import CategorySearch from "@/components/CategorySearch";
import {useState,useEffect} from 'react'
import GlobalApi from '@/Shared/GlobalApi';

export default function Home() {
  const [category,setcategory]=useState("Hospitals")
  const [rad,setrad]=useState(2500)
  const [categoryResults,setcategoryResults]=useState([])

  const getPlaces=(cate)=>{
    GlobalApi.getGooglePlaces(cate,rad).then((res)=>{
      console.log(res.data.product.results)
      setcategoryResults((cat) => [...cat, [cat, res.data.product.results]]);
    })
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
