import { prisma } from "../../lib/prisma.js";

export const getUserActivities = async (req, res) => {
  try {
    const authenticatedUserId = req.user.id || req.user.sub;
    const { limit = 20, userId: targetUserId } = req.query;

    // If targetUserId is provided, use it; otherwise use authenticated user's ID
    const userId = targetUserId
      ? parseInt(targetUserId)
      : parseInt(authenticatedUserId);

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
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
