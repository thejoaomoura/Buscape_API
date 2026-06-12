const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/config');

// Rota para buscar produtos
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
        }

        const response = await axios.get(`${config.baseUrl}?q=${encodeURIComponent(q)}`);
        const $ = cheerio.load(response.data);
        
        const products = [];

        // Normaliza espaços/quebras de linha do texto extraído
        const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

        // Seletor para os cartões de produto. Os atributos data-testid do Buscapé
        // são estáveis; as classes CSS (hashadas) mudam a cada build, então
        // baseamos toda a extração nos data-testid.
        $('[data-testid="product-card"]').each((i, element) => {
            const card = $(element);

            const name = clean(card.find('[data-testid="product-card::name"]').text());
            const price = clean(card.find('[data-testid="product-card::price"]').text());
            const rating = clean(card.find('[data-testid="product-card::rating"]').text());
            const link = card.find('a[data-testid="product-card::card"]').attr('href')
                || card.find('a').first().attr('href');

            // Extraindo tags superiores (quando existirem)
            const tags = [];
            card.find('[data-testid="product-card::tags"] span').each((_, tag) => {
                const t = clean($(tag).text());
                if (t) tags.push(t);
            });

            // Extraindo imagem
            const image = card.find('[data-testid="product-card::image"] img').attr('src')
                || card.find('img').first().attr('src');

            // Extraindo informações de parcelamento
            const installment = clean(card.find('[data-testid="product-card::installment"]').text());

            products.push({
                name,
                price,
                rating,
                link: link
                    ? (link.startsWith('http') ? link : `https://www.buscape.com.br${link}`)
                    : null,
                tags,
                image,
                installment
            });
        });

        res.json({ 
            query: q,
            total: products.length,
            products 
        });
    } catch (error) {
        console.error('Erro ao fazer scraping:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar produtos',
            details: error.message 
        });
    }
});

// Rota para obter detalhes de um produto específico
router.get('/product', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL do produto é obrigatória' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 15000
        });
        const $ = cheerio.load(response.data);

        const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
        // Extrai o primeiro valor monetário (ex.: "R$ 2.899,90") de um texto
        // que pode conter informações concatenadas (à vista, parcelamento, etc.)
        const firstPrice = (text) => {
            const match = (text || '').match(/R\$\s*[\d.,]+/);
            return match ? match[0].replace(/\s+/g, ' ') : '';
        };

        // Extraindo detalhes específicos do produto (data-testid são estáveis)
        const productDetails = {
            name: clean($('[data-testid="HeroTitleSection"] h1').text()) || clean($('h1').first().text()),
            price: firstPrice($('[data-testid="offer-price"]').first().text()),
            description: clean($('meta[name="description"]').attr('content')),
            specifications: {},
            merchants: []
        };

        // Extraindo especificações do produto (tabela de atributos)
        $('[data-testid="detailsSection-masonry"] tr').each((_, row) => {
            const label = clean($(row).find('th').text());
            const value = clean($(row).find('td').text());
            if (label && value) {
                productDetails.specifications[label] = value;
            }
        });

        // Extraindo lista de vendedores/ofertas
        $('[data-testid="offer-card-wrapper"]').each((_, merchant) => {
            const merchantInfo = {
                name: clean($(merchant).find('[data-testid="offer-merchant"]').text()),
                price: firstPrice($(merchant).find('[data-testid="offer-price"]').text())
            };
            if (merchantInfo.name || merchantInfo.price) {
                productDetails.merchants.push(merchantInfo);
            }
        });

        res.json(productDetails);
    } catch (error) {
        console.error('Erro ao obter detalhes do produto:', error);
        res.status(500).json({ 
            error: 'Erro ao obter detalhes do produto',
            details: error.message 
        });
    }
});

module.exports = router;
