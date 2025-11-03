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
<<<<<<< HEAD
      nameEn: data.nameEn,
      releaseDate: data.releaseDate,
      count: data.count
=======
      name: data.name,
      releaseDate: data.releaseDate,
>>>>>>> e9fb0b3d04d5237bf953047942fdcbefef43da8f
    }
  });
};

export const update = async (code, data) => {
  return prisma.set.update({
    where: { code },
    data: {
<<<<<<< HEAD
      ...(data.nameEn && { nameEn: data.nameEn }),
      ...(data.releaseDate && { releaseDate: data.releaseDate }),
      ...(data.count && { count: data.count })
=======
      ...(data.name && { name: data.name }),
      ...(data.releaseDate && { releaseDate: data.releaseDate }),
>>>>>>> e9fb0b3d04d5237bf953047942fdcbefef43da8f
    }
  });
};

export const remove = async (code) => {
  return prisma.set.delete({ 
    where: { code } 
  });
};