const axios = require('axios');
const cheerio = require('cheerio');
const { sendEmail } = require('../config/resend.config');
const priceMonitorService = require('./priceMonitor.service');
const config = require('../config/config');

class PriceCheckerService {
    constructor() {
        this.baseUrl = config.baseUrl;
    }

    // Extrai o preço numérico de uma string
    parsePrice(priceString) {
        if (!priceString) return 0;
        const cleanPrice = priceString.replace(/[^0-9,]/g, '').replace(',', '.');
        return parseFloat(cleanPrice) || 0;
    }

    // Busca o preço atual do produto fazendo scraping
    async fetchCurrentPrice(productUrl, productName = '') {
        try {
            // Se a URL for do Buscapé, fazer scraping direto
            if (productUrl && productUrl.includes('buscape.com.br')) {
                const response = await axios.get(productUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    timeout: 10000
                });
                const $ = cheerio.load(response.data);
                
                // Tentar múltiplos seletores para encontrar o preço
                let price = null;
                
                // Seletor 1: data-testid
                price = $('[data-testid="product-card::price"]').first().text().trim();
                
                // Seletor 2: classe ProductCard
                if (!price) {
                    price = $('.ProductCard_ProductCard_Price__text').first().text().trim();
                }
                
                // Seletor 3: buscar qualquer elemento com "R$"
                if (!price) {
                    $('*').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text.includes('R$') && text.length < 30) {
                            const matches = text.match(/R\$\s*[\d.,]+/);
                            if (matches) {
                                price = matches[0];
                                return false; // break
                            }
                        }
                    });
                }

                const parsedPrice = this.parsePrice(price);
                if (parsedPrice > 0) {
                    return parsedPrice;
                }
            }
            
            // Se não conseguiu buscar pela URL, tentar buscar pelo nome do produto
            if (productName && productName.length > 3) {
                console.log(`⚠️ Tentando buscar preço pela pesquisa: ${productName}`);
                
                const searchUrl = `${this.baseUrl}?q=${encodeURIComponent(productName)}`;
                const response = await axios.get(searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000
                });
                const $ = cheerio.load(response.data);
                
                // Pegar o primeiro produto da lista
                const firstProductPrice = $('.Hits_ProductCard__Bonl_').first()
                    .find('[data-testid="product-card::price"]').text().trim();
                
                const parsedPrice = this.parsePrice(firstProductPrice);
                if (parsedPrice > 0) {
                    console.log(`✅ Preço encontrado pela pesquisa: R$ ${parsedPrice}`);
                    return parsedPrice;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('❌ Erro ao buscar preço:', error.message);
            return 0;
        }
    }

    // Compara o preço atual com o preço alvo
    compareWithTarget(currentPrice, targetPrice) {
        return currentPrice > 0 && currentPrice <= targetPrice;
    }

    // Envia notificação por e-mail
    async sendEmailNotification(monitor) {
        try {
            const emailData = {
                productName: monitor.productName,
                productImage: monitor.productImage,
                currentPrice: `R$ ${monitor.currentPrice.toFixed(2).replace('.', ',')}`,
                targetPrice: `R$ ${monitor.targetPrice.toFixed(2).replace('.', ',')}`,
                productUrl: monitor.productUrl,
                monitorId: monitor.id
            };

            await sendEmail(monitor.userEmail, 'priceAlert', emailData);
            console.log(`✅ Notificação enviada para ${monitor.userEmail}`);
            
            // Marcar como notificado
            await priceMonitorService.markAsNotified(monitor.id);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao enviar notificação:', error);
            throw error;
        }
    }

    // Verifica um monitor específico
    async checkSingleMonitor(monitor) {
        try {
            console.log(`🔍 Verificando: ${monitor.productName} (ID: ${monitor.id})`);
            
            // Passar também o nome do produto como fallback
            const currentPrice = await this.fetchCurrentPrice(monitor.productUrl, monitor.productName);
            
            if (currentPrice === 0) {
                console.log(`⚠️ Não foi possível obter o preço para ${monitor.productName}`);
                return { checked: false, error: 'Não foi possível obter o preço atual' };
            }

            // Atualizar preço atual no banco
            await priceMonitorService.updateCurrentPrice(monitor.id, currentPrice);

            // Verificar se atingiu o preço alvo e ainda não foi notificado
            if (!monitor.notified && this.compareWithTarget(currentPrice, monitor.targetPrice)) {
                console.log(`🎯 Preço alvo atingido para ${monitor.productName}!`);
                await this.sendEmailNotification({
                    ...monitor,
                    currentPrice
                });
                return { checked: true, notified: true };
            }

            return { checked: true, notified: false };
        } catch (error) {
            console.error(`❌ Erro ao verificar monitor ${monitor.id}:`, error);
            return { checked: false, error: error.message };
        }
    }

    // Verifica todos os monitores ativos
    async checkAllPrices() {
        try {
            console.log('🚀 Iniciando verificação de preços...');
            const monitors = await priceMonitorService.getAllActiveMonitors();
            
            console.log(`📊 Total de monitores ativos: ${monitors.length}`);
            
            const results = {
                total: monitors.length,
                checked: 0,
                notified: 0,
                errors: 0
            };

            for (const monitor of monitors) {
                const result = await this.checkSingleMonitor(monitor);
                
                if (result.checked) results.checked++;
                if (result.notified) results.notified++;
                if (result.error) results.errors++;

                // Pequeno delay entre requisições para não sobrecarregar o servidor
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('✅ Verificação concluída:', results);
            return results;
        } catch (error) {
            console.error('❌ Erro ao verificar todos os preços:', error);
            throw error;
        }
    }
}

module.exports = new PriceCheckerService();

