import emailjs from '@emailjs/nodejs';

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'your_service_id';
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'your_template_id';
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'your_public_key';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'your_private_key';

export const send2FACode = async (email, code, username) => {
    try {
        const templateParams = {
            to_email: email,
            to_name: username,
            code: code,
            message: `Seu código de verificação 2FA é: ${code}. Este código expira em 5 minutos.`
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            {
                publicKey: PUBLIC_KEY,
                privateKey: PRIVATE_KEY,
            }
        );

        console.log('Email enviado com sucesso:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return { success: false, error: error.message };
    }
};

export const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const get2FAExpiration = () => {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 5);
    return expiration;
};
