import { createContext, useState, useEffect } from "react";
import img1 from '../images/img1.png'
export const MyBackgroundImg = createContext()

function BackgroundImages({ children }) {
    const stored = localStorage.getItem("backgroungImg");
    const [backimg, setBackImg] = useState(stored ? JSON.parse(stored) : img1);
    useEffect(() => {
        let back = localStorage.setItem('backgroungImg', JSON.stringify(backimg))
    }, [backimg]);

    return (
        <MyBackgroundImg.Provider value={{ backimg, setBackImg }}>
            {children}
        </MyBackgroundImg.Provider>
    )
}

export default BackgroundImages