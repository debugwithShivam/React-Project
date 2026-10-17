import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import VITE_API_URL from "../config/backend_API_URL";

const api = (method, url, body) =>
  axios({ method, url: `${VITE_API_URL}/authRouter${url}`, data: body, withCredentials: true }).then(
    (response) => response.data
  );

export default function useTodos() {
  const queryClient = useQueryClient();

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["todos"] });

  const { data: todos = [], isLoading, isError, error } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => (await api("get", "/getTodos")).data,
  });

  const addTodo = useMutation({
    mutationFn: (text) => api("post", "/insertTodo", { text }),
    onSuccess: refresh,
  });

  const toggleTodo = useMutation({
    mutationFn: (todo) => api("patch", "/updateTodo", { id: todo._id, done: !todo.done }),
    onSuccess: refresh,
  });

  const deleteTodo = useMutation({
    mutationFn: (id) => api("delete", `/deleteTodo/${id}`),
    onSuccess: refresh,
  });

  const clearCompleted = useMutation({
    mutationFn: () => api("delete", "/clearCompletedTodos"),
    onSuccess: refresh,
  });

  return {
    todos,
    isLoading,
    isError,
    errorMessage: error?.response?.data?.message ?? "Could not reach your tasks.",
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  };
}
