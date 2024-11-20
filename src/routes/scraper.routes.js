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

        // Seletor para os cartões de produto
        $('.Hits_ProductCard__Bonl_').each((i, element) => {
            const productCard = $(element).find('.ProductCard_ProductCard__WWKKW');
            
            // Extraindo informações do produto
            const name = productCard.find('[data-testid="product-card::name"]').text().trim();
            const price = productCard.find('[data-testid="product-card::price"]').text().trim();
            const rating = productCard.find('.ProductCard_ProductCard_Rating__kCx7o').text().trim();
            const link = productCard.find('.ProductCard_ProductCard_Inner__gapsh').attr('href');
            
            // Extraindo tags superiores
            const tags = [];
            productCard.find('[data-testid="product-card::tags"] .Pill_Pill__RTFcT').each((_, tag) => {
                tags.push($(tag).text().trim());
            });

            // Extraindo imagem
            const image = productCard.find('.ProductCard_ProductCard_Image__4v1sa img').attr('src');

            // Extraindo informações de parcelamento
            const installment = productCard.find('[data-testid="product-card::installment"]').text().trim();
            
            products.push({
                name,
                price,
                rating,
                link: link ? `https://www.buscape.com.br${link}` : null,
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

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Extraindo detalhes específicos do produto
        const productDetails = {
            name: $('[data-testid="product-card::name"]').text().trim(),
            price: $('[data-testid="product-card::price"]').text().trim(),
            description: $('.ProductDescription_ProductDescription__7UtBN').text().trim(),
            specifications: {},
            merchants: []
        };

        // Extraindo especificações do produto
        $('.SpecificationTable_SpecificationTable__Row__gfWNr').each((_, row) => {
            const label = $(row).find('.SpecificationTable_SpecificationTable__Label__D3BVE').text().trim();
            const value = $(row).find('.SpecificationTable_SpecificationTable__Value__yFEsr').text().trim();
            if (label && value) {
                productDetails.specifications[label] = value;
            }
        });

        // Extraindo lista de vendedores
        $('.Offers_Offers__Item__Ow4EG').each((_, merchant) => {
            const merchantInfo = {
                name: $(merchant).find('.Offers_Offers__Merchant__Name__YM8V3').text().trim(),
                price: $(merchant).find('.Offers_Offers__Price__Ow4EG').text().trim(),
                rating: $(merchant).find('.Offers_Offers__Rating__YM8V3').text().trim(),
                shipping: $(merchant).find('.Offers_Offers__Shipping__YM8V3').text().trim()
            };
            productDetails.merchants.push(merchantInfo);
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
