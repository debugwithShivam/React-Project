import { createContext, useEffect, useState } from "react";

const searchText = createContext()

export function MySearchContext({children}){
    const [searchBarText,setSearchBarText] = useState('')

   

    return (
        <searchText.Provider value={{searchBarText,setSearchBarText}}>
            {children}
        </searchText.Provider>
    )
}

export default searchText