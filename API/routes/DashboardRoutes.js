import express from "express";
import getDashboardData from "../controller/DashboardController.js";

const router = express.Router();

router.get("/Query", getDashboardData);

export default router;
