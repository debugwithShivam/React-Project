import {createBrowserRouter} from 'react-router-dom'
import Layout from './Layout'
import Home from '../pages/Home'
import BMI from '../pages/BMI'
import History from '../pages/History'
import Search from '../pages/Search'
import Login from '../pages/Login'

let router = createBrowserRouter([
    {
        path:'/login',
        element:<Login/>
    },
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                path:'/',
                element:<Home/>
            },
            {
                path:'/BMI',
                element:<BMI/>
            },
            {
                path:'/History',
                element:<History/>
            },
            {
                path:'/Search',
                element:<Search/>
            },
        ]
    }
])

export default router