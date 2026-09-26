import SearchTask from '../models/SearchTask.js';

export async function createSearchTask(req, res, next) {
  try {
    const { searchInput, currantDate, complet, paused, timer } = req.body;
    const task = await SearchTask.create({
      searchInput,
      currantDate,
      complet,
      paused,
      duration: timer,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function listSearchTasks(_req, res, next) {
  try {
    const tasks = await SearchTask.find().sort({ _id: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function updateCompletion(req, res, next) {
  try {
    const { complet, id, paused, searchInput, isDisabled } = req.body;
    const task = await SearchTask.findByIdAndUpdate(
      id,
      { complet, paused, searchInput, isDisabled },
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function updateTimer(req, res, next) {
  try {
    const { id, duration, isDisabled } = req.body;
    const task = await SearchTask.findByIdAndUpdate(
      id,
      { duration, isDisabled },
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function updateAllSearchTasks(req, res, next) {
  try {
    const { paused, complet } = req.body;
    const result = await SearchTask.updateMany({}, { $set: { paused, complet } });
    res.json({
      success: true,
      message: 'All documents updated.',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
}
