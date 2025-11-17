import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Gera código 2FA de 6 dígitos
 */
export const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calcula data de expiração do código 2FA (5 minutos)
 */
export const get2FAExpiration = () => {
    const expiration = new Date();
    const minutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRES_IN) || 5;
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
};

/**
 * Envia código de 2FA por email
 */
export const send2FACode = async (email, code, username) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '🔐 Código de Verificação - CollectionHub',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 CollectionHub</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="color: #1a202c; margin: 0 0 20px 0;">Olá, ${username}!</h2>
                            <p style="color: #4a5568; font-size: 16px; margin: 0 0 30px 0;">
                                Seu código de verificação é:
                            </p>
                            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border: 2px dashed #cbd5e0;">
                                <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: monospace;">
                                    ${code}
                                </div>
                            </div>
                            <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0;">
                                ⏰ Este código expira em <strong>5 minutos</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f7fafc; padding: 20px; text-align: center;">
                            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} CollectionHub
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
            text: `Olá ${username}!\n\nSeu código de verificação: ${code}\n\nExpira em 5 minutos.\n\n- CollectionHub`
        });

        if (error) {
            console.error('❌ Erro ao enviar email:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email enviado:', data?.id);
        return { success: true, response: data };
    } catch (error) {
        console.error('❌ Erro:', error);
        return { success: false, error: error.message };
    }
};
