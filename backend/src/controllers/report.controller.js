import { generateRestrictionReport } from "../services/report.service.js";

export async function generateRestrictionReportController(req, res) {
  try {
    const { health_unit_ids, start_date, end_date } = req.body;

    if (
      !Array.isArray(health_unit_ids) ||
      health_unit_ids.length === 0 ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message: "Unidades e período são obrigatórios"
      });
    }

    const pdfBuffer = await generateRestrictionReport({
      health_unit_ids,
      start_date,
      end_date
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=relatorio_restricoes.pdf"
    );

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return res.status(500).json({
      message: "Erro ao gerar relatório"
    });
  }
}
