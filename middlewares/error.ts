import { Request, Response } from "express";
import { ApiError } from "../exeptions/api-error";

export function middleError(error: unknown, req: Request, res: Response, next: Function) {
  if (error instanceof ApiError) {
    return res.status(error.status).send({ error: error.message });
  } else if (error instanceof Error) {
    return res.status(404).send({ error: error.message });
  }
  return res.status(500).json({ error: "Непредвидинная ошибка" });
}
