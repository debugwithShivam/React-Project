import { createContext, useContext } from "react";
import {io} from 'socket.io-client'
import { useMemo } from "react";

const SocketContect = createContext(null);

export const useSocket = () =>{
    const socket = useContext(SocketContect)
    return socket;
}

export const SocketProvider = (props) => {
    const socket = useMemo(()=>io('http://localhost:8000',{withCredentials:true}),[])
    return (
        <SocketContect.Provider value={socket}>
            {props.children}
            </SocketContect.Provider>
    )
}