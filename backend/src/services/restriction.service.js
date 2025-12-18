import prisma from "../config/database.js";

/* ======================================================
   FECHAR / CRIAR RESTRIÇÃO (JÁ EXISTENTE)
====================================================== */
export async function closeRestrictionService(data) {
  const {
    health_unit_id,
    specialty_ids,
    doctor_name,
    doctor_crm,
    reason,
    operator_id,
  } = data;

  if (
    !health_unit_id ||
    !specialty_ids ||
    specialty_ids.length === 0 ||
    !doctor_name ||
    !doctor_crm ||
    !operator_id
  ) {
    throw new Error("Dados obrigatórios não informados");
  }

  return prisma.$transaction(async (tx) => {
    // validar vínculo unidade x especialidade
    const validLinks = await tx.health_unit_specialty.findMany({
      where: {
        health_unit_id,
        specialty_id: { in: specialty_ids },
      },
    });

    if (validLinks.length !== specialty_ids.length) {
      throw new Error("Especialidade não vinculada à unidade");
    }

    const events = [];

    for (const specialty_id of specialty_ids) {
      // criar evento
      const event = await tx.restriction_event.create({
        data: {
          health_unit_id,
          specialty_id,
          operator_id,
          doctor_name,
          doctor_crm,
          reason,
          start_time: new Date(),
        },
      });

      // atualizar status
      await tx.health_unit_specialty.update({
        where: {
          health_unit_id_specialty_id: {
            health_unit_id,
            specialty_id,
          },
        },
        data: {
          status: "restricted",
          updated_at: new Date(),
        },
      });

      events.push(event);
    }

    return {
      message: "Restrição registrada com sucesso",
      events,
    };
  });
}

/* ======================================================
   REABRIR RESTRIÇÃO (NOVA FUNÇÃO)
====================================================== */
export async function reopenRestrictionService(restrictionId) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.restriction_event.findUnique({
      where: { id: restrictionId },
    });

    if (!event || event.end_time) {
      throw new Error("Restrição não encontrada ou já encerrada");
    }

    const endTime = new Date();
    const durationMinutes = Math.floor(
      (endTime - event.start_time) / 60000
    );

    // encerrar evento
    await tx.restriction_event.update({
      where: { id: restrictionId },
      data: {
        end_time: endTime,
        duration_minutes: durationMinutes,
        close_type: "manual",
      },
    });

    // liberar status
    await tx.health_unit_specialty.update({
      where: {
        health_unit_id_specialty_id: {
          health_unit_id: event.health_unit_id,
          specialty_id: event.specialty_id,
        },
      },
      data: {
        status: "available",
        updated_at: endTime,
      },
    });

    return {
      message: "Plantão reaberto com sucesso",
      restriction_id: restrictionId,
    };
  });
}
