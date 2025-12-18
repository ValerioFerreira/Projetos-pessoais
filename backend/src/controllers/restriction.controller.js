import {
  closeRestrictionService,
  reopenRestrictionService,
} from "../services/restriction.service.js";

// Fechar / criar restrição
export async function closeRestriction(req, res) {
  try {
    const result = await closeRestrictionService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message || "Erro ao fechar plantão",
    });
  }
}

// Reabrir restrição (NOVA FUNÇÃO)
export async function reopenRestriction(req, res) {
  try {
    // O ID vem da URL: /restrictions/:id/reopen
    const restrictionId = Number(req.params.id);

    if (!restrictionId) {
      return res.status(400).json({
        message: "ID da restrição inválido",
      });
    }

    const result = await reopenRestrictionService(restrictionId);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message || "Erro ao reabrir plantão",
    });
  }
}
