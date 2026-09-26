import { createContext, useState } from "react";

export const FilterCheckedTodo = createContext()

function FilterCompletedTodo({children}){
    const [checked,setChecked] = useState(false)

    return (
        <FilterCheckedTodo.Provider value={{checked,setChecked}}>
            {children}
        </FilterCheckedTodo.Provider>
    )
}

export default FilterCompletedTodo