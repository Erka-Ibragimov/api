require("dotenv").config();
import express, { Express } from "express";
import { json } from "body-parser";
import cors from "cors";
import { router } from "./router/route";
import { AppDataSource } from "./db";
import path from "path";
import cookieParser from "cookie-parser";
import { middleError } from "./middlewares/error";

const PORT: number = Number(process.env.PORT) || 5000;
const app: Express = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(json());
app.use("/file", express.static(path.join(__dirname, "./upload/")));
app.use(cookieParser());
app.use("/api", router);
app.use(middleError);

const start = async () => {
  try {
    await AppDataSource.initialize();

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
