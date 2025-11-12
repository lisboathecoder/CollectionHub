import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const includeCard = {
  set: true,
  rarity: true,
  packs: true
};

export const list = async ({ q, set, number, rarity, page = 1, pageSize = 50, orderBy = 'default' }) => {
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

  let orderByClause;
  if (orderBy === 'rarity') {
    orderByClause = [
      { rarity: { code: 'desc' } },
      { number: 'asc' }
    ];
  } else {
    orderByClause = [
      { setCode: "asc" }, 
      { number: "asc" }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.card.findMany({
      where,
      include: includeCard,
      skip,
      take: Number(pageSize),
      orderBy: orderByClause,
    }),
    prisma.card.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: Number(pageSize) };
};

export const getByComposite = async (setCode, number) => {
  return prisma.card.findUnique({
    where: { setCode_number: { setCode, number: Number(number) } },
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
    include: includeCard,
  });
};

export const removeByComposite = async (setCode, number) => {
  return prisma.card.delete({
    where: { setCode_number: { setCode, number: Number(number) } },
  });
};