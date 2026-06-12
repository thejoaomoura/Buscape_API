const { Resend } = require('resend');
require('dotenv').config();

// Instanciação lazy: não quebra o boot do servidor quando RESEND_API_KEY
// não está configurada (ex.: rotas de scraping rodando sem o sistema de e-mail).
let resendClient = null;
const getResend = () => {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY não está configurado');
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

const emailTemplates = {
    priceAlert: (productData) => {
        const { productName, productImage, currentPrice, targetPrice, productUrl, monitorId } = productData;

        // --- Cálculos para o gráfico de queda de preço ---
        // Aceita números ou strings formatadas ("R$ 1.400,00")
        const toNum = (v) => {
            if (typeof v === 'number') return v;
            const m = String(v || '').match(/[\d.,]+/);
            return m ? (parseFloat(m[0].replace(/\./g, '').replace(',', '.')) || 0) : 0;
        };
        const formatBRL = (n) => {
            const [int, dec] = n.toFixed(2).split('.');
            return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
        };
        const currentNum = toNum(currentPrice);
        const targetNum = toNum(targetPrice);
        const maxNum = Math.max(currentNum, targetNum) || 1;
        const chartHeight = 170; // altura útil das barras (px)
        const targetBar = Math.max(Math.round((targetNum / maxNum) * chartHeight), 6);
        const currentBar = Math.max(Math.round((currentNum / maxNum) * chartHeight), 6);
        const savings = Math.max(targetNum - currentNum, 0);
        const dropPct = targetNum > 0 ? Math.round((savings / targetNum) * 100) : 0;
        const badgeText = dropPct > 0 ? `▼ ${dropPct}% abaixo do seu alvo` : '🎯 Preço alvo atingido!';
        const savingsRow = savings > 0
            ? `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top: 18px; color: #495057; font-size: 14px;">💰 Você economiza <strong style="color: #28a745;">${formatBRL(savings)}</strong> em relação ao preço alvo</td></tr></table>`
            : '';

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
                            
                            <!-- Gráfico de queda de preço (alvo x atual) -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 24px 16px 20px;">
                                        <!-- Badge de queda -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="padding-bottom: 20px;">
                                                    <span style="display: inline-block; background-color: #28a745; color: #ffffff; font-size: 15px; font-weight: bold; padding: 6px 18px; border-radius: 20px;">${badgeText}</span>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Barras proporcionais -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr valign="bottom">
                                                <td width="50%" align="center" valign="bottom">
                                                    <div style="color: #868e96; font-size: 17px; font-weight: bold; margin-bottom: 8px;">${targetPrice}</div>
                                                    <table cellpadding="0" cellspacing="0" align="center">
                                                        <tr><td width="64" height="${targetBar}" bgcolor="#ced4da" style="width: 64px; height: ${targetBar}px; background-color: #ced4da; border-radius: 8px 8px 0 0; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                    </table>
                                                </td>
                                                <td width="50%" align="center" valign="bottom">
                                                    <div style="color: #28a745; font-size: 22px; font-weight: bold; margin-bottom: 8px;">${currentPrice}</div>
                                                    <table cellpadding="0" cellspacing="0" align="center">
                                                        <tr><td width="64" height="${currentBar}" bgcolor="#28a745" style="width: 64px; height: ${currentBar}px; background-color: #28a745; border-radius: 8px 8px 0 0; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Linha base -->
                                        <div style="border-top: 2px solid #dee2e6; margin: 0 6px;"></div>
                                        <!-- Rótulos das categorias -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="50%" align="center" style="padding-top: 8px; color: #868e96; font-size: 13px;">🎯 Preço Alvo</td>
                                                <td width="50%" align="center" style="padding-top: 8px; color: #28a745; font-size: 13px; font-weight: bold;">✅ Preço Atual</td>
                                            </tr>
                                        </table>
                                        ${savingsRow}
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

        const { data: sendResult, error } = await getResend().emails.send({
            from: process.env.EMAIL_FROM || 'BuscapéAPI <onboarding@resend.dev>',
            to: [to],
            subject: emailContent.subject,
            html: emailContent.html,
        });

        // O SDK do Resend (v6) não lança em erro de API: retorna { data, error }.
        // Precisamos checar explicitamente para não marcar como enviado por engano.
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`✅ E-mail enviado com sucesso para ${to}:`, sendResult && sendResult.id);
        return sendResult;
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        throw error;
    }
};

module.exports = {
    getResend,
    sendEmail,
    emailTemplates
};

