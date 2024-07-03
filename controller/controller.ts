import { Request, Response } from "express";
import { Service } from "../service/service";
import { ApiError } from "../exeptions/api-error";
import { validationResult } from "express-validator";
import { join } from "path";

export class Controller {
  constructor() {}

  async signup(req: Request, res: Response, next: Function) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) return next(new ApiError(404, "Не верный ввод данных"));

      const { email, password } = req.body;

      const user = await new Service().signup(email, password);

      res.cookie(
        "access_token",
        { accessToken: user.accessToken, sessionId: user.id },
        { maxAge: 10 * 60 * 1000, httpOnly: true }
      );

      res.cookie(
        "refresh_token",
        { refreshToken: user.refreshToken, sessionId: user.id },
        { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
      );

      res.send(user);
    } catch (e) {
      next(e);
    }
  }

  async signin(req: Request, res: Response, next: Function) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) return next(new ApiError(404, "Не верный ввод данных"));

      const { email, password } = req.body;
      const { refresh_token } = req.cookies;

      const user = await new Service().signin(email, password, refresh_token?.sessionId);

      res.cookie(
        "access_token",
        { accessToken: user.accessToken, sessionId: user.id },
        { maxAge: 10 * 60 * 1000, httpOnly: true }
      );

      res.cookie(
        "refresh_token",
        { refreshToken: user.refreshToken, sessionId: user.id },
        { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
      );

      res.send(user);
    } catch (e) {
      next(e);
    }
  }

  async me(req: Request, res: Response, next: Function) {
    try {
      const { access_token } = req.cookies;

      const me = await new Service().me(access_token.accessToken);

      res.send({ id: me.id, email: me.email });
    } catch (e) {
      next(e);
    }
  }

  async loguot(req: Request, res: Response, next: Function) {
    try {
      const { refresh_token } = req.cookies;

      if (!refresh_token) return next(new ApiError(401, "Пользователь не авторизован"));

      const delToken = await new Service().logout(refresh_token.refreshToken);

      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      return res.send(delToken);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: Function) {
    try {
      const { refresh_token } = req.cookies;

      if (!refresh_token) return next(new ApiError(401, "Пользователь не авторизован"));

      const session = await new Service().refresh(refresh_token.refreshToken, refresh_token.sessionId);

      res.cookie(
        "access_token",
        { accessToken: session.accessToken, sessionId: session.sessionId },
        { maxAge: 10 * 60 * 1000, httpOnly: true }
      );
      res.cookie(
        "refresh_token",
        { refreshToken: session.refreshToken, sessionId: session.sessionId },
        { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
      );

      return res.send(session);
    } catch (e) {
      next(e);
    }
  }

  async addFile(req: Request, res: Response, next: Function) {
    try {
      const { userId }: { userId: number } = req.body;

      if (!userId || !req.file) return next(new ApiError(404, "Не верные параметры"));

      const data = {
        size: req.file.size,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        originName: req.file.originalname.split(".")[0],
        encoding: req.file.encoding,
      };

      const post = await new Service().addFile(userId, data);

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async updateFile(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params;

      if (!id || !req.file) return next(new ApiError(404, "Не верные параметры"));

      const data = {
        size: req.file.size,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        originName: req.file.originalname.split(".")[0],
        encoding: req.file.encoding,
      };

      const post = await new Service().updateFile(Number(id), data);

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async deleteFile(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params;

      if (!id) return next(new ApiError(404, "Не верные параметры"));

      const post = await new Service().deleteFile(Number(id));

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async getAllFiles(req: Request, res: Response, next: Function) {
    try {
      const { take, page } = req.query;

      const post = await new Service().getAllFiles(Number(take) || 10, Number(page) || 1);

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async getOneFile(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params;

      if (!id) return next(new ApiError(404, "Не верные параметры"));

      const post = await new Service().getOneFile(Number(id));

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async getAllUsers(_: Request, res: Response, next: Function) {
    try {
      const users = await new Service().getAllUsers();

      res.send(users);
    } catch (e) {
      next(e);
    }
  }

  async downloadFile(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params;

      if (!id) return next(new ApiError(404, "Не верные параметры"));

      const post = await new Service().getOneFile(Number(id));

      if (!post) {
        return res.send(null);
      }
      const file = join(__dirname, "../", "/upload", post.fileName);

      res.download(file);
    } catch (e) {
      next(e);
    }
  }
}
