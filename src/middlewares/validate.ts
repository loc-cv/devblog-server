import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validate =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    schema.parse({
      params: req.params,
      query: req.query,
      body: req.body,
    });
    next();
  };
