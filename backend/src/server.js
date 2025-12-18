import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import healthUnitRoutes from "./routes/healthUnit.routes.js";
import restrictionRoutes from "./routes/restriction.routes.js";
import { handleShiftChange } from "./services/shiftChange.service.js";



dotenv.config();


const app = express();
app.use(cors());

app.use(express.json());
app.use("/restrictions", restrictionRoutes);
app.use(healthUnitRoutes);
app.use(restrictionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

setInterval(async () => {
  try {
    await handleShiftChange();
  } catch (error) {
    console.error("Erro na troca de plantão automática:", error);
  }
}, 60 * 1000); // roda a cada 1 minuto

