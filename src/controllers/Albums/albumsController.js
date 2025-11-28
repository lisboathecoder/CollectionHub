import { prisma } from "../../lib/prisma.js";
export const getUserAlbums = async (req, res) => {
  try {
    const userId = req.user.sub;

    const albums = await prisma.album.findMany({
      where: { userId: parseInt(userId) },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Erro ao buscar álbuns' });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }

    if (!album.isPublic && (!userId || parseInt(userId) !== album.userId)) {
      return res.status(403).json({ message: 'Álbum privado' });
    }

    res.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ message: 'Erro ao buscar álbum' });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, gameType, isPublic } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Nome do álbum é obrigatório' });
    }

    const album = await prisma.album.create({
      data: {
        name: name.trim(),
        gameType: gameType || 'pokemon',
        isPublic: isPublic || false,
        userId: parseInt(userId)
      }
    });

    res.status(201).json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ message: 'Erro ao criar álbum' });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { name, isPublic } = req.body;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }

    if (album.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para editar este álbum' });
    }

    const updatedAlbum = await prisma.album.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(typeof isPublic === 'boolean' && { isPublic })
      }
    });

    res.json(updatedAlbum);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ message: 'Erro ao atualizar álbum' });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }

    if (album.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para deletar este álbum' });
    }

    await prisma.album.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Álbum deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ message: 'Erro ao deletar álbum' });
  }
};

export const addCardToAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { cardId, customName, customImage, quantity, notes } = req.body;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }

    if (album.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para adicionar cartas neste álbum' });
    }

    const albumItem = await prisma.albumItem.create({
      data: {
        albumId: parseInt(id),
        cardId: cardId ? parseInt(cardId) : null,
        customName,
        customImage,
        quantity: quantity || 1,
        notes
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

    res.status(201).json(albumItem);
  } catch (error) {
    console.error('Error adding card to album:', error);
    res.status(500).json({ message: 'Erro ao adicionar carta ao álbum' });
  }
};

export const removeCardFromAlbum = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.sub;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }

    if (album.userId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Sem permissão para remover cartas deste álbum' });
    }

    await prisma.albumItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({ message: 'Carta removida do álbum com sucesso' });
  } catch (error) {
    console.error('Error removing card from album:', error);
    res.status(500).json({ message: 'Erro ao remover carta do álbum' });
  }
};