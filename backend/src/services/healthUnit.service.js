import prisma from "../config/database.js";

export async function fetchHealthUnitsStatus() {
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

  return units.map((unit) => ({
    id: unit.id,
    name: unit.name,
    address: {
      street: unit.street,
      district: unit.district,
      city: unit.city,
      zip_code: unit.zip_code,
    },
    phones: [unit.phone1, unit.phone2, unit.phone3].filter(Boolean),
    specialties: unit.health_unit_specialty.map((hus) => ({
      id: hus.specialty.id,
      name: hus.specialty.name,
      status: hus.status, // available | restricted | awaiting_confirmation
      updated_at: hus.updated_at,
    })),
  }));
}
