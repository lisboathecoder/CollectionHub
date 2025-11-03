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
      nameEn: data.nameEn,
      releaseDate: data.releaseDate,
      count: data.count
    }
  });
};

export const update = async (code, data) => {
  return prisma.set.update({
    where: { code },
    data: {
      ...(data.nameEn && { nameEn: data.nameEn }),
      ...(data.releaseDate && { releaseDate: data.releaseDate }),
      ...(data.count && { count: data.count })
    }
  });
};

export const remove = async (code) => {
  return prisma.set.delete({ 
    where: { code } 
  });
};