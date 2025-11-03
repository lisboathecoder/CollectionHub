import * as CardModel from "../../model/Pokémon/cardModel.js";

export const listarCards = async (req, res) => {
  try {
    const cards = await CardModel.list(req.query);

    if (!cards || cards.length === 0) {
      return res.status(404).json({
        mensagem: "Não há cards (cartas) na lista.",
        cards: []
      });
    }

    res.status(200).json({
      total: cards.length,
      mensagem: "Lista de cards",
      cards: cards
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
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
            mensagem: 'O "number" fornecido não é um número.'
        });
    }

    const card = await CardModel.getByComposite(set, numberInt);

    if (!card) {
      return res.status(404).json({
        erro: 'Card (carta) não encontrado.',
        mensagem: 'Verifique os parâmetros "set" e "number".',
        set: set,
        number: numberInt
      });
    }

    res.status(200).json({
      mensagem: "Card (carta) encontrado com sucesso.",
      card: card
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const listarPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: 'ID inválido.',
        mensagem: 'O ID fornecido não é um número.'
      });
    }

    const card = await CardModel.get(id);

    if (!card) {
      return res.status(404).json({
        erro: 'Card (carta) não encontrado.',
        mensagem: 'Verifique o id do card.',
        id: id
      });
    }

    res.status(200).json({
      mensagem: "Card (carta) encontrado com sucesso.",
      card: card
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const criarCard = async (req, res) => {
  try {
    const novoCard = await CardModel.create(req.body);

    res.status(201).json({
      mensagem: 'Card (carta) criado com sucesso!',
      card: novoCard
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao criar card (carta)',
      detalhes: e.message
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
        number: number
      });
    }

    const cardAtualizado = await CardModel.updateByComposite(set, number, dados);

    res.status(200).json({
      mensagem: 'Card (carta) atualizado com sucesso!',
      card: cardAtualizado
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao atualizar card (carta)',
      detalhes: e.message
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
        number: numberInt
      });
    }

    await CardModel.removeByComposite(set, numberInt);

    res.status(200).json({
      mensagem: 'Card (carta) apagado com sucesso!',
      cardRemovido: cardExiste
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao apagar card (carta)',
      detalhes: e.message
    });
  }
};