import config from 'config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const app = express();

// Setting various secure HTTP headers
app.use(helmet());

// Simple development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === config.get<string>('origin')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS.'));
      }
    },
    optionsSuccessStatus: 200,
    // Server allows cookies (or other user credentials) to be included on cross-origin requests.
    // https://stackoverflow.com/a/24689738
    credentials: true,
  }),
);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser, writing cookie into req.cookies
app.use(cookieParser());

export default app;
