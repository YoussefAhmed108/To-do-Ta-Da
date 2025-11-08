import express from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} from '../controllers/columnController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getColumns)
  .post(createColumn);

router.post('/reorder', reorderColumns);

router.route('/:id')
  .put(updateColumn)
  .delete(deleteColumn);

export default router;
