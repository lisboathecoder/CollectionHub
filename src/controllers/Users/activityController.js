import { prisma } from "../../lib/prisma.js";

export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub;
    const { limit = 20 } = req.query;

    const activities = await prisma.activity.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit),
    });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Erro ao buscar atividades" });
  }
};
