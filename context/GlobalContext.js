import { useState } from "react";

export const ContextProvider=({children})=>{
    const [category,setcategory]=useState([])
    const value={
        category,
        setcategory
    }
    return(
        <ContextProvider.Provider value={value}>{children}</ContextProvider.Provider>
    )
}