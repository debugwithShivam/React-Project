import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import Layout from './layout'

const router = createBrowserRouter([
    {
        path:'/',
        element:<Layout/>
    }
])

export default router