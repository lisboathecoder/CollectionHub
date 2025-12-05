import prisma from "../../lib/prisma.js";

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ error: "ID da carta é obrigatório" });
    }

    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        set: true,
        rarity: true,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Carta não encontrada" });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_cardId: {
          userId: userId,
          cardId: parseInt(cardId),
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: "Carta já está nos favoritos" });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        cardId: parseInt(cardId),
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

    // Criar atividade de favorito
    await prisma.activity.create({
      data: {
        userId: userId,
        type: "CARD_FAVORITED",
        cardName: card.nameEn,
        cardImage: card.imageUrl,
        metadata: JSON.stringify({
          cardId: card.id,
          setName: card.set?.nameEn,
        }),
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    res.status(500).json({ error: "Erro ao adicionar favorito" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_cardId: {
          userId: userId,
          cardId: parseInt(cardId),
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: "Favorito não encontrado" });
    }

    await prisma.favorite.delete({
      where: {
        userId_cardId: {
          userId: userId,
          cardId: parseInt(cardId),
        },
      },
    });

    res.json({ message: "Favorito removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    res.status(500).json({ error: "Erro ao remover favorito" });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId: userId },
      include: {
        card: {
          include: {
            set: true,
            rarity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    res.status(500).json({ error: "Erro ao buscar favoritos" });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_cardId: {
          userId: userId,
          cardId: parseInt(cardId),
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Erro ao verificar favorito:", error);
    res.status(500).json({ error: "Erro ao verificar favorito" });
  }
};
