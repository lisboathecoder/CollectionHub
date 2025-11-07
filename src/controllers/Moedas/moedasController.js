import * as moedaModel from "../../models/Moedas/moedasModel";

export const listarTodos = async (req, res) => {
  try {
    const moedas = await moedaModel.encontreTodos();

    if (!moedas || moedas.length === 0) {
      return res.status(404).json({
        mensagem: "Não há moedas na lista.",
        moedas
      });
    }

    res.status(200).json({
      total: moedas.length,
      mensagem: "Lista de moedas",
      moedas: moedas
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: error.message,
      status: 500
    });
  }
}

export const listarUm = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        erro: 'ID inválido.',
        mensagem: 'O ID fornecido não é um número.'
      });
    }

    const moeda = await moedaModel.encontreUm(id);

    if (!moeda) {
      return res.status(404).json({
        erro: 'Moeda não encontrada.',
        mensagem: `Verifique o id da moeda.`,
        id: id
      });
    }

    res.status(200).json({
      mensagem: "Moeda encontrada com sucesso.",
      moeda
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro interno do servidor.",
      details: error.message,
      status: 500
    });
  }
}

export const criar = async (req, res) => {
  try {
    const dado = req.body;

    // Validação
    const camposObrigatorios = ['nome', 'ano', 'material', 'countryCode', 'valorFacial'];

    const faltando = camposObrigatorios.filter(campo => !dado[campo]);

    if (faltando.length > 0) {
      return res.status(400).json({
        erro: `Os seguintes campos são obrigatórios: ${faltando.join(', ')}.`
      });
    }

    const novaMoeda = await moedaModel.criar(dado);

    res.status(201).json({
      mensagem: 'Moeda criada com sucesso!',
      moeda: novaMoeda
    });

  } catch (error) {
    // Tratamento de erro específico se o 'countryCode' não existir
    if (error.code === 'P2003') { // P2003 = Foreign key constraint failed
      return res.status(400).json({
        erro: 'Erro ao criar moeda: País (countryCode) não encontrado.',
        detalhes: `O 'countryCode' "${req.body.countryCode}" não existe na tabela Country.`,
      });
    }

    res.status(500).json({
      erro: 'Erro ao criar moeda',
      detalhes: error.message
    });
  }
}

export const deletar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const moedaExiste = await moedaModel.encontreUm(id);

    if (!moedaExiste) {
      return res.status(404).json({
        erro: 'Moeda com esse id não encontrada',
        id: id
      });
    }

    await moedaModel.deletar(id);

    res.status(200).json({
      mensagem: 'Moeda apagada com sucesso!',
      moedaRemovida: moedaExiste
    });

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao apagar moeda!',
      detalhes: error.message
    });
  }
}

export const atualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dado = req.body;

    const moedaExiste = await moedaModel.encontreUm(id);

    if (!moedaExiste) {
      return res.status(404).json({
        erro: 'Moeda com esse id não foi encontrada',
        id: id
      });
    }

    const moedaAtualizada = await moedaModel.atualizar(id, dado);

    res.status(200).json({
      mensagem: 'Moeda atualizada com sucesso!',
      moeda: moedaAtualizada
    });

  } catch (error) {
    // Tratamento de erro específico se o 'countryCode' não existir
    if (error.code === 'P2003') {
      return res.status(400).json({
        erro: 'Erro ao atualizar moeda: País (countryCode) não encontrado.',
        detalhes: `O 'countryCode' "${req.body.countryCode}" não existe na tabela Country.`,
      });
    }
    
    res.status(500).json({
      erro: 'Erro ao atualizar moeda!',
      detalhes: error.message
    });
  }
}