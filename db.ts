import { DataSource } from "typeorm";
import { User } from "./module/user-module";
import { Session } from "./module/session";
import { Post } from "./module/posts";

export const AppDataSource = new DataSource({
  type: process.env.DBTYPE as any,
  host: process.env.DBHOST,
  port: Number(process.env.DBPORT),
  username: process.env.DBUSERNAME,
  password: process.env.DBPASSWORD,
  database: process.env.DBDATABASE,
  entities: [User, Session, Post],
  synchronize: true,
  logging: false,
});
