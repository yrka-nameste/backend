import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const BRANCH_NAME = "Филиал Тирасполь";
const GROUP_NAME = "Группа A (тест)";

const run = async () => {
  const branch = await prisma.branch.findFirst({ where: { name: BRANCH_NAME } });
  if (!branch) throw new Error("Branch not found: " + BRANCH_NAME);

  const group = await prisma.group.create({
    data: {
      branchId: branch.id,
      name: GROUP_NAME,
      year: new Date().getFullYear(),
      isActive: true,
    },
    select: { id: true, name: true, branchId: true },
  });

  console.log("CREATED GROUP:", group);
};

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
