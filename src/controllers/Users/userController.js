import * as userModel from '../../model/Users/userModel.js';

export const listarUsuarios = async (req, res) => {
  try {
    const users = await userModel.list();
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getUsuarioPorId = async (req, res) => {
  const id = parseInt(req.params.id);   

  try {
    const user = await userModel.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const dados = { username, email, password };
        const camposObrigatorios = ["username", "email", "password"];
        const faltando = camposObrigatorios.filter((campo) => !dados[campo]);

        if (faltando.length > 0) {
            return res.status(400).json({
                erro: `Os seguintes campos são obrigatórios: ${faltando.join(", ")}`,
            });
        }

        const novoUsuario = await userModel.create(dados);
        res.status(201).json({
            mensagem: "Usuário criado com sucesso",
            usuario: novoUsuario,
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
        const usuarioExistente = await userModel.getById(id);
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

        const usuarioAtualizado = await userModel.update(id, dadosAtualizados);
        res.json(usuarioAtualizado);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const usuarioExistente = await userModel.getById(id);
        if (!usuarioExistente) {
            return res.status(404).json({ error: "User not found" });
        }

        await userModel.delete(id);
        res.status(204).json({
            mensagem: "Usuário deletado com sucesso",
            usuario: usuarioExistente
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};