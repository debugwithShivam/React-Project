import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const query = new QueryClient()
import { Provider } from 'react-redux'
import { store } from './store/Store.jsx'
import FilterCompletedTodo from './contexts/FilterCheckedTodo.jsx'
import BackgroundImages from './contexts/ChangeBackgroungImg.jsx'
import { CenterTodoDataProvider } from './contexts/CenterTodoata.jsx'
import { MySearchContext } from './contexts/searchBarText.jsx'
import MyContextProvider from './contexts/UIchange.jsx'
import { MyTextColorFunction } from './contexts/TextColorContetx.jsx'
createRoot(document.getElementById('root')).render(
  <BackgroundImages>
    <FilterCompletedTodo>
      <Provider store={store}>
        <MyContextProvider>
          <QueryClientProvider client={query}>
            <MySearchContext>
              <CenterTodoDataProvider>
               <MyTextColorFunction>
                <App />
               </MyTextColorFunction>
              </CenterTodoDataProvider>
            </MySearchContext>
          </QueryClientProvider>
        </MyContextProvider>
      </Provider>
    </FilterCompletedTodo>
  </BackgroundImages>

)
