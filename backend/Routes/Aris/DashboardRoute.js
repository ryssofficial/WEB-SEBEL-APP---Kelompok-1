import express from "express"
import BaseRoutes from "../../Services/BaseRoutes.js";
import DashboardController from "../../Controllers/DashboardController.js"; // Sesuaikan path
import AdminController from "../../Controllers/AdminController.js";

const DashboardRouter = express.Router();

BaseRoutes.generate("get", "/siswa", DashboardController.getSiswaDashboard)(DashboardRouter);
BaseRoutes.generate("get", "/guru", DashboardController.getGuruDashboard)(DashboardRouter);
BaseRoutes.generate('get', "/admin", AdminController )

export default DashboardRouter;