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
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { nickname: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        bio: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
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
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            albums: true,
            friendsInitiated: {
              where: { status: 'accepted' }
            },
            friendsReceived: {
              where: { status: 'accepted' }
            }
          }
        }
      }
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
