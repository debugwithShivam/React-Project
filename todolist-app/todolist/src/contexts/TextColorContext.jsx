import { createContext, useState ,useEffect} from "react";

let textColorContext = createContext(null)

export function MyTextColorFunction({children}){
    let color = localStorage.getItem('textColor')
    const [textColor,setTextColor] = useState(color ? JSON.parse(color):'white')

     useEffect(()=>{
        localStorage.setItem('textColor',JSON.stringify(textColor))
    },[textColor])

    return (
        <textColorContext.Provider value={{textColor,setTextColor}}>
            {children}
        </textColorContext.Provider>
    )
}

export default textColorContext