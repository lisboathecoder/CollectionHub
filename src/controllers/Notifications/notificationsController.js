import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all notifications for user
export const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  const userId = req.user.id;

  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Você não pode marcar esta notificação" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { isRead: true }
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: "Todas as notificações marcadas como lidas" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Você não pode deletar esta notificação" });
    }

    await prisma.notification.delete({
      where: { id: parseInt(notificationId) }
    });

    res.json({ message: "Notificação deletada" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true
      }
    });

    res.json({ message: "Notificações lidas deletadas" });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
