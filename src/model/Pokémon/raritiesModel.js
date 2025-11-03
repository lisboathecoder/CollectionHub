import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const list = async () => {
  return prisma.rarity.findMany({ 
    orderBy: { code: "asc" } 
  });
};

export const get = async (code) => {
  return prisma.rarity.findUnique({ 
    where: { code } 
  });
};

export const create = async (data) => {
  return prisma.rarity.create({
    data: {
      code: data.code,
      name: data.name,
    }
  });
};

export const update = async (code, data) => {
  return prisma.rarity.update({
    where: { code },
    data: {
      ...(data.name && { name: data.name }),
    }
  });
};

export const remove = async (code) => {
  return prisma.rarity.delete({ 
    where: { code } 
  });
};