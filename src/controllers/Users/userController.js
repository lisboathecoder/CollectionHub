import * as userModel from "../../models/Users/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "troque_isto_para_producao";

export const listarUsuarios = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUsuarioPorId = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await userModel.findOne(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const dados = { username, email, password: passwordHash };
    const novoUsuario = await userModel.create(dados);
    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: {
        id: novoUsuario.id,
        username: novoUsuario.username,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email, password } = req.body;

  try {
    const usuarioExistente = await userModel.findOne(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: "User not found" });
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
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const usuarioExistente = await userModel.findOne(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: "User not found" });
    }

    await userModel.deletar(id);
    res.status(200).json({
      mensagem: "Usuário deletado com sucesso",
      usuario: usuarioExistente,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password)
    return res.status(400).json({ error: "Dados inválidos" });

  try {
    // procurar por username ou email
    const user = await userModel.findOneByUsernameOrEmail(usernameOrEmail);
    // -> você precisa adicionar essa função no model, ou usar findMany/findFirst diretamente.

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciais inválidas" });

    // criar JWT
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // opcional: cookie httpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
