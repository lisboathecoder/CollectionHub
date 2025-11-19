import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const get2FAExpiration = () => {
  const expiration = new Date();
  const minutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRES_IN) || 5;
  expiration.setMinutes(expiration.getMinutes() + minutes);
  return expiration;
};

export const send2FACode = async (email, code, username) => {
  try {
    const expiresIn = parseInt(process.env.TWO_FACTOR_CODE_EXPIRES_IN) || 5;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Código de Verificação - CollectionHub`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="pt-BR">
      <head>
        <meta content="width=device-width" name="viewport" />
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta
          content="telephone=no,address=no,email=no,date=no,url=no"
          name="format-detection" />
        <title>CollectionHub - Código de Verificação</title>
      </head>
      <body style="margin:0;padding:0;">
        <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">
          Seu código de verificação para acessar a conta em ${expiresIn} minutos
        </div>

        <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
          <tr>
        <td>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
              <tr>
                <td>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 20px;background-color:#f5f5f5;">
                <tr>
                  <td align="center">
                    <table width="500" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                      <tr>
                    <td align="center" style="padding:40px 40px 30px 40px;">
                      <h1 style="margin:0;padding:0;font-size:31px;font-weight:300;color:#000;text-align:center;">
                        <code style="font-family:inherit;background:none;border:none;padding:0;">CollectionHub</code>
                      </h1>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:0 40px 30px 40px;">
                      <h2 style="margin:0;padding:0;font-size:24px;font-weight:600;color:#111;">Seu código de verificação</h2>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:0 40px 30px 40px;">
                      <p style="margin:0;padding:0;font-size:15px;color:#666;line-height:1.5;">Olá, ${username}</p>
                      <p style="margin:10px 0 0 0;padding:0;font-size:15px;color:#666;line-height:1.5;">Use o código abaixo para acessar sua conta:</p>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:0 40px 30px 40px;">
                      <div style="display:inline-block;padding:20px;background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;">
                        <div style="font-size:32px;font-weight:700;color:#111;letter-spacing:6px;font-family:'Courier New',monospace;margin:0;">
                          ${code}
                        </div>
                      </div>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:0 40px 30px 40px;">
                      <p style="margin:0;padding:0;font-size:13px;color:#999;">Este código expira em ${expiresIn} minutos</p>
                    </td>
                      </tr>

                      <tr>
                    <td style="padding:0 40px;">
                      <div style="border-top:1px solid #e9ecef;margin-top:8px;"></div>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:30px 40px;">
                      <p style="margin:0;padding:0;font-size:13px;color:#999;line-height:1.6;">Se você não solicitou este código, ignore este email.</p>
                    </td>
                      </tr>

                      <tr>
                    <td align="center" style="padding:0 40px 40px 40px;">
                      <p style="margin:0;padding:0;font-size:12px;color:#cccccc;">© ${new Date().getFullYear()} CollectionHub</p>
                    </td>
                      </tr>

                    </table>
                  </td>
                </tr>
                  </table>
                </td>
              </tr>
            </table>
              </td>
            </tr>
          </table>
        </td>
          </tr>
        </table>
      </body>
    </html>
            `,
      text: `Olá ${username}!\n\nSeu código de verificação: ${code}\n\nExpira em ${expiresIn} minutos.\n\nSe você não solicitou este código, ignore este email.\n\n- CollectionHub`,
    });

    if (error) {
      console.error("❌ Erro ao enviar email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, response: data };
  } catch (error) {
    console.error("❌ Erro:", error);
    return { success: false, error: error.message };
  }
};
