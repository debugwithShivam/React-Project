import Todo from '../models/Todo.js';
import TodoPage from '../models/TodoPage.js';

export async function createPage(req, res, next) {
  try {
    const { pageName, pageDescription, pagetag, favourite, date } = req.body;
    const page = await TodoPage.create({ pageName, pageDescription, pagetag, favourite, date });
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
}

export async function listPages(_req, res, next) {
  try {
    const pages = await TodoPage.find().sort({ _id: -1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
}

export async function deletePageAndTodos(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Page id is required.' });
    const page = await TodoPage.findById(id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    await Todo.deleteMany({ pageId: page._id });
    await page.deleteOne();
    res.json({ success: true, data: 'done' });
  } catch (error) {
    next(error);
  }
}

export async function updateFavourite(req, res, next) {
  try {
    const { favourite, id } = req.body;
    const page = await TodoPage.findByIdAndUpdate(id, { favourite }, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
}
