import * as AlbumModel from "../../models/Albums/albumModel.js";

export const listarAlbums = async (req, res) => {
  try {
    const userId = req.params.userId;
    const authenticatedUserId = req.user.id;
    if (parseInt(userId) !== authenticatedUserId) {
      return res.status(403).json({ erro: "Acesso negado" });
    }
    const albums = await AlbumModel.list(userId);
    res.status(200).json({
      mensagem: "Lista de álbuns",
      total: albums.length,
      albums: albums
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao listar álbuns",
      detalhes: e.message
    });
  }
};

export const getAlbum = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const album = await AlbumModel.get(id);

    if (!album) {
      return res.status(404).json({ erro: "Álbum não encontrado" });
    }

    // Verify user owns the album or album is public
    if (album.userId !== req.user.id && !album.isPublic) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Return album directly (not wrapped)
    res.status(200).json(album);
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao buscar álbum",
      detalhes: e.message
    });
  }
};

export const criarAlbum = async (req, res) => {
  try {
    const { name, description, type, isPublic } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ erro: "name é obrigatório" });
    }

    const novoAlbum = await AlbumModel.create({ 
      userId, 
      name, 
      description: description || null,
      type: type || 'custom',
      isPublic: isPublic !== undefined ? isPublic : true
    });

    // Return album directly
    res.status(201).json(novoAlbum);
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao criar álbum",
      detalhes: e.message
    });
  }
};

export const atualizarAlbum = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const albumExiste = await AlbumModel.get(id);
    if (!albumExiste) {
      return res.status(404).json({ erro: "Álbum não encontrado" });
    }

    // Verify user owns the album
    if (albumExiste.userId !== req.user.id) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const albumAtualizado = await AlbumModel.update(id, req.body);

    res.status(200).json({
      mensagem: "Álbum atualizado com sucesso",
      album: albumAtualizado
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao atualizar álbum",
      detalhes: e.message
    });
  }
};

export const deletarAlbum = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const albumExiste = await AlbumModel.get(id);
    if (!albumExiste) {
      return res.status(404).json({ erro: "Álbum não encontrado" });
    }

    // Verify user owns the album
    if (albumExiste.userId !== req.user.id) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    await AlbumModel.remove(id);

    res.status(200).json({
      mensagem: "Álbum deletado com sucesso",
      album: albumExiste
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao deletar álbum",
      detalhes: e.message
    });
  }
};

export const adicionarItem = async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId);

    if (isNaN(albumId)) {
      return res.status(400).json({ erro: "albumId inválido" });
    }

    const albumExiste = await AlbumModel.get(albumId);
    if (!albumExiste) {
      return res.status(404).json({ erro: "Álbum não encontrado" });
    }

    // Verify user owns the album
    if (albumExiste.userId !== req.user.id) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const novoItem = await AlbumModel.addItem(albumId, req.body);

    res.status(201).json({
      mensagem: "Item adicionado ao álbum",
      item: novoItem
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao adicionar item",
      detalhes: e.message
    });
  }
};

export const atualizarItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);

    if (isNaN(itemId)) {
      return res.status(400).json({ erro: "itemId inválido" });
    }

    const itemAtualizado = await AlbumModel.updateItem(itemId, req.body);

    res.status(200).json({
      mensagem: "Item atualizado",
      item: itemAtualizado
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao atualizar item",
      detalhes: e.message
    });
  }
};

export const deletarItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);

    if (isNaN(itemId)) {
      return res.status(400).json({ erro: "itemId inválido" });
    }

    await AlbumModel.removeItem(itemId);

    res.status(200).json({
      mensagem: "Item removido do álbum"
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao deletar item",
      detalhes: e.message
    });
  }
};
