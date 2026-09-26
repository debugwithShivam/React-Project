import { Router } from 'express';
import {
  createPage,
  deletePageAndTodos,
  listPages,
  updateFavourite,
} from '../controllers/todoPageController.js';

const router = Router();

router.post('/createPage', createPage);
router.get('/getPages', listPages);
router.delete('/pageTodoDelet', deletePageAndTodos);
router.patch('/favouritePage', updateFavourite);

export default router;
