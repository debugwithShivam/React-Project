import { createContext, useState } from "react";

export const FilterTodoContext = createContext()

function FilterCompletedTodo({children}){
    const [checked,setChecked] = useState(false)

    return (
        <FilterTodoContext.Provider value={{checked,setChecked}}>
            {children}
        </FilterTodoContext.Provider>
    )
}

export default FilterCompletedTodo