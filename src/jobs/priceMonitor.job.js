const cron = require('node-cron');
const priceCheckerService = require('../services/priceChecker.service');
const { initializeFirebase } = require('../config/firebase.config');

class PriceMonitorJob {
    constructor() {
        this.job = null;
        this.isRunning = false;
    }

    // Inicia o cron job
    start() {
        try {
            // Inicializar Firebase antes de começar
            initializeFirebase();

            // Executar a cada 6 horas: 0 */6 * * *
            // Para testes, use: */5 * * * * (a cada 5 minutos)
            this.job = cron.schedule('0 */6 * * *', async () => {
                if (this.isRunning) {
                    console.log('⚠️ Verificação anterior ainda em andamento, pulando...');
                    return;
                }

                this.isRunning = true;
                console.log(`\n🕐 [${new Date().toLocaleString('pt-BR')}] Iniciando verificação automática de preços...`);
                
                try {
                    const results = await priceCheckerService.checkAllPrices();
                    console.log(`✅ Verificação concluída:`, results);
                } catch (error) {
                    console.error('❌ Erro durante verificação automática:', error);
                } finally {
                    this.isRunning = false;
                }
            });

            console.log('✅ Cron job de monitoramento de preços iniciado (executa a cada 6 horas)');
            
            // Executar uma verificação inicial após 1 minuto
            setTimeout(async () => {
                if (!this.isRunning) {
                    console.log('🚀 Executando verificação inicial...');
                    this.isRunning = true;
                    try {
                        await priceCheckerService.checkAllPrices();
                    } catch (error) {
                        console.error('❌ Erro na verificação inicial:', error);
                    } finally {
                        this.isRunning = false;
                    }
                }
            }, 60000); // 1 minuto

        } catch (error) {
            console.error('❌ Erro ao iniciar cron job:', error);
        }
    }

    // Para o cron job
    stop() {
        if (this.job) {
            this.job.stop();
            console.log('🛑 Cron job de monitoramento parado');
        }
    }

    // Executa verificação manual
    async runManual() {
        try {
            console.log('🔧 Executando verificação manual...');
            const results = await priceCheckerService.checkAllPrices();
            return results;
        } catch (error) {
            console.error('❌ Erro na verificação manual:', error);
            throw error;
        }
    }
}

module.exports = new PriceMonitorJob();

