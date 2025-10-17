const { getFirestore } = require('../config/firebase.config');

class PriceMonitorService {
    constructor() {
        this.collection = 'monitoredProducts';
    }

    async addMonitor(monitorData) {
        try {
            const db = getFirestore();
            const { userEmail, productName, productUrl, currentPrice, targetPrice, productImage } = monitorData;

            // Validações
            if (!userEmail || !productName || !productUrl || !targetPrice) {
                throw new Error('Dados obrigatórios ausentes');
            }

            const docRef = await db.collection(this.collection).add({
                userEmail: userEmail.toLowerCase(),
                productName,
                productUrl,
                currentPrice: parseFloat(currentPrice) || 0,
                targetPrice: parseFloat(targetPrice),
                productImage: productImage || '',
                createdAt: new Date(),
                lastChecked: new Date(),
                notified: false,
                active: true
            });

            console.log(`✅ Monitor adicionado com ID: ${docRef.id}`);
            return { id: docRef.id, success: true };
        } catch (error) {
            console.error('❌ Erro ao adicionar monitor:', error);
            throw error;
        }
    }

    async removeMonitor(monitorId) {
        try {
            const db = getFirestore();
            await db.collection(this.collection).doc(monitorId).delete();
            console.log(`✅ Monitor ${monitorId} removido`);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao remover monitor:', error);
            throw error;
        }
    }

    async getMonitorsByEmail(email) {
        try {
            const db = getFirestore();
            const snapshot = await db.collection(this.collection)
                .where('userEmail', '==', email.toLowerCase())
                .where('active', '==', true)
                .get();

            const monitors = [];
            snapshot.forEach(doc => {
                monitors.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return monitors;
        } catch (error) {
            console.error('❌ Erro ao buscar monitors:', error);
            throw error;
        }
    }

    async updateTargetPrice(monitorId, newTargetPrice) {
        try {
            const db = getFirestore();
            await db.collection(this.collection).doc(monitorId).update({
                targetPrice: parseFloat(newTargetPrice),
                notified: false // Reset notificação para enviar novamente se atingir o novo preço
            });
            console.log(`✅ Preço alvo atualizado para monitor ${monitorId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao atualizar preço alvo:', error);
            throw error;
        }
    }

    async updateCurrentPrice(monitorId, newPrice) {
        try {
            const db = getFirestore();
            await db.collection(this.collection).doc(monitorId).update({
                currentPrice: parseFloat(newPrice),
                lastChecked: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao atualizar preço atual:', error);
            throw error;
        }
    }

    async markAsNotified(monitorId) {
        try {
            const db = getFirestore();
            await db.collection(this.collection).doc(monitorId).update({
                notified: true,
                notifiedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao marcar como notificado:', error);
            throw error;
        }
    }

    async getAllActiveMonitors() {
        try {
            const db = getFirestore();
            const snapshot = await db.collection(this.collection)
                .where('active', '==', true)
                .get();

            const monitors = [];
            snapshot.forEach(doc => {
                monitors.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return monitors;
        } catch (error) {
            console.error('❌ Erro ao buscar todos os monitors:', error);
            throw error;
        }
    }

    async deactivateMonitor(monitorId) {
        try {
            const db = getFirestore();
            await db.collection(this.collection).doc(monitorId).update({
                active: false,
                deactivatedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao desativar monitor:', error);
            throw error;
        }
    }
}

module.exports = new PriceMonitorService();

