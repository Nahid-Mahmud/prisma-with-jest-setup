import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export interface RequestValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validateRequest =
  (schema: RequestValidationSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query) as Record<
          string,
          unknown
        >;
        const query = req.query as Record<string, unknown>;
        // Express 5 exposes req.query via a getter with no setter,
        // so it must be mutated in place rather than reassigned.
        Object.keys(query).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete query[key];
        });
        Object.assign(query, parsedQuery);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
