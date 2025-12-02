import * as userModel from "../../models/Users/userModel.js";
import { prisma } from "../../lib/prisma.js";

export const listarUsuarios = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;

  console.log("🔍 Search users request:", { query: q });

  if (!q || q.trim() === "") {
    console.log("❌ Empty query");
    return res.status(400).json({ error: "Query de busca é obrigatória" });
  }

  try {
    const users = await userModel.searchByName(q.trim());
    console.log(
      "✅ Users found:",
      users.length,
      users.map((u) => u.username)
    );
    res.json(users);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
export const getUsuarioPorId = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            albums: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email, password } = req.body;

  try {
    const usuarioExistente = await userModel.findOne(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const dadosAtualizados = {};
    if (username !== undefined) dadosAtualizados.username = username;
    if (email !== undefined) dadosAtualizados.email = email;
    if (password !== undefined) dadosAtualizados.password = password;

    if (Object.keys(dadosAtualizados).length === 0) {
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    }

    const usuarioAtualizado = await userModel.atualizar(id, dadosAtualizados);
    res.json(usuarioAtualizado);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const usuarioExistente = await userModel.findOne(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await userModel.deletar(id);
    res.status(200).json({
      mensagem: "Usuário deletado com sucesso",
      usuario: usuarioExistente,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
