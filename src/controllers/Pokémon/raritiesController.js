import * as RarityModel from "../../model/Pokémon/raritiesModel.js";

export const listarRaridades = async (req, res) => {
  try {
    const raridades = await RarityModel.list();

    if (!raridades || raridades.length === 0) {
      return res.status(404).json({
        mensagem: "Não há raridades na lista.",
        raridades: []
      });
    }

    res.status(200).json({
      total: raridades.length,
      mensagem: "Lista de raridades",
      raridades: raridades
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const listarRaridadePorCodigo = async (req, res) => {
  try {
    const { code } = req.params;

    const raridade = await RarityModel.get(code);

    if (!raridade) {
      return res.status(404).json({
        erro: 'Raridade não encontrada.',
        mensagem: 'Verifique o código da raridade.',
        code: code
      });
    }

    res.status(200).json({
      mensagem: "Raridade encontrada com sucesso.",
      raridade: raridade
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const criarRaridade = async (req, res) => {
  try {
    const novaRaridade = await RarityModel.create(req.body);

    res.status(201).json({
      mensagem: 'Raridade criada com sucesso!',
      raridade: novaRaridade
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao criar raridade',
      detalhes: e.message
    });
  }
};

export const atualizarRaridade = async (req, res) => {
  try {
    const { code } = req.params;
    const dados = req.body;

    const raridadeExiste = await RarityModel.get(code);

    if (!raridadeExiste) {
      return res.status(404).json({
        erro: 'Raridade com esse código não foi encontrada',
        code: code
      });
    }

    const raridadeAtualizada = await RarityModel.update(code, dados);

    res.status(200).json({
      mensagem: 'Raridade atualizada com sucesso!',
      raridade: raridadeAtualizada
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao atualizar raridade',
      detalhes: e.message
    });
  }
};

export const deletarRaridade = async (req, res) => {
  try {
    const { code } = req.params;

    const raridadeExiste = await RarityModel.get(code);

    if (!raridadeExiste) {
      return res.status(404).json({
        erro: 'Raridade com esse código não encontrada',
        code: code
      });
    }

    await RarityModel.remove(code);

    res.status(200).json({
      mensagem: 'Raridade apagada com sucesso!',
      raridadeRemovida: raridadeExiste
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao apagar raridade',
      detalhes: e.message
    });
  }
};