const express = require('express');
const router = express.Router();
const priceMonitorService = require('../services/priceMonitor.service');
const priceCheckerService = require('../services/priceChecker.service');

// Middleware simples de validação de e-mail
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// POST - Adicionar produto ao monitoramento
router.post('/', async (req, res) => {
    try {
        const { userEmail, productName, productUrl, currentPrice, targetPrice, productImage } = req.body;

        // Validações
        if (!userEmail || !validateEmail(userEmail)) {
            return res.status(400).json({ error: 'E-mail inválido' });
        }

        if (!productName || !productUrl || !targetPrice) {
            return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
        }

        if (parseFloat(targetPrice) <= 0) {
            return res.status(400).json({ error: 'Preço alvo deve ser maior que zero' });
        }

        const result = await priceMonitorService.addMonitor({
            userEmail,
            productName,
            productUrl,
            currentPrice,
            targetPrice,
            productImage
        });

        res.status(201).json({
            success: true,
            message: 'Produto adicionado ao monitoramento',
            monitorId: result.id
        });
    } catch (error) {
        console.error('❌ Erro ao adicionar monitor:', error);
        console.error('Detalhes do erro:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Erro ao adicionar produto ao monitoramento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET - Listar produtos monitorados por e-mail
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: 'E-mail inválido ou não fornecido' });
        }

        const monitors = await priceMonitorService.getMonitorsByEmail(email);

        res.json({
            success: true,
            total: monitors.length,
            monitors
        });
    } catch (error) {
        console.error('Erro ao buscar monitors:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos monitorados' });
    }
});

// DELETE - Remover monitoramento
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID do monitor não fornecido' });
        }

        await priceMonitorService.removeMonitor(id);

        res.json({
            success: true,
            message: 'Monitoramento removido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao remover monitor:', error);
        res.status(500).json({ error: 'Erro ao remover monitoramento' });
    }
});

// PUT - Atualizar preço alvo ou preço atual (para testes)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetPrice, currentPrice } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID do monitor não fornecido' });
        }

        // Se vier currentPrice, atualizar o preço atual (para testes)
        if (currentPrice !== undefined) {
            if (parseFloat(currentPrice) < 0) {
                return res.status(400).json({ error: 'Preço atual inválido' });
            }
            await priceMonitorService.updateCurrentPriceDirectly(id, currentPrice);
            
            return res.json({
                success: true,
                message: 'Preço atual atualizado com sucesso'
            });
        }

        // Se vier targetPrice, atualizar o preço alvo
        if (targetPrice !== undefined) {
            if (parseFloat(targetPrice) <= 0) {
                return res.status(400).json({ error: 'Preço alvo inválido' });
            }
            await priceMonitorService.updateTargetPrice(id, targetPrice);

            return res.json({
                success: true,
                message: 'Preço alvo atualizado com sucesso'
            });
        }

        return res.status(400).json({ error: 'Nenhum campo para atualizar fornecido' });
    } catch (error) {
        console.error('Erro ao atualizar monitor:', error);
        res.status(500).json({ error: 'Erro ao atualizar monitor' });
    }
});

// GET - Desinscrever do monitoramento (link no e-mail)
router.get('/unsubscribe/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await priceMonitorService.deactivateMonitor(id);

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Monitoramento Cancelado</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    }
                    h1 { color: #28a745; }
                    p { color: #666; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 30px;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Monitoramento Cancelado</h1>
                    <p>Você não receberá mais notificações sobre este produto.</p>
                    <a href="/">Voltar para o site</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro ao desinscrever:', error);
        res.status(500).send('Erro ao processar cancelamento');
    }
});

// POST - Verificar preço de um produto específico (manual)
router.post('/check/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const monitors = await priceMonitorService.getAllActiveMonitors();
        const monitor = monitors.find(m => m.id === id);

        if (!monitor) {
            return res.status(404).json({ error: 'Monitor não encontrado' });
        }

        const result = await priceCheckerService.checkSingleMonitor(monitor);

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Erro ao verificar preço:', error);
        res.status(500).json({ error: 'Erro ao verificar preço' });
    }
});

// POST - Verificar preço de teste (sem scraping, apenas verifica se atingiu meta e envia e-mail)
router.post('/check-test/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const monitors = await priceMonitorService.getAllActiveMonitors();
        const monitor = monitors.find(m => m.id === id);

        if (!monitor) {
            return res.status(404).json({ error: 'Monitor não encontrado' });
        }

        console.log(`🧪 [TESTE] Verificando monitor: ${monitor.productName}`);
        
        // Para testes, não fazemos scraping, usamos o preço atual já salvo
        const currentPrice = monitor.currentPrice || 0;
        const targetPrice = monitor.targetPrice || 0;

        console.log(`🧪 Preço atual: R$ ${currentPrice.toFixed(2)} | Preço alvo: R$ ${targetPrice.toFixed(2)}`);

        // Verificar se atingiu o preço alvo e ainda não foi notificado
        if (!monitor.notified && currentPrice > 0 && currentPrice <= targetPrice) {
            console.log(`🎯 Preço alvo atingido! Enviando e-mail...`);
            
            // Enviar notificação por e-mail
            const emailData = {
                productName: monitor.productName,
                productImage: monitor.productImage,
                currentPrice: `R$ ${currentPrice.toFixed(2).replace('.', ',')}`,
                targetPrice: `R$ ${targetPrice.toFixed(2).replace('.', ',')}`,
                productUrl: monitor.productUrl,
                monitorId: monitor.id
            };

            const { sendEmail } = require('../config/resend.config');
            await sendEmail(monitor.userEmail, 'priceAlert', emailData);
            
            // Marcar como notificado
            await priceMonitorService.markAsNotified(monitor.id);

            return res.json({
                success: true,
                result: {
                    checked: true,
                    notified: true,
                    currentPrice,
                    targetPrice
                }
            });
        }

        res.json({
            success: true,
            result: {
                checked: true,
                notified: false,
                currentPrice,
                targetPrice,
                message: currentPrice > targetPrice ? 'Preço ainda não atingiu a meta' : 'Já foi notificado anteriormente'
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar preço de teste:', error);
        res.status(500).json({ 
            error: 'Erro ao verificar preço de teste',
            details: error.message 
        });
    }
});

module.exports = router;

