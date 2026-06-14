import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const query = new QueryClient()
import { Provider } from 'react-redux'
import { store } from './Redux/Store.jsx'
import FilterCompletedTodo from './stateManag/FilterCheckedTodo.jsx'
import BackgroundImages from './stateManag/ChangeBackgroungImg.jsx'
import { CenterTodoDataProvider } from './stateManag/CenterTodoata.jsx'
import { MySearchContext } from './stateManag/searchBarText.jsx'
import MyContextProvider from './stateManag/UIchange.jsx'
import { MyTextColorFunction } from './stateManag/TextColorContetx.jsx'
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
