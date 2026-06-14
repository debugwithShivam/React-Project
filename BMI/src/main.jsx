import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import './index.css'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import router from './router/Router.jsx'
import Store from './store/store.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>
      <Provider store={Store}/>
    </RouterProvider>
  </StrictMode>,
)
