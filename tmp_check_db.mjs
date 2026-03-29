import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const run = async () => {
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true, isActive: true },
  });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, branchId: true },
  });

  console.log("BRANCHES:", branches);
  console.log("USERS:", users);
};

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
