import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Header from '../features/navigation/components/Header';
import Section from '../features/todos/components/Section';
import ShowPauseTodo from '../features/todos/components/ShowPauseTodo';
import ShowTimerTodo from '../features/todos/components/ShowTimerTodo';
import CreateTodoPages from '../features/pages/components/CreateTodoPages';
import CustomTodoPage from '../features/pages/components/CustomTodoPage';
import '../styles/App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Header />,
    children: [
      { index: true, element: <Section /> },
      { path: 'pause', element: <ShowPauseTodo /> },
      { path: 'timer', element: <ShowTimerTodo /> },
      { path: 'CustomTodoPage', element: <CustomTodoPage /> },
      { path: 'CreateTodoPages', element: <CreateTodoPages /> },
    ],
  },
]);

export default function App() {
  return (
    <div className="todolist-Website">
      <RouterProvider router={router} />
    </div>
  );
}
