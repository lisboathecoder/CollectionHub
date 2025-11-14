import * as userModel from "../../models/Users/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { send2FACode, generate2FACode, get2FAExpiration } from "../../services/emailService2FA.js";

const JWT_SECRET = process.env.JWT_SECRET || "troque_isto_para_producao";

export const loginRequest2FA = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    try {
        const user = await userModel.findByUsernameOrEmail(usernameOrEmail);

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const code = generate2FACode();
        const expires = get2FAExpiration();

        await userModel.update2FACode(user.id, code, expires);

        const emailResult = await send2FACode(user.email, code, user.username);

        if (!emailResult.success) {
            return res.status(500).json({ 
                error: "Erro ao enviar código de verificação",
                details: emailResult.error
            });
        }

        res.json({
            mensagem: "Código de verificação enviado para seu e-mail",
            userId: user.id,
            requires2FA: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

export const verify2FAAndLogin = async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    try {
        const user = await userModel.findOne(parseInt(userId));

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (!user.twoFactorCode || !user.twoFactorExpires) {
            return res.status(400).json({ error: "Nenhum código 2FA pendente" });
        }

        if (new Date() > new Date(user.twoFactorExpires)) {
            await userModel.clear2FACode(user.id);
            return res.status(400).json({ error: "Código expirado. Solicite um novo código." });
        }

        if (user.twoFactorCode !== code) {
            return res.status(401).json({ error: "Código inválido" });
        }

        await userModel.clear2FACode(user.id);

        const token = jwt.sign(
            { sub: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            mensagem: "Login realizado com sucesso",
            id: user.id,
            username: user.username,
            email: user.email,
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

export const resend2FACode = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId não fornecido" });
    }

    try {
        const user = await userModel.findOne(parseInt(userId));

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const code = generate2FACode();
        const expires = get2FAExpiration();

        await userModel.update2FACode(user.id, code, expires);

        const emailResult = await send2FACode(user.email, code, user.username);

        if (!emailResult.success) {
            return res.status(500).json({ 
                error: "Erro ao enviar código de verificação",
                details: emailResult.error
            });
        }

        res.json({
            mensagem: "Novo código enviado para seu e-mail"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

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
        console.error("Erro ao criar usuário:", error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                error: "Username ou email já existe" 
            });
        }
        
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};
