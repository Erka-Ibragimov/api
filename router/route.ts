import express from "express";
import { Controller } from "../controller/controller";
import { authMiddle } from "../middlewares/auth";
import { body } from "express-validator";
import { upload } from "../service/fileSettings";

export const router = express.Router();

const controller = new Controller();

router.post("/signup", body("email").isEmail(), controller.signup);
router.post("/signin", body("email").isEmail(), controller.signin);
router.get("/file/list", authMiddle, controller.getAllFiles);
router.get("/file/:id", authMiddle, controller.getOneFile);
router.post("/file/upload ", authMiddle, upload.single("file"), controller.addFile);
router.put("/file/update/:id", authMiddle, upload.single("file"), controller.updateFile);
router.delete("/file/delete/:id", authMiddle, controller.deleteFile);
router.get("/file/download/:id", authMiddle, controller.downloadFile);
router.get("/info", authMiddle, controller.me);
router.get("/users", authMiddle, controller.getAllUsers);
router.post("/signin/new_token", controller.refresh);
router.get("/logout", authMiddle, controller.loguot);
