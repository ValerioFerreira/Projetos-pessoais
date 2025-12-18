import { fetchHealthUnitsStatus } from "../services/healthUnit.service.js";

export async function getHealthUnitsStatus(req, res) {
  try {
    const data = await fetchHealthUnitsStatus();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao buscar status das unidades de saúde",
    });
  }
}
