import * as CardModel from "../../models/Pokemon/cardModel.js";
import prisma from "../../lib/prisma.js";

export const listarCards = async (req, res) => {
  try {
    const result = await CardModel.list(req.query);

    if (!result || !result.items || result.items.length === 0) {
      return res.status(404).json({
        mensagem: "Não há cards (cartas) na lista.",
        cards: [],
      });
    }

    if (!result || !result.items || result.items.length === 0) {
      return res.status(404).json({
        mensagem: "Não há cards (cartas) na lista.",
        cards: [],
      });
    }

    res.status(200).json({
      total: result.total,
      mensagem: "Lista de cards (cartas)",
      cards: result.items
    });
    
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

    // Retornar card direto para compatibilidade com frontend
    res.status(200).json(card);
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

export const searchGlobal = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        erro: "Parâmetro de Query 'q' é obrigatório",
      });
    }

    const searchTerm = q.trim().toLowerCase();

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
      erro: "Erro interno do servidor",
      details: e.message,
    });
  }
};
