import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const includeAlbum = {
  user: {
    select: {
      id: true,
      username: true,
      email: true
    }
  },
  items: {
    include: {
      card: {
        include: {
          set: true,
          rarity: true
        }
      }
    }
  }
};

export const list = async (userId) => {
  return prisma.album.findMany({
    where: { userId: Number(userId) },
    include: includeAlbum,
    orderBy: { createdAt: 'desc' }
  });
};

export const get = async (id) => {
  return prisma.album.findUnique({
    where: { id: Number(id) },
    include: includeAlbum
  });
};

export const create = async (data) => {
  return prisma.album.create({
    data: {
      userId: data.userId,
      name: data.name,
      isPublic: data.isPublic || false
    },
    include: includeAlbum
  });
};

export const update = async (id, data) => {
  return prisma.album.update({
    where: { id: Number(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic })
    },
    include: includeAlbum
  });
};

export const remove = async (id) => {
  return prisma.album.delete({
    where: { id: Number(id) }
  });
};

export const addItem = async (albumId, itemData) => {
  return prisma.albumItem.create({
    data: {
      albumId: Number(albumId),
      cardId: itemData.cardId ? Number(itemData.cardId) : null,
      customName: itemData.customName || null,
      customImage: itemData.customImage || null,
      quantity: itemData.quantity || 1,
      notes: itemData.notes || null
    },
    include: {
      card: {
        include: {
          set: true,
          rarity: true
        }
      }
    }
  });
};

export const updateItem = async (itemId, data) => {
  return prisma.albumItem.update({
    where: { id: Number(itemId) },
    data: {
      ...(data.quantity && { quantity: data.quantity }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.customName && { customName: data.customName }),
      ...(data.customImage && { customImage: data.customImage })
    },
    include: {
      card: {
        include: {
          set: true,
          rarity: true
        }
      }
    }
  });
};

export const removeItem = async (itemId) => {
  return prisma.albumItem.delete({
    where: { id: Number(itemId) }
  });
};
