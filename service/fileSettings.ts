import cuid from "cuid";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { existsSync, mkdirSync } from "fs";

const checkDirToFile = () => {
  const pathToFile = path.join(__dirname, "../upload/");
  if (!existsSync(pathToFile)) {
    mkdirSync(pathToFile);
  }
  return pathToFile;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, checkDirToFile());
  },
  filename: function (req, file, cb) {
    const exit = file.mimetype.split("/")[1];
    const uniqueSuffix = `${new Date().toLocaleString().split(", ")[0]}-${cuid()}.${exit}`;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const exit = file.mimetype.split("/")[1];
  if (exit !== "pdf" && exit !== "png" && exit !== "jpg" && exit !== "jpeg") {
    cb(new Error("Можно вводить pdf, png, jpg, jpeg"));
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
