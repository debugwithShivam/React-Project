import { Router } from 'express';
import {
  createTodo,
  deleteTodo,
  deleteTodoById,
  listTodos,
  moveTodo,
  updateTodo,
  updateTodosForPage,
} from '../controllers/todoController.js';

const router = Router();

router.post('/SetTodo', createTodo);
router.get('/GetTodo', listTodos);
router.patch('/todoChange', updateTodo);
router.patch('/changePageId', moveTodo);
router.patch('/updateMany', updateTodosForPage);
router.delete('/removeTodo', deleteTodo);
router.delete('/deteleTodo/:id', deleteTodoById);

export default router;
