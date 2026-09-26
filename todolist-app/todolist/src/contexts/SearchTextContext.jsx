import { createContext, useEffect, useState } from "react";

const searchText = createContext()

export function MySearchContext({children}){
    const [SearchTextContext,setSearchBarText] = useState('')

   

    return (
        <searchText.Provider value={{SearchTextContext,setSearchBarText}}>
            {children}
        </searchText.Provider>
    )
}

export default searchText