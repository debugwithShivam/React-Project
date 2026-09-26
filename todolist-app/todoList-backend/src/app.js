import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import taskRoutes from './routes/taskRoutes.js';
import todoPageRoutes from './routes/todoPageRoutes.js';
import todoRoutes from './routes/todoRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => res.send('server start'));
app.use(taskRoutes);
app.use(todoPageRoutes);
app.use(todoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
