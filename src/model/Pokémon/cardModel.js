<<<<<<< HEAD
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
=======
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const includeCard = {
  set: true,
  rarity: true,
  packs: true
};

export const list = async ({ q, set, number, rarity, page = 1, pageSize = 50 }) => {
  const where = {};
  if (set) where.setCode = set;
  if (number) where.number = Number(number);
  if (rarity) where.rarityCode = rarity;
  if (q) {
    where.OR = [
      { nameEn: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(pageSize);


  const [items, total] = await Promise.all([
    prisma.card.findMany({
      where,
      include: includeCard,
      skip,
      take: Number(pageSize),
      orderBy: [{ setCode: "asc" }, { number: "asc" }],
    }),
    prisma.card.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: Number(pageSize) };
};

export const getByComposite = async (setCode, number) => {
  return prisma.card.findUnique({
    where: { setCode_number: { setCode, number: Number(number) } },
>>>>>>> e9fb0b3d04d5237bf953047942fdcbefef43da8f
    include: includeCard,
  });
};

export const get = async (id) => {
<<<<<<< HEAD
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
=======
  return prisma.card.findUnique({
    where: { id: Number(id) },
    include: includeCard
  });
};


export const create = async (data) => {
  const { packs, ...rest } = data; 
  const connectPacks = (packs || []).map((p) => ({
    setCode_name: { setCode: rest.setCode, name: p },
  }));

  return prisma.card.create({
    data: {
      setCode: rest.setCode,
      number: rest.number,
      nameEn: rest.nameEn,
      namePt: rest.namePt,
      rarityCode: rest.rarityCode,
      slug: rest.slug,
      
      packs: { connect: connectPacks }
    },
    include: includeCard,
  });
};


export const updateByComposite = async (setCode, number, data) => {
  const { packs, ...rest } = data;
  const connectPacks = (packs || []).map((p) => ({
    setCode_name: { setCode, name: p },
  }));

  return prisma.card.update({
    where: { setCode_number: { setCode, number: Number(number) } },
    data: {
      ...(rest.number && { number: rest.number }),
      ...(rest.nameEn && { nameEn: rest.nameEn }),
      ...(rest.namePt && { namePt: rest.namePt }),
      ...(rest.rarityCode && { rarityCode: rest.rarityCode }),
      ...(rest.slug && { slug: rest.slug }),

      ...(packs && packs.length > 0 && { packs: { connect: connectPacks } })
    },
>>>>>>> e9fb0b3d04d5237bf953047942fdcbefef43da8f
    include: includeCard,
  });
};

export const removeByComposite = async (setCode, number) => {
<<<<<<< HEAD
  return prisma.card.delete({ 
    where: { setCode_number: { setCode, number: Number(number) } } 
=======
  return prisma.card.delete({
    where: { setCode_number: { setCode, number: Number(number) } },
>>>>>>> e9fb0b3d04d5237bf953047942fdcbefef43da8f
  });
};