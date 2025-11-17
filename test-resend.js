/**
 * Script de Teste - Resend Email Service
 * 
 * Este script testa se o Resend está configurado corretamente
 * e envia um email de teste.
 * 
 * Como usar:
 * 1. Configure RESEND_API_KEY no .env
 * 2. node test-resend.js seu-email@example.com
 */

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Verificar se a API key está configurada
if (!RESEND_API_KEY) {
    console.error('❌ ERRO: RESEND_API_KEY não encontrado no .env');
    console.log('\n📝 Adicione no arquivo .env:');
    console.log('   RESEND_API_KEY=re_sua_key_aqui\n');
    process.exit(1);
}

// Obter email de destino dos argumentos
const toEmail = process.argv[2];

if (!toEmail) {
    console.error('❌ ERRO: Email de destino não fornecido');
    console.log('\n📝 Use:');
    console.log('   node test-resend.js seu-email@example.com\n');
    process.exit(1);
}

// Validar formato do email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(toEmail)) {
    console.error('❌ ERRO: Email inválido:', toEmail);
    process.exit(1);
}

// Inicializar Resend
const resend = new Resend(RESEND_API_KEY);

console.log('🚀 Testando Resend Email Service...\n');
console.log('📧 De:', EMAIL_FROM);
console.log('📧 Para:', toEmail);
console.log('🔑 API Key:', RESEND_API_KEY.substring(0, 10) + '...\n');

// Função para testar envio
async function testResend() {
    try {
        console.log('⏳ Enviando email de teste...');
        
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: toEmail,
            subject: '✅ Teste CollectionHub - Resend Configurado!',
            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">
                                🎉 Sucesso!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">
                                ✅ Resend Configurado Corretamente!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Parabéns! Seu sistema de email do <strong>CollectionHub</strong> está funcionando perfeitamente.
                            </p>
                            
                            <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                                    📧 <strong>De:</strong> ${EMAIL_FROM}<br>
                                    📧 <strong>Para:</strong> ${toEmail}<br>
                                    ⏰ <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                                    🚀 <strong>Serviço:</strong> Resend.com
                                </p>
                            </div>
                            
                            <div style="margin: 30px 0;">
                                <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0;">
                                    <strong>O que você pode fazer agora:</strong>
                                </p>
                                <ul style="text-align: left; color: #4a5568; font-size: 14px; line-height: 1.8;">
                                    <li>✅ Enviar códigos 2FA</li>
                                    <li>✅ Enviar emails de reset de senha</li>
                                    <li>✅ Enviar emails de boas-vindas</li>
                                    <li>✅ Monitorar no Dashboard do Resend</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                                Este é um email de teste do CollectionHub<br>
                                © ${new Date().getFullYear()} CollectionHub. Todos os direitos reservados.
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
            text: `
✅ TESTE RESEND - COLLECTIONHUB

Parabéns! Seu sistema de email está configurado corretamente.

📧 De: ${EMAIL_FROM}
📧 Para: ${toEmail}
⏰ Data: ${new Date().toLocaleString('pt-BR')}
🚀 Serviço: Resend.com

O que você pode fazer agora:
✅ Enviar códigos 2FA
✅ Enviar emails de reset de senha
✅ Enviar emails de boas-vindas
✅ Monitorar no Dashboard do Resend

- Equipe CollectionHub
            `
        });

        if (error) {
            console.error('\n❌ ERRO ao enviar email:');
            console.error(error);
            console.log('\n🔍 Possíveis causas:');
            console.log('   1. API Key inválida');
            console.log('   2. Email de destino inválido');
            console.log('   3. Limite de emails atingido');
            console.log('   4. Problema de conexão\n');
            process.exit(1);
        }

        console.log('\n✅ EMAIL ENVIADO COM SUCESSO!\n');
        console.log('📊 Informações:');
        console.log('   ID:', data.id);
        console.log('   De:', EMAIL_FROM);
        console.log('   Para:', toEmail);
        console.log('   Enviado:', new Date().toLocaleString('pt-BR'));
        
        console.log('\n📧 Verifique sua caixa de entrada!');
        console.log('   (Se não chegou, verifique spam/lixo eletrônico)');
        
        console.log('\n📊 Veja detalhes no Dashboard:');
        console.log('   https://resend.com/emails/' + data.id);
        
        console.log('\n🎉 Resend configurado com sucesso!\n');
        
    } catch (error) {
        console.error('\n❌ ERRO INESPERADO:');
        console.error(error);
        console.log('\n🆘 Se o problema persistir:');
        console.log('   1. Verifique sua conexão com internet');
        console.log('   2. Verifique se o Resend está online: https://status.resend.com/');
        console.log('   3. Recrie sua API Key no Dashboard');
        console.log('   4. Entre em contato com suporte do Resend\n');
        process.exit(1);
    }
}

// Executar teste
testResend();
