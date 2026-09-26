import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 3000;

try {
  await connectDatabase();
  app.listen(port, () => console.log(`Server running on port ${port}.`));
} catch (error) {
  console.error('Could not start the API server:', error);
  process.exitCode = 1;
}
