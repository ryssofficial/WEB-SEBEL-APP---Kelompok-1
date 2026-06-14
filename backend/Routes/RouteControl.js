// backend/Routes/RouteControl.js
import express from "express";
import Login from "./Login.js"
import NotifikasiRoute from "./NotifikasiRoute.js";
import DashboardRoute from "./Aris/DashboardRoute.js";
import KasRoutes from "./Eriska/KasRoutes.js";
import TabunganRoutes from "./Eriska/TabunganRoutes.js";
import PresensiRoute from "./Muadz/PresensiRoute.js"
import KeuanganRouter from "./Eriska/KeuanganRoutes.js"
import NilaiTugasRoute from "./Muadz/NilaiTugasRoute.js";

const BaseRouter = express.Router();

/**
 * 🗺️ CENTRAL ROUTE REGISTER
 * Tempat menggabungkan seluruh sub-route komponen aplikasi.
 * Setiap rute di bawah ini otomatis akan memiliki prefix '/api' dari app.js
 *
 * CONTOH: baseRouter.use("/siswa", siswaRoutes);
 */

BaseRouter.use("/auth", Login);
BaseRouter.use("/notifikasi", NotifikasiRoute);
BaseRouter.use("/dashboard", DashboardRoute);

BaseRouter.use("/kas", KasRoutes);
BaseRouter.use("/tabungan", TabunganRoutes);
BaseRouter.use("/keuangan", KeuanganRouter);

BaseRouter.use("/presensi", PresensiRoute);
BaseRouter.use("/nilai-tugas", NilaiTugasRoute);

export default BaseRouter;