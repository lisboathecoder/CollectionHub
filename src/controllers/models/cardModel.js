import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  async list(query = {}) {
    const where = {};
    if (query.set) where.setCode = query.set;
    if (query.rarityCode) where.rarityCode = query.rarityCode;
    if (query.name) where.nameEn = { contains: query.name, mode: 'insensitive' };

    const take = query.limit ? Number(query.limit) : undefined;
    const skip = query.offset ? Number(query.offset) : undefined;

    return prisma.card.findMany({
      where,
      include: { set: true, rarity: true, packs: true },
      take,
      skip,
      orderBy: [{ setCode: 'asc' }, { number: 'asc' }],
    });
  },

  async getByComposite(setCode, number) {
    return prisma.card.findFirst({
      where: { setCode, number: Number(number) },
      include: { set: true, rarity: true, packs: true },
    });
  },

  async get(id) {
    return prisma.card.findUnique({ where: { id: Number(id) }, include: { set: true, rarity: true, packs: true } });
  },

  async create(data) {
    const { packs, ...rest } = data;
    const createData = { ...rest };
    if (packs && Array.isArray(packs) && packs.length) {
      createData.packs = { connect: packs.map((name) => ({ setCode_name: { setCode: rest.setCode, name } })) };
    }
    return prisma.card.create({ data: createData, include: { set: true, rarity: true, packs: true } });
  },

  async updateByComposite(setCode, number, data) {
    const { packs, ...rest } = data;
    const updateData = { ...rest };
    if (packs && Array.isArray(packs)) {
      // replace relation: disconnect all then connect provided (simple approach)
      updateData.packs = {
        set: [],
        connect: packs.map((name) => ({ setCode_name: { setCode, name } })),
      };
    }
    return prisma.card.update({
      where: { setCode_number: { setCode, number: Number(number) } },
      data: updateData,
      include: { set: true, rarity: true, packs: true },
    });
  },

  async removeByComposite(setCode, number) {
    return prisma.card.delete({ where: { setCode_number: { setCode, number: Number(number) } } });
  },
};
