import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import FilterCompletedTodo from '../contexts/FilterTodoContext';
import BackgroundImages from '../contexts/BackgroundImageContext';
import { CenterTodoDataProvider } from '../contexts/CenterTodoContext';
import { MySearchContext } from '../contexts/SearchTextContext';
import MyContextProvider from '../contexts/UIContext';
import { MyTextColorFunction } from '../contexts/TextColorContext';

const queryClient = new QueryClient();

export default function AppProviders({ children }) {
  return (
    <BackgroundImages>
      <FilterCompletedTodo>
        <Provider store={store}>
          <MyContextProvider>
            <QueryClientProvider client={queryClient}>
              <MySearchContext>
                <CenterTodoDataProvider>
                  <MyTextColorFunction>{children}</MyTextColorFunction>
                </CenterTodoDataProvider>
              </MySearchContext>
            </QueryClientProvider>
          </MyContextProvider>
        </Provider>
      </FilterCompletedTodo>
    </BackgroundImages>
  );
}
