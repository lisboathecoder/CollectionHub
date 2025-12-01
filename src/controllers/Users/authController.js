import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import {
  send2FACode,
  generate2FACode,
  get2FAExpiration,
} from "../../services/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email e password são obrigatórios" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Este nome de usuário já está em uso. Por favor, escolha outro.",
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "Este email já está cadastrado. Faça login ou use outro email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar:", error);
    res.status(500).json({ message: "Erro ao criar usuário" });
  }
};

export const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .json({ error: "Email/usuário e senha são obrigatórios" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
        message: "Não existe nenhuma conta com este email ou nome de usuário.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: "Senha incorreta",
        message: "A senha informada está incorreta. Tente novamente.",
      });
    }

    const code = generate2FACode();
    const expires = get2FAExpiration();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: code,
        twoFactorExpires: expires,
      },
    });

    const emailResult = await send2FACode(user.email, code, user.username);

    if (!emailResult.success) {
      return res.status(500).json({
        error: "Erro ao enviar código",
        details: emailResult.error,
      });
    }

    res.json({
      mensagem: "Código enviado para seu email",
      userId: user.id,
      requires2FA: true,
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

export const verify2FA = async (req, res) => {
  const { userId, email, code } = req.body;

  if ((!userId && !email) || !code) {
    return res
      .status(400)
      .json({ message: "email/userId e code são obrigatórios" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: userId ? { id: parseInt(userId) } : { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({ message: "Nenhum código 2FA pendente" });
    }

    if (new Date() > new Date(user.twoFactorExpires)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorCode: null, twoFactorExpires: null },
      });
      return res
        .status(400)
        .json({ message: "Código expirado. Faça login novamente" });
    }

    if (user.twoFactorCode !== code) {
      return res.status(401).json({ message: "Código inválido" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpires: null },
    });

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao verificar 2FA:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

export const resend2FA = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId é obrigatório" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const code = generate2FACode();
    const expires = get2FAExpiration();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: code,
        twoFactorExpires: expires,
      },
    });

    const emailResult = await send2FACode(user.email, code, user.username);

    if (!emailResult.success) {
      return res.status(500).json({
        error: "Erro ao enviar código",
        details: emailResult.error,
      });
    }

    res.json({ mensagem: "Novo código enviado para seu email" });
  } catch (error) {
    console.error("❌ Erro ao reenviar código:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email não encontrado em nossa base de dados",
      });
    }

    const code = generate2FACode();
    const expires = get2FAExpiration();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: code,
        resetCodeExpires: expires,
      },
    });

    const emailResult = await send2FACode(user.email, code, user.username);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Erro ao enviar código",
        details: emailResult.error,
      });
    }

    res.json({
      success: true,
      message: "Código de verificação enviado para seu email",
    });
  } catch (error) {
    console.error("❌ Erro ao solicitar reset de senha:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
    });
  }
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email e código são obrigatórios",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "Nenhum código de reset pendente",
      });
    }

    if (new Date() > new Date(user.resetCodeExpires)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetCode: null, resetCodeExpires: null },
      });
      return res.status(400).json({
        success: false,
        message: "Código expirado. Solicite um novo código",
      });
    }

    if (user.resetCode !== code) {
      return res.status(401).json({
        success: false,
        message: "Código inválido",
      });
    }

    const resetToken = jwt.sign(
      { sub: user.id, purpose: "reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      message: "Código verificado com sucesso",
      resetToken,
    });
  } catch (error) {
    console.error("❌ Erro ao verificar código de reset:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token e nova senha são obrigatórios",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "A senha deve ter pelo menos 8 caracteres",
    });
  }

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);

    if (decoded.purpose !== "reset") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.sub },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        expired: true,
        message: "Token expirado. Solicite um novo código de reset",
      });
    }

    console.error("❌ Erro ao resetar senha:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
    });
  }
};
