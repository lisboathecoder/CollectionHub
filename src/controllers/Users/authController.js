import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { send2FACode, generate2FACode, get2FAExpiration } from "../../services/emailService.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {

        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existing) {
            return res.status(400).json({ error: "Usuário ou email já existe" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({
            mensagem: "Usuário criado com sucesso!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('❌ Erro ao registrar:', error);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
};

export const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "Email/usuário e senha são obrigatórios" });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const code = generate2FACode();
        const expires = get2FAExpiration();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorCode: code,
                twoFactorExpires: expires
            }
        });

        const emailResult = await send2FACode(user.email, code, user.username);

        if (!emailResult.success) {
            return res.status(500).json({
                error: "Erro ao enviar código",
                details: emailResult.error
            });
        }

        res.json({
            mensagem: "Código enviado para seu email",
            userId: user.id,
            requires2FA: true
        });
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: "Erro no servidor" });
    }
};


export const verify2FA = async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        return res.status(400).json({ error: "userId e code são obrigatórios" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (!user.twoFactorCode || !user.twoFactorExpires) {
            return res.status(400).json({ error: "Nenhum código 2FA pendente" });
        }

        if (new Date() > new Date(user.twoFactorExpires)) {
            await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorCode: null, twoFactorExpires: null }
            });
            return res.status(400).json({ error: "Código expirado. Faça login novamente" });
        }

        if (user.twoFactorCode !== code) {
            return res.status(401).json({ error: "Código inválido" });
        }


        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorCode: null, twoFactorExpires: null }
        });

        const token = jwt.sign(
            { sub: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar 2FA:', error);
        res.status(500).json({ error: "Erro no servidor" });
    }
};

export const resend2FA = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
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
                twoFactorExpires: expires
            }
        });

        const emailResult = await send2FACode(user.email, code, user.username);

        if (!emailResult.success) {
            return res.status(500).json({
                error: "Erro ao enviar código",
                details: emailResult.error
            });
        }

        res.json({ mensagem: "Novo código enviado para seu email" });
    } catch (error) {
        console.error('❌ Erro ao reenviar código:', error);
        res.status(500).json({ error: "Erro no servidor" });
    }
};
