// backend/Routes/Login.js
import express from "express";
import BaseRoutes from "../Services/BaseRoutes.js"; // Memuat template pembungkus rute milik Anda
import SiswaAuthController from "../Controllers/SiswaAuthController.js";
import GuruAuthController from "../Controllers/GuruAuthController.js";

const expressRouter = express.Router();

const registerLoginRoute = BaseRoutes.generate("post", "/login/siswa", SiswaAuthController.login);
registerLoginRoute(expressRouter);

const registerGuruLogin = BaseRoutes.generate("post", "/login/guru", GuruAuthController.login);
registerGuruLogin(expressRouter);

const registerGoogleLogin = BaseRoutes.generate("post", "/login/google", GuruAuthController.googleLogin);
registerGoogleLogin(expressRouter);

export default expressRouter;