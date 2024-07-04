import { AppDataSource } from "../db";
import { UserDto } from "../dto/user.dto";
import { ApiError } from "../exeptions/api-error";
import { User } from "../module/user-module";
import { hash, compare } from "bcrypt";
import {
  generateTokens,
  validateAccesseToken,
  validateRefreshToken,
} from "./generateToken";
import { Session } from "../module/session";
import { Post } from "../module/posts";
import { unlink } from "fs";
import { join } from "path";

class Service {
  async signup(email: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);

    const existUser = await userRepository.findOneBy({
      email,
    });

    if (existUser) throw new ApiError(404, "Такой пользователь уже существует");

    const hashPassword = await hash(password, 3);

    const newUser = new User();

    newUser.email = email;
    newUser.password = hashPassword;

    const user = await userRepository.save(newUser);

    const userDto = new UserDto(user);

    const generateToken = generateTokens({
      id: userDto.id,
      email: userDto.email,
    });

    const session = AppDataSource.getRepository(Session);

    const newToken = new Session();

    newToken.refreshToken = generateToken.refreshToken;
    newToken.user = newUser;

    const token = await session.save(newToken);

    return {
      accessToken: generateToken.accessToken,
      ...token,
    };
  }

  async signin(email: string, password: string, sessionId?: number) {
    const userRepository = AppDataSource.getRepository(User);

    const existUser = await userRepository.findOneBy({
      email,
    });

    if (!existUser) throw new ApiError(404, "Такой пользователь не существует");

    const isPassEquals = await compare(password, existUser.password);

    if (!isPassEquals) throw new ApiError(404, "Не правильный пароль!");

    const userDto = new UserDto(existUser);

    const generateToken = generateTokens({
      id: userDto.id,
      email: userDto.email,
    });

    const session = AppDataSource.getRepository(Session);

    const existToken = await session.findOne({
      where: {
        user: { id: existUser.id },
      },
    });

    if (!existToken || !sessionId) {
      const newToken = new Session();

      newToken.refreshToken = generateToken.refreshToken;
      newToken.user = existUser;

      const token = await session.save(newToken);

      return {
        accessToken: generateToken.accessToken,
        ...token,
      };
    }

    existToken.refreshToken = generateToken.refreshToken;
    existToken.updated_at = new Date();
    existToken.user = existUser;

    const token = await session.save(existToken);
    return {
      accessToken: generateToken.accessToken,
      ...token,
    };
  }

  async addFile(
    userId: number,
    data: {
      size: number;
      fileName: string;
      mimeType: string;
      originName: string;
      encoding: string;
    }
  ) {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      unlink(join(__dirname, "../upload", data.fileName), (err) => {
        if (err) throw new ApiError(404, "Файл не найден");
      });

      throw new ApiError(404, "Такого пользователя не существует");
    }

    const postRepository = AppDataSource.getRepository(Post);

    const post = new Post();

    post.user = user;
    post.fileName = data.fileName;
    post.size = data.size;
    post.mimeType = data.mimeType;
    post.originName = data.originName;
    post.encoding = data.encoding;

    return await postRepository.save(post);
  }

  async updateFile(
    id: number,
    data: {
      size: number;
      fileName: string;
      mimeType: string;
      originName: string;
      encoding: string;
    }
  ) {
    const postRepository = AppDataSource.getRepository(Post);

    const post = await postRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        user: {
          email: true,
          id: true,
        },
      },
    });

    if (!post) {
      unlink(join(__dirname, "../upload", data.fileName), (err) => {
        if (err) throw new ApiError(404, "Файл не найден");
      });
      throw new ApiError(404, "Не найден пост");
    }

    unlink(join(__dirname, "../upload", post.fileName), (err) => {
      if (err) throw new ApiError(404, "Файл не найден");
    });

    post.fileName = data.fileName;
    post.size = data.size;
    post.mimeType = data.mimeType;
    post.originName = data.originName;
    post.encoding = data.encoding;

    return await postRepository.save(post);
  }

  async deleteFile(id: number) {
    const postRepository = AppDataSource.getRepository(Post);

    const post = await postRepository.findOneBy({
      id,
    });

    if (!post) throw new ApiError(404, "Не найден пост");

    unlink(join(__dirname, "../upload", post.fileName), (err) => {
      if (err) throw new ApiError(404, "Файл не найден");
    });

    return await postRepository.remove(post);
  }

  async getAllFiles(take: number, page: number) {
    const skip = take * page - take;

    const postRepository = AppDataSource.getRepository(Post);

    return await postRepository.find({
      select: {
        user: {
          id: true,
          email: true,
        },
      },
      relations: {
        user: true,
      },
      skip: skip,
      take: take,
    });
  }

  async getOneFile(id: number) {
    const postRepository = AppDataSource.getRepository(Post);

    return await postRepository.findOne({ where: { id } });
  }

  async logout(refreshToken: string) {
    const session = AppDataSource.getRepository(Session);

    const existToken = await session.findOneBy({
      refreshToken,
    });

    await session.remove(existToken as Session);

    return true;
  }

  async refresh(refreshToken: string, sessionId: number) {
    const userData = validateRefreshToken(refreshToken);

    const session = AppDataSource.getRepository(Session);

    const existToken = await session.findOne({
      where: {
        refreshToken,
        id: sessionId,
      },
      select: {
        user: {
          id: true,
          email: true,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!userData || !existToken) throw new ApiError(401, "Не авторизован");

    const tokens = generateTokens({
      id: existToken.user.id,
      email: existToken.user.email,
    });

    existToken.refreshToken = tokens.refreshToken;

    await session.save(existToken);

    return {
      ...tokens,
      sessionId: existToken.id,
    };
  }

  async getAllUsers() {
    const userRepository = AppDataSource.getRepository(User);

    return await userRepository.find();
  }

  async me(token: string) {
    return await validateAccesseToken(token);
  }
}
export default new Service();
