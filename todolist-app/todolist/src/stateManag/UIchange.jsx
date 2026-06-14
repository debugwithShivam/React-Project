import { createContext, useState } from "react";

export const MyContext = createContext();

function MyContextProvider({ children }) {
  const [state, setState] = useState(true);

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

export default MyContextProvider;
