import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from './router/Router.jsx'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import { store } from './Redux/Store.jsx'
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
