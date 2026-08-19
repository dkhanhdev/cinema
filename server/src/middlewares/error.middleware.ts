import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Global Error Handler]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, err.stack);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `API route not found: [${req.method}] ${req.originalUrl}`, 404);
};
