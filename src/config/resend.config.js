const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const emailTemplates = {
    priceAlert: (productData) => {
        const { productName, productImage, currentPrice, targetPrice, productUrl, monitorId } = productData;
        
        return {
            subject: `🎉 Alerta de Preço: ${productName}`,
            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Preço</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎯 Meta de Preço Atingida!</h1>
                        </td>
                    </tr>
                    
                    <!-- Product Image -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <img src="${productImage}" alt="${productName}" style="max-width: 300px; height: auto; border-radius: 8px;">
                        </td>
                    </tr>
                    
                    <!-- Product Info -->
                    <tr>
                        <td style="padding: 0 30px 20px;">
                            <h2 style="color: #333; font-size: 22px; margin: 0 0 20px;">${productName}</h2>
                            
                            <table width="100%" cellpadding="10" style="background-color: #f8f9fa; border-radius: 8px;">
                                <tr>
                                    <td style="text-align: center; border-right: 1px solid #dee2e6;">
                                        <div style="color: #6c757d; font-size: 14px; margin-bottom: 5px;">Preço Alvo</div>
                                        <div style="color: #28a745; font-size: 24px; font-weight: bold;">${targetPrice}</div>
                                    </td>
                                    <td style="text-align: center;">
                                        <div style="color: #6c757d; font-size: 14px; margin-bottom: 5px;">Preço Atual</div>
                                        <div style="color: #dc3545; font-size: 24px; font-weight: bold;">${currentPrice}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 30px 30px; text-align: center;">
                            <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                🛒 Ver Produto Agora
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Stop Monitoring -->
                    <tr>
                        <td style="padding: 20px 30px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px;">Não deseja mais monitorar este produto?</p>
                            <a href="${process.env.APP_URL || 'http://localhost:5173'}/api/monitor/unsubscribe/${monitorId}" style="color: #dc3545; text-decoration: none; font-size: 14px;">
                                Parar de Monitorar
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                            <p style="color: #6c757d; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} BuscapéAPI - Sistema de Monitoramento de Preços
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        };
    }
};

const sendEmail = async (to, template, data) => {
    try {
        const emailContent = emailTemplates[template](data);
        
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'BuscapéAPI <onboarding@resend.dev>',
            to: [to],
            subject: emailContent.subject,
            html: emailContent.html,
        });

        console.log(`✅ E-mail enviado com sucesso para ${to}:`, response.id);
        return response;
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        throw error;
    }
};

module.exports = {
    resend,
    sendEmail,
    emailTemplates
};

