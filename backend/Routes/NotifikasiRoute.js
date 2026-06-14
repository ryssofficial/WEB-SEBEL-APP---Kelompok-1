import express from "express";
import NotifikasiController from "../Controllers/NotifikasiController.js";
import { AuthToken } from "./../Services/AuthToken.js"; // Sesuaikan path tempat fungsi authenticateToken Anda berada

const expressRouter = express.Router();

expressRouter.use(AuthToken);
expressRouter.get("/", NotifikasiController.getAll);
expressRouter.put("/read-all", NotifikasiController.markAllAsRead);
expressRouter.put("/:id/read", NotifikasiController.markAsRead);
expressRouter.delete("/:id", NotifikasiController.deleteNotif);

export default expressRouter;