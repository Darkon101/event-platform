import { Request, Response, NextFunction } from 'express';

export const handleCustomErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.msg) {
    res.status(err.status).json({ msg: err.msg });
  } else {
    next(err);
  }
};

export const handlePSQLErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === '23505') { 
    res.status(409).json({ msg: 'User already exists' });
  } else if (err.code === '23503') { 
    res.status(404).json({ msg: 'Resource not found' });
  } else if (err.code === '22P02') { 
    res.status(400).json({ msg: 'Invalid input' });
  } else {
    next(err);
  }
};

export const handleServerErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ msg: 'Internal server error' });
};