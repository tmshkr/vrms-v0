import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient();

prisma.$use(async (params, next) => {
  // TODO: handle updateMany
  if (params.action === "update") {
    params.args.data.updated_at = new Date();
  }
  return next(params);
});

export default prisma;
