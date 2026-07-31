import { configureStore } from "@reduxjs/toolkit";
import noteBookSlice from  './Slice'

export const store = configureStore({
    reducer:{
        state:noteBookSlice
    }
})