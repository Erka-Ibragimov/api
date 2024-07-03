import { Request, Response } from "express";
import { ApiError } from "../exeptions/api-error";
import { validateAccesseToken } from "../service/generateToken";

export async function authMiddle(req: Request, _: Response, next: Function) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ApiError(401, "Пользователь не авторизован"));
  }
  const accessToken = authorizationHeader.split(" ")[1];
  if (!accessToken) {
    return next(new ApiError(401, "Пользователь не авторизован"));
  }
  const userData = await validateAccesseToken(accessToken);
  if (!userData) {
    return next(new ApiError(401, "Пользователь не авторизован"));
  }
  const { access_token } = req.cookies;
  if (!access_token) {
    return next(new ApiError(401, "Пользователь не авторизован"));
  }

  next();
}
