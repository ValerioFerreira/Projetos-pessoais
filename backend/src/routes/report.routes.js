import express from "express";
import { generateRestrictionReportController } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/restrictions", generateRestrictionReportController);

export default router;
