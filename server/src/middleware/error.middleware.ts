import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
  });
};

export default errorHandler;
