import { prisma } from "../../lib/prisma.js";

// Helper para registrar atividades
async function createActivity(userId, type, data) {
  try {
    await prisma.activity.create({
      data: {
        userId: parseInt(userId),
        type,
        albumId: data.albumId || null,
        albumName: data.albumName || null,
        cardName: data.cardName || null,
        cardImage: data.cardImage || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Error creating activity:", error);
  }
}

export const getUserAlbums = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { userId: targetUserId, isPublic } = req.query;

    const whereClause = {};

    if (targetUserId) {
      whereClause.userId = parseInt(targetUserId);

      if (isPublic === "true" || isPublic === true) {
        whereClause.isPublic = true;
      }
    } else if (userId) {
      whereClause.userId = parseInt(userId);
    } else {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const albums = await prisma.album.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          take: 1,
          orderBy: { createdAt: "asc" },
          include: {
            card: {
              select: {
                imageUrl: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formata response com coverImage
    const formattedAlbums = albums.map((album) => ({
      ...album,
      coverImage: album.items[0]?.card?.imageUrl || null,
    }));

    res.json(formattedAlbums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ message: "Erro ao buscar álbuns" });
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
            avatarUrl: true,
          },
        },
        items: {
          include: {
            card: {
              include: {
                set: true,
                rarity: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    if (!album.isPublic && (!userId || parseInt(userId) !== album.userId)) {
      return res.status(403).json({ message: "Álbum privado" });
    }

    res.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    res.status(500).json({ message: "Erro ao buscar álbum" });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, gameType, isPublic } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Nome do álbum é obrigatório" });
    }

    const album = await prisma.album.create({
      data: {
        name: name.trim(),
        gameType: gameType || "pokemon",
        isPublic: isPublic || false,
        userId: parseInt(userId),
      },
    });

    // Registra atividade
    await createActivity(userId, "ALBUM_CREATED", {
      albumId: album.id,
      albumName: album.name,
      metadata: { gameType: album.gameType },
    });

    res.status(201).json(album);
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ message: "Erro ao criar álbum" });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { name, description, gameType, isPublic } = req.body;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
    });

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    if (album.userId !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Sem permissão para editar este álbum" });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (gameType) updateData.gameType = gameType;
    if (typeof isPublic === "boolean") updateData.isPublic = isPublic;

    const updatedAlbum = await prisma.album.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Registra atividade
    await createActivity(userId, "ALBUM_UPDATED", {
      albumId: updatedAlbum.id,
      albumName: updatedAlbum.name,
      metadata: { changes: Object.keys(updateData) },
    });

    res.json(updatedAlbum);
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ message: "Erro ao atualizar álbum" });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
    });

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    if (album.userId !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Sem permissão para deletar este álbum" });
    }

    await prisma.album.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Álbum deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ message: "Erro ao deletar álbum" });
  }
};

export const addCardToAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.sub;
    const { cardId, customName, customImage, notes } = req.body;

    console.log("📝 addCardToAlbum chamado:", {
      albumId: id,
      userId,
      cardId,
      customName,
      customImage,
      notes,
    });

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
    });

    if (!album) {
      console.error("❌ Álbum não encontrado:", id);
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    if (album.userId !== parseInt(userId)) {
      console.error("❌ Sem permissão:", { albumUserId: album.userId, userId });
      return res
        .status(403)
        .json({ message: "Sem permissão para adicionar cartas neste álbum" });
    }

    console.log("✅ Criando AlbumItem...");

    const albumItem = await prisma.albumItem.create({
      data: {
        albumId: parseInt(id),
        cardId: cardId ? parseInt(cardId) : null,
        customName: customName || null,
        customImage: customImage || null,
        notes: notes || null,
      },
      include: {
        card: {
          include: {
            set: true,
            rarity: true,
          },
        },
      },
    });

    console.log("✅ AlbumItem criado:", albumItem);

    // Registra atividade
    await createActivity(userId, "CARD_ADDED", {
      albumId: album.id,
      albumName: album.name,
      cardName: albumItem.card?.nameEn || customName || "Carta personalizada",
      cardImage: albumItem.card?.imageUrl || customImage || null,
    });

    res.status(201).json(albumItem);
  } catch (error) {
    console.error("❌ Error adding card to album:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Erro ao adicionar carta ao álbum",
      error: error.message,
    });
  }
};

export const removeCardFromAlbum = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.id || req.user.sub;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
    });

    if (!album) {
      return res.status(404).json({ message: "Álbum não encontrado" });
    }

    if (album.userId !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Sem permissão para remover cartas deste álbum" });
    }

    const albumItem = await prisma.albumItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        card: {
          select: {
            nameEn: true,
            imageUrl: true,
          },
        },
      },
    });

    await prisma.albumItem.delete({
      where: { id: parseInt(itemId) },
    });

    // Registra atividade
    if (albumItem) {
      await createActivity(userId, "CARD_REMOVED", {
        albumId: album.id,
        albumName: album.name,
        cardName: albumItem.card?.nameEn || albumItem.customName || "Carta",
        cardImage: albumItem.card?.imageUrl || albumItem.customImage || null,
      });
    }

    res.json({ message: "Carta removida do álbum com sucesso" });
  } catch (error) {
    console.error("Error removing card from album:", error);
    res.status(500).json({ message: "Erro ao remover carta do álbum" });
  }
};
