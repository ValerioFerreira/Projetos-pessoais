import dotenv from "dotenv";
dotenv.config();

import prisma from "./config/database.js";

async function test() {
  const result = await prisma.health_unit.findMany();
  console.log(result);
}

test()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
