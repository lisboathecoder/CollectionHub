import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findAll = async () => {
    return await prisma.user.findMany({
        orderBy: { id: 'asc' },
    });
};

export const findOne = async (id) => {
    return await prisma.user.findUnique({
        where: { id: Number(id) },
    });
};

export const create = async (data) => {
    return await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: data.password,
        },
    });
};

export const deletar = async (id) => {
    return await prisma.user.delete({
        where: { id: Number(id) },
    });
};

export const atualizar = async (id, data) => {
    return await prisma.user.update({
        where: { id: Number(id) },
        data: {
            ...(data.username && { username: data.username }),
            ...(data.email && { email: data.email }),
            ...(data.password && { password: data.password }),
        },
    });
};

export const findByUsernameOrEmail = async (username, email) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });
};

export const update2FACode = async (id, code, expires) => {
    return await prisma.user.update({
        where: { id: Number(id) },
        data: {
            twoFactorCode: code,
            twoFactorExpires: expires
        }
    });
};

export const clear2FACode = async (id) => {
    return await prisma.user.update({
        where: { id: Number(id) },
        data: {
            twoFactorCode: null,
            twoFactorExpires: null
        }
    });
};
