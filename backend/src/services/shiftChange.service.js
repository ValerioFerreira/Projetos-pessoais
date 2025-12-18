import prisma from "../config/database.js";

export async function handleShiftChange() {
  const now = new Date();

  const hour = now.getHours();
  const minute = now.getMinutes();

  if (!((hour === 7 || hour === 19) && minute === 0)) {
    return;
  }

  console.log(
    `[SHIFT CHANGE - TEST] Executando troca de plantão às ${hour}:${String(
      minute
    ).padStart(2, "0")}`
  );

  // Buscar todas as restrições ativas
  const activeEvents = await prisma.restriction_event.findMany({
    where: {
      end_time: null,
    },
  });

  for (const event of activeEvents) {
    const endTime = new Date(now);

    const durationMinutes = Math.floor(
      (endTime - event.start_time) / 60000
    );

    // 1. Encerrar evento
    await prisma.restriction_event.update({
      where: { id: event.id },
      data: {
        end_time: endTime,
        duration_minutes: durationMinutes,
        close_type: "shift_change",
      },
    });
  }

  console.log(
    `[SHIFT CHANGE - TEST] ${activeEvents.length} restrições encerradas`
  );
}
