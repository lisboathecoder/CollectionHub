import * as CardModel from "../../models/Pokemon/cardModel.js";
import { prisma } from "../../lib/prisma.js";

export const listarCards = async (req, res) => {
  try {
    const result = await CardModel.list(req.query);

    // Se não encontrou cards no banco e tem um set especificado, tenta buscar da API TCGDex
    if (
      (!result || !result.items || result.items.length === 0) &&
      req.query.set
    ) {
      const setCode = req.query.set;

      try {
        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards?set=${setCode}`
        );

        if (response.ok) {
          const externalCards = await response.json();

          // Formata os dados para o formato esperado pelo frontend
          const formattedCards = externalCards.map((card) => ({
            id: card.id,
            nameEn: card.name,
            nameJp: card.localId || card.name,
            number: parseInt(card.localId?.split("-")[1]) || 0,
            setCode: setCode,
            imageUrl: card.image,
            rarity: {
              name: card.rarity || "Common",
            },
          }));

          return res.status(200).json(formattedCards);
        }
      } catch (apiError) {
        console.error("Error fetching from TCGDex:", apiError);
      }
    }

    if (!result || !result.items || result.items.length === 0) {
      return res.status(404).json({
        mensagem: "Não há cards (cartas) na lista.",
        cards: [],
      });
    }

    res.status(200).json(result.items);
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500,
    });
  }
};

export const listarPorSetENumero = async (req, res) => {
  try {
    const { set, number } = req.params;

    const numberInt = parseInt(number);
    if (isNaN(numberInt)) {
      return res.status(400).json({
        erro: 'Parâmetro "number" inválido.',
        mensagem: 'O "number" fornecido não é um número.',
      });
    }

    const card = await CardModel.getByComposite(set, numberInt);

    if (!card) {
      return res.status(404).json({
        erro: "Card (carta) não encontrado.",
        mensagem: 'Verifique os parâmetros "set" e "number".',
        set: set,
        number: numberInt,
      });
    }

    res.status(200).json({
      mensagem: "Card (carta) encontrado com sucesso.",
      card: card,
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500,
    });
  }
};

export const listarPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: "ID inválido.",
        mensagem: "O ID fornecido não é um número.",
      });
    }

    const card = await CardModel.get(id);

    if (!card) {
      return res.status(404).json({
        erro: "Card (carta) não encontrado.",
        mensagem: "Verifique o id do card.",
        id: id,
      });
    }

    res.status(200).json({
      mensagem: "Card (carta) encontrado com sucesso.",
      card: card,
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500,
    });
  }
};

export const criarCard = async (req, res) => {
  try {
    const novoCard = await CardModel.create(req.body);

    res.status(201).json({
      mensagem: "Card (carta) criado com sucesso!",
      card: novoCard,
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao criar card (carta)",
      detalhes: e.message,
    });
  }
};

export const atualizarCard = async (req, res) => {
  try {
    const { set, number } = req.params;
    const dados = req.body;

    const cardExiste = await CardModel.getByComposite(set, number);

    if (!cardExiste) {
      return res.status(404).json({
        erro: 'Card (carta) com esse "set" e "number" não foi encontrado',
        set: set,
        number: number,
      });
    }

    const cardAtualizado = await CardModel.updateByComposite(
      set,
      number,
      dados
    );

    res.status(200).json({
      mensagem: "Card (carta) atualizado com sucesso!",
      card: cardAtualizado,
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao atualizar card (carta)",
      detalhes: e.message,
    });
  }
};

export const deletarCard = async (req, res) => {
  try {
    const { set, number } = req.params;
    const numberInt = parseInt(number);

    const cardExiste = await CardModel.getByComposite(set, numberInt);

    if (!cardExiste) {
      return res.status(404).json({
        erro: 'Card (carta) com esse "set" e "number" não encontrado',
        set: set,
        number: numberInt,
      });
    }

    await CardModel.removeByComposite(set, numberInt);

    res.status(200).json({
      mensagem: "Card (carta) apagado com sucesso!",
      cardRemovido: cardExiste,
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao apagar card (carta)",
      detalhes: e.message,
    });
  }
};

// Global search endpoint - cards and collections
export const searchGlobal = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: "Query parameter 'q' is required",
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Search cards by name (using ILIKE for case-insensitive)
    const cards = await prisma.card.findMany({
      where: {
        nameEn: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      include: {
        set: true,
        rarity: true,
      },
      take: 10,
    });

    // Search collections/sets by name
    const collections = await prisma.set.findMany({
      where: {
        OR: [
          {
            nameEn: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            code: {
              contains: searchTerm.toUpperCase(),
              mode: "insensitive",
            },
          },
        ],
      },
      take: 5,
    });

    // Format results for frontend
    const formattedCards = cards.map((card) => ({
      id: card.id,
      nameEn: card.nameEn,
      number: card.number,
      setCode: card.setCode,
      imageUrl: card.imageUrl,
      rarity: card.rarity?.name,
    }));

    const formattedCollections = collections.map((set) => ({
      id: set.id,
      name: set.nameEn,
      code: set.code,
    }));

    res.status(200).json({
      cards: formattedCards,
      collections: formattedCollections,
      total: formattedCards.length + formattedCollections.length,
    });
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({
      error: "Internal server error",
      details: e.message,
    });
  }
};
