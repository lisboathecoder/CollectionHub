import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Envia código de 2FA por email usando Resend
 * @param {string} email 
 * @param {string} code 
 * @param {string} username 
 * @returns {Promise<{success: boolean, response?: any, error?: string}>}
 */
export const send2FACode = async (email, code, username) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '🔐 Seu código de verificação - CollectionHub',
            html: generate2FAEmailHTML(code, username),
            text: `Olá ${username}!\n\nSeu código de verificação 2FA é: ${code}\n\nEste código expira em 5 minutos.\n\nSe você não solicitou este código, ignore este email.\n\n- Equipe CollectionHub`
        });

        if (error) {
            console.error('❌ Erro ao enviar email (Resend):', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email enviado com sucesso (Resend):', data);
        return { success: true, response: data };
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Envia email de reset de senha
 * @param {string} email - Email do destinatário
 * @param {string} resetToken - Token de reset
 * @param {string} username - Nome do usuário
 */
export const sendPasswordResetEmail = async (email, resetToken, username) => {
    const resetUrl = `${process.env.FRONTEND_URL}/pages/userLogin/reset-password.html?token=${resetToken}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '🔑 Reset de Senha - CollectionHub',
            html: generatePasswordResetHTML(resetUrl, username),
            text: `Olá ${username}!\n\nRecebemos uma solicitação para resetar sua senha.\n\nClique no link para criar uma nova senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou isso, ignore este email.\n\n- Equipe CollectionHub`
        });

        if (error) {
            console.error('❌ Erro ao enviar email de reset:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email de reset enviado:', data);
        return { success: true, response: data };
    } catch (error) {
        console.error('❌ Erro ao enviar email de reset:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Envia email de boas-vindas
 * @param {string} email - Email do destinatário
 * @param {string} username - Nome do usuário
 */
export const sendWelcomeEmail = async (email, username) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '🎉 Bem-vindo ao CollectionHub!',
            html: generateWelcomeEmailHTML(username),
            text: `Olá ${username}!\n\nBem-vindo ao CollectionHub! 🎉\n\nEstamos muito felizes em ter você conosco.\n\nComece criando seu primeiro álbum e organizando suas coleções.\n\n- Equipe CollectionHub`
        });

        if (error) {
            console.error('❌ Erro ao enviar email de boas-vindas:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email de boas-vindas enviado:', data);
        return { success: true, response: data };
    } catch (error) {
        console.error('❌ Erro ao enviar email de boas-vindas:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gera código 2FA de 6 dígitos
 * @returns {string}
 */
export const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calcula data de expiração do código 2FA (5 minutos)
 * @returns {Date}
 */
export const get2FAExpiration = () => {
    const expiration = new Date();
    const minutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRES_IN) || 5;
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
};

