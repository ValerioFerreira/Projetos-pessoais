import express from "express";
import prisma from "../config/database.js";

const router = express.Router();

/* =========================
   FECHAR PLANTÃO
========================= */
router.post("/", async (req, res) => {
  const {
    health_unit_id,
    specialty_ids,
    doctor_name,
    doctor_crm,
    reason,
    operator_id
  } = req.body;

  if (
    !health_unit_id ||
    !Array.isArray(specialty_ids) ||
    specialty_ids.length === 0 ||
    !doctor_name ||
    !doctor_crm ||
    !operator_id
  ) {
    return res.status(400).json({
      message: "Dados obrigatórios não informados"
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const validLinks = await tx.health_unit_specialty.findMany({
        where: {
          health_unit_id,
          specialty_id: { in: specialty_ids }
        }
      });

      if (validLinks.length !== specialty_ids.length) {
        throw new Error("Especialidade não vinculada à unidade");
      }

      for (const specialty_id of specialty_ids) {
        await tx.restriction_event.create({
          data: {
            health_unit_id,
            specialty_id,
            operator_id,
            doctor_name,
            doctor_crm,
            reason,
            start_time: new Date()
          }
        });

        await tx.health_unit_specialty.update({
          where: {
            health_unit_id_specialty_id: {
              health_unit_id,
              specialty_id
            }
          },
          data: {
            status: "restricted",
            updated_at: new Date()
          }
        });
      }
    });

    return res.status(201).json({ message: "Restrição registrada com sucesso" });

  } catch (error) {
    if (error.message === "Especialidade não vinculada à unidade") {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro interno ao registrar restrição" });
  }
});

/* =========================
   LISTAR RESTRIÇÕES ATIVAS
========================= */
router.get("/active", async (req, res) => {
  const events = await prisma.restriction_event.findMany({
    where: { end_time: null },
    include: {
      health_unit: true,
      specialty: true
    },
    orderBy: { start_time: "desc" }
  });

  res.json(events);
});

/* =========================
   REABRIR PLANTÃO
========================= */
router.post("/:id/reopen", async (req, res) => {
  const id = Number(req.params.id);

  const event = await prisma.restriction_event.findUnique({ where: { id } });
  if (!event || event.end_time) {
    return res.status(400).json({ message: "Restrição inválida" });
  }

  const endTime = new Date();
  const durationMinutes = Math.floor(
    (endTime - event.start_time) / 60000
  );

  await prisma.$transaction(async (tx) => {
    await tx.restriction_event.update({
      where: { id },
      data: {
        end_time: endTime,
        duration_minutes: durationMinutes,
        close_type: "manual"
      }
    });

    await tx.health_unit_specialty.update({
      where: {
        health_unit_id_specialty_id: {
          health_unit_id: event.health_unit_id,
          specialty_id: event.specialty_id
        }
      },
      data: {
        status: "available",
        updated_at: endTime
      }
    });
  });

  res.json({ message: "Plantão reaberto com sucesso" });
});

export default router;
