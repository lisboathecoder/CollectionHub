import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const list = async () => {
  return prisma.set.findMany({ 
    orderBy: { code: "asc" } 
  });
};

export const get = async (code) => {
  return prisma.set.findUnique({ 
    where: { code } 
  });
};

export const create = async (data) => {
  return prisma.set.create({
    data: {
      code: data.code,
      name: data.name,
      releaseDate: data.releaseDate,
    }
  });
};

export const update = async (code, data) => {
  return prisma.set.update({
    where: { code },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.releaseDate && { releaseDate: data.releaseDate }),
    }
  });
};

export const remove = async (code) => {
  return prisma.set.delete({ 
    where: { code } 
  });
};