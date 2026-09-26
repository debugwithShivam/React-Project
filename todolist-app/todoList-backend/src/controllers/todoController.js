import Todo from '../models/Todo.js';

export async function createTodo(req, res, next) {
  try {
    const { title, Pasued, complet, createdAt, pageId, duration, date } = req.body;
    const todo = await Todo.create({ title, Pasued, complet, createdAt, pageId, duration, date });
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

export async function listTodos(_req, res, next) {
  try {
    const todos = await Todo.find().sort({ _id: -1 });
    res.json({ success: true, data: todos });
  } catch (error) {
    next(error);
  }
}

export async function updateTodo(req, res, next) {
  try {
    const { id, pageId, Pasued, complet, title } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      id,
      { pageId, Pasued, complet, title },
      { new: true, runValidators: true },
    );
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found.' });
    res.json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

export async function moveTodo(req, res, next) {
  try {
    const { id, pageId } = req.body;
    const todo = await Todo.findByIdAndUpdate(id, { pageId }, { new: true, runValidators: true });
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found.' });
    res.json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const { id } = req.body;
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found.' });
    res.json({ success: true, data: 'done' });
  } catch (error) {
    next(error);
  }
}

export async function deleteTodoById(req, res, next) {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found.' });
    res.json({ success: true, message: 'Todo deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function updateTodosForPage(req, res, next) {
  try {
    const { pageId, complet, Pasued } = req.body;
    const result = await Todo.updateMany({ pageId }, { $set: { complet, Pasued } });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
