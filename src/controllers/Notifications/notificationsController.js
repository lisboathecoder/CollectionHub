import { prisma } from "../../lib/prisma.js";

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { limit = 20, unreadOnly = false } = req.query;

    const where = {
      userId: parseInt(userId)
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Parse metadata JSON
    const parsedNotifications = notifications.map(notification => ({
      ...notification,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null
    }));

    res.json(parsedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub;

    const count = await prisma.notification.count({
      where: {
        userId: parseInt(userId),
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Erro ao buscar contagem de não lidas' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    if (notification.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para marcar esta notificação' });
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Erro ao marcar notificação' });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;

    await prisma.notification.updateMany({
      where: {
        userId: parseInt(userId),
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: 'Todas notificações marcadas como lidas' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Erro ao marcar todas como lidas' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    if (notification.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para deletar esta notificação' });
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Notificação deletada' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Erro ao deletar notificação' });
  }
};
