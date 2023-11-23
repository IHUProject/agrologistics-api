import express, { Request, Response } from 'express';

const app: express.Application = express();
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
