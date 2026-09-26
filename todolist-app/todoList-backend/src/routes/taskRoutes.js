import { Router } from 'express';
import {
  createSearchTask,
  listSearchTasks,
  updateAllSearchTasks,
  updateCompletion,
  updateTimer,
} from '../controllers/taskController.js';

const router = Router();

router.post('/search', createSearchTask);
router.get('/searchTask', listSearchTasks);
router.patch('/completed', updateCompletion);
router.patch('/timer', updateTimer);
router.patch('/updateTimer', updateTimer);
router.patch('/allChange', updateAllSearchTasks);

export default router;
