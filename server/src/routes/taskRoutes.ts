import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  createBulkSubtasks,
  updateTask,
  deleteTask,
  markTaskComplete,
  startTimer,
  stopTimer,
  getSubtasks,
  moveTask
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/bulk-subtasks', createBulkSubtasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/complete', markTaskComplete);
router.post('/:id/timer/start', startTimer);
router.post('/:id/timer/stop', stopTimer);
router.get('/:id/subtasks', getSubtasks);
router.post('/:id/move', moveTask);

export default router;
