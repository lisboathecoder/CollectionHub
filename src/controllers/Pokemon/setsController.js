import * as SetModel from "../../model/Pokemon/setModel.js";

export const listarSets = async (req, res) => {
  try {
    const sets = await SetModel.list();

    if (!sets || sets.length === 0) {
      return res.status(404).json({
        mensagem: "Não há sets (coleções) na lista.",
        sets: []
      });
    }

    res.status(200).json({
      total: sets.length,
      mensagem: "Lista de sets (coleções)",
      sets: sets
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const listarSetPorCodigo = async (req, res) => {
  try {
    const { code } = req.params;

    const set = await SetModel.get(code);

    if (!set) {
      return res.status(404).json({
        erro: 'Set (coleção) não encontrado.',
        mensagem: 'Verifique o código do set.',
        code: code
      });
    }

    res.status(200).json({
      mensagem: "Set (coleção) encontrado com sucesso.",
      set: set
    });
  } catch (e) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: e.message,
      status: 500
    });
  }
};

export const criarSet = async (req, res) => {
  try {
    const novoSet = await SetModel.create(req.body);

    res.status(201).json({
      mensagem: 'Set (coleção) criado com sucesso!',
      set: novoSet
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao criar set (coleção)',
      detalhes: e.message
    });
  }
};

export const atualizarSet = async (req, res) => {
  try {
    const { code } = req.params;
    const dados = req.body;

    const setExiste = await SetModel.get(code);

    if (!setExiste) {
      return res.status(404).json({
        erro: 'Set (coleção) com esse código não foi encontrado',
        code: code
      });
    }

    const setAtualizado = await SetModel.update(code, dados);

    res.status(200).json({
      mensagem: 'Set (coleção) atualizado com sucesso!',
      set: setAtualizado
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao atualizar set (coleção)',
      detalhes: e.message
    });
  }
};

export const deletarSet = async (req, res) => {
  try {
    const { code } = req.params;

    const setExiste = await SetModel.get(code);

    if (!setExiste) {
      return res.status(404).json({
        erro: 'Set (coleção) com esse código não encontrado',
        code: code
      });
    }

    await SetModel.remove(code);

    res.status(200).json({
      mensagem: 'Set (coleção) apagado com sucesso!',
      setRemovido: setExiste
    });
  } catch (e) {
    res.status(500).json({
      erro: 'Erro ao apagar set (coleção)',
      detalhes: e.message
    });
  }
};