import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Send friend request
export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const initiatorId = req.user.id; // From auth middleware

  try {
    // Check if users exist
    const [initiator, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: initiatorId } }),
      prisma.user.findUnique({ where: { id: parseInt(receiverId) } })
    ]);

    if (!receiver) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (initiatorId === parseInt(receiverId)) {
      return res.status(400).json({ error: "Você não pode enviar solicitação para si mesmo" });
    }

    // Check for existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId, receiverId: parseInt(receiverId) },
          { initiatorId: parseInt(receiverId), receiverId: initiatorId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ error: "Já existe uma solicitação de amizade" });
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        initiatorId,
        receiverId: parseInt(receiverId),
        status: 'pending'
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'friend_request',
        title: 'Nova solicitação de amizade',
        message: `${initiator.username} enviou uma solicitação de amizade`,
        metadata: JSON.stringify({ friendshipId: friendship.id, userId: initiatorId })
      }
    });

    res.status(201).json({ message: "Solicitação enviada com sucesso", friendship });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get friendship status between users
export const getFriendshipStatus = async (req, res) => {
  const userId = req.user.id;
  const { targetUserId } = req.params;

  try {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, receiverId: parseInt(targetUserId) },
          { initiatorId: parseInt(targetUserId), receiverId: userId }
        ]
      },
      include: {
        initiator: {
          select: { id: true, username: true, name: true }
        },
        receiver: {
          select: { id: true, username: true, name: true }
        }
      }
    });

    if (!friendship) {
      return res.json({ status: 'none' });
    }

    res.json({
      status: friendship.status,
      friendship,
      isInitiator: friendship.initiatorId === userId
    });
  } catch (error) {
    console.error("Error getting friendship status:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);
  } catch (error) {
    console.error("Error getting pending requests:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get list of friends
export const getFriends = async (req, res) => {
  const userId = req.user.id;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { initiatorId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Map to return the friend (not the current user)
    const friends = friendships.map(f => {
      const friend = f.initiatorId === userId ? f.receiver : f.initiator;
      return {
        ...friend,
        friendshipId: f.id,
        friendsSince: f.updatedAt
      };
    });

    res.json(friends);
  } catch (error) {
    console.error("Error getting friends:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get sent friend requests
export const getSentRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await prisma.friendship.findMany({
      where: {
        initiatorId: userId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);
  } catch (error) {
    console.error("Error getting sent requests:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { friendshipId } = req.params;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) },
      include: {
        initiator: {
          select: { id: true, username: true, name: true }
        }
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Solicitação não encontrada" });
    }

    if (friendship.receiverId !== userId) {
      return res.status(403).json({ error: "Você não pode aceitar esta solicitação" });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ error: "Esta solicitação já foi processada" });
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendshipId) },
      data: { status: 'accepted' }
    });

    // Create notification for initiator
    await prisma.notification.create({
      data: {
        userId: friendship.initiatorId,
        type: 'friend_accepted',
        title: 'Solicitação aceita',
        message: `Agora vocês são amigos!`,
        metadata: JSON.stringify({ friendshipId: friendship.id, userId })
      }
    });

    res.json({ message: "Solicitação aceita", friendship: updatedFriendship });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { friendshipId } = req.params;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Solicitação não encontrada" });
    }

    if (friendship.receiverId !== userId) {
      return res.status(403).json({ error: "Você não pode rejeitar esta solicitação" });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ error: "Esta solicitação já foi processada" });
    }

    // Delete the friendship request
    await prisma.friendship.delete({
      where: { id: parseInt(friendshipId) }
    });

    res.json({ message: "Solicitação rejeitada" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  const userId = req.user.id;
  const { friendshipId } = req.params;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Amizade não encontrada" });
    }

    // Check if user is part of this friendship
    if (friendship.initiatorId !== userId && friendship.receiverId !== userId) {
      return res.status(403).json({ error: "Você não pode remover esta amizade" });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: parseInt(friendshipId) }
    });

    res.json({ message: "Amizade removida" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Cancel sent friend request
export const cancelFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { friendshipId } = req.params;

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Solicitação não encontrada" });
    }

    if (friendship.initiatorId !== userId) {
      return res.status(403).json({ error: "Você não pode cancelar esta solicitação" });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ error: "Esta solicitação já foi processada" });
    }

    // Delete the friendship request
    await prisma.friendship.delete({
      where: { id: parseInt(friendshipId) }
    });

    res.json({ message: "Solicitação cancelada" });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
