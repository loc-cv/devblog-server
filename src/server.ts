/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import * as dotenv from 'dotenv';
dotenv.config(); // must be called before importing from 'config'
import config from 'config';
import 'express-async-errors';

import app from './app';
import connectDb from './utils/connect-db';
import connectRedis from './utils/connect-redis';

dotenv.config();

const port = config.get<number>('port');

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
  connectDb();
  connectRedis();
});
