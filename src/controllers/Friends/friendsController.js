import { prisma } from "../../lib/prisma.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user.sub;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'ID do destinatário é obrigatório' });
    }

    if (parseInt(requesterId) === parseInt(receiverId)) {
      return res.status(400).json({ message: 'Você não pode enviar solicitação de amizade para si mesmo' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: parseInt(requesterId), receiverId: parseInt(receiverId) },
          { requesterId: parseInt(receiverId), receiverId: parseInt(requesterId) }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Solicitação de amizade já existe' });
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: parseInt(requesterId),
        receiverId: parseInt(receiverId),
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true
          }
        }
      }
    });

    // Create notification for receiver
    const requester = await prisma.user.findUnique({
      where: { id: parseInt(requesterId) },
      select: { username: true, nickname: true }
    });

    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'friend_request',
        title: 'Nova solicitação de amizade',
        message: `${requester.username} enviou uma solicitação de amizade`,
        metadata: JSON.stringify({ friendshipId: friendship.id, requesterId: parseInt(requesterId) })
      }
    });

    res.status(201).json(friendship);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Erro ao enviar solicitação de amizade' });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    if (friendship.receiverId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para aceitar esta solicitação' });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitação já foi processada' });
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendshipId) },
      data: { status: 'accepted' },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true
          }
        }
      }
    });

    // Create notification for requester
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { username: true, nickname: true }
    });

    await prisma.notification.create({
      data: {
        userId: friendship.requesterId,
        type: 'friend_accepted',
        title: 'Solicitação aceita',
        message: `${receiver.username} aceitou sua solicitação de amizade`,
        metadata: JSON.stringify({ friendshipId: friendship.id, userId: parseInt(userId) })
      }
    });

    res.json(updatedFriendship);
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Erro ao aceitar solicitação' });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    if (friendship.receiverId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para rejeitar esta solicitação' });
    }

    await prisma.friendship.update({
      where: { id: parseInt(friendshipId) },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Solicitação rejeitada' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Erro ao rejeitar solicitação' });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendshipId) }
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Amizade não encontrada' });
    }

    if (friendship.requesterId !== parseInt(userId) && friendship.receiverId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para remover esta amizade' });
    }

    await prisma.friendship.delete({
      where: { id: parseInt(friendshipId) }
    });

    res.json({ message: 'Amizade removida' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Erro ao remover amizade' });
  }
};

// Get user's friends
export const getUserFriends = async (req, res) => {
  try {
    const userId = req.user.sub;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: parseInt(userId), status: 'accepted' },
          { receiverId: parseInt(userId), status: 'accepted' }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
            bio: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
            bio: true
          }
        }
      }
    });

    // Format response to show the friend (not the current user)
    const friends = friendships.map(f => {
      const friend = f.requesterId === parseInt(userId) ? f.receiver : f.requester;
      return {
        friendshipId: f.id,
        ...friend
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Erro ao buscar amigos' });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.sub;

    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: parseInt(userId),
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Erro ao buscar solicitações pendentes' });
  }
};

// Check friendship status
export const checkFriendshipStatus = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { targetUserId } = req.params;

    if (parseInt(userId) === parseInt(targetUserId)) {
      return res.json({ status: 'self' });
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: parseInt(userId), receiverId: parseInt(targetUserId) },
          { requesterId: parseInt(targetUserId), receiverId: parseInt(userId) }
        ]
      }
    });

    if (!friendship) {
      return res.json({ status: 'none', friendshipId: null });
    }

    const isRequester = friendship.requesterId === parseInt(userId);
    
    res.json({
      status: friendship.status,
      friendshipId: friendship.id,
      isRequester
    });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ message: 'Erro ao verificar status de amizade' });
  }
};
