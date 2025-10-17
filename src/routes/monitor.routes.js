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
        console.error('Erro ao adicionar monitor:', error);
        res.status(500).json({ error: 'Erro ao adicionar produto ao monitoramento' });
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

// PUT - Atualizar preço alvo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetPrice } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID do monitor não fornecido' });
        }

        if (!targetPrice || parseFloat(targetPrice) <= 0) {
            return res.status(400).json({ error: 'Preço alvo inválido' });
        }

        await priceMonitorService.updateTargetPrice(id, targetPrice);

        res.json({
            success: true,
            message: 'Preço alvo atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar preço alvo:', error);
        res.status(500).json({ error: 'Erro ao atualizar preço alvo' });
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

module.exports = router;

