import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const includeCard = { set: true, rarity: true, packs: true };

export const list = async (query = {}) => {
  const where = {};
  if (query.set) where.setCode = query.set;
  if (query.rarityCode) where.rarityCode = query.rarityCode;
  if (query.name) where.nameEn = { contains: query.name, mode: 'insensitive' };

  const take = query.limit ? Number(query.limit) : undefined;
  const skip = query.offset ? Number(query.offset) : undefined;

  return prisma.card.findMany({
    where,
    include: includeCard,
    take,
    skip,
    orderBy: [{ setCode: 'asc' }, { number: 'asc' }],
  });
};

export const getByComposite = async (setCode, number) => {
  return prisma.card.findFirst({
    where: { setCode, number: Number(number) },
    include: includeCard,
  });
};

export const get = async (id) => {
  return prisma.card.findUnique({ 
    where: { id: Number(id) }, 
    include: includeCard 
  });
};

export const create = async (data) => {
  const { packs, ...rest } = data;
  
  const createData = {
    setCode: rest.setCode,
    number: rest.number,
    nameEn: rest.nameEn,
    slug: rest.slug,
    imageName: rest.imageName,
    rarityCode: rest.rarityCode
  };
  
  if (packs && Array.isArray(packs) && packs.length) {
    createData.packs = { 
      connect: packs.map((name) => ({ setCode_name: { setCode: rest.setCode, name } })) 
    };
  }
  
  return prisma.card.create({ 
    data: createData, 
    include: includeCard 
  });
};

export const updateByComposite = async (setCode, number, data) => {
  const { packs, ...rest } = data;

  const updateData = {
    ...(rest.number && { number: rest.number }),
    ...(rest.nameEn && { nameEn: rest.nameEn }),
    ...(rest.slug && { slug: rest.slug }),
    ...(rest.imageName && { imageName: rest.imageName }),
    ...(rest.rarityCode && { rarityCode: rest.rarityCode })
  };
  
  if (packs && Array.isArray(packs)) {
    updateData.packs = {
      set: [],
      connect: packs.map((name) => ({ setCode_name: { setCode, name } })),
    };
  }
  
  return prisma.card.update({
    where: { setCode_number: { setCode, number: Number(number) } },
    data: updateData,
    include: includeCard,
  });
};

export const removeByComposite = async (setCode, number) => {
  return prisma.card.delete({ 
    where: { setCode_number: { setCode, number: Number(number) } } 
  });
};