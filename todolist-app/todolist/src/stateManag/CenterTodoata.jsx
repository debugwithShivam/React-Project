import { useState } from "react";
import { createContext } from "react";

let  centerTodoData = createContext(null)

export function CenterTodoDataProvider({children}){
  let [todoData, setTodoData] = useState([]);

  return (
    <centerTodoData.Provider value={{ todoData, setTodoData }}>
      {children}
    </centerTodoData.Provider>
  );
}
export default centerTodoData