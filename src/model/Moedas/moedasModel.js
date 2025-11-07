import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

    export const getAllCoins = async () => {
        return await prisma.coin.findMany();
    }

    export const getCoinById = async (id) => {
        return await prisma.coin.findUnique({
            where: { id: id },
        });
    }

    export const createCoin = async (data) => {
        return await prisma.coin.create({
            data: data,
        });
    }

    export const updateCoin = async (id, data) => {
        return await prisma.coin.update({
            where: { id: id },
            data: data,
        });
    }

    export const deleteCoin = async (id) => {
        return await prisma.coin.delete({
            where: { id: id },
        });
    }
