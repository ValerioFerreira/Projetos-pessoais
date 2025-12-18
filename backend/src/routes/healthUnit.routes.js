import express from "express";
import prisma from "../config/database.js";

const router = express.Router();

/**
 * GET /health-units/status
 * Retorna o status atual das especialidades por unidade de saúde
 */
router.get("/health-units/status", async (req, res) => {
  try {
    const units = await prisma.health_unit.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        health_unit_specialty: {
          include: {
            specialty: true,
          },
        },
      },
    });

    // Normaliza resposta para o frontend
    const response = units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      phone1: unit.phone1,
      phone2: unit.phone2,
      phone3: unit.phone3,
      specialties: unit.health_unit_specialty.map((hus) => ({
        id: hus.specialty.id,
        name: hus.specialty.name,
        status: hus.status, // available | restricted
      })),
    }));

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar status das unidades:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;
