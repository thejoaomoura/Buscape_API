const admin = require('firebase-admin');
require('dotenv').config();

let db;

const initializeFirebase = () => {
    try {
        // Verificar se já foi inicializado
        if (admin.apps.length > 0) {
            db = admin.firestore();
            return db;
        }

        // Validar variáveis de ambiente
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error('FIREBASE_PROJECT_ID não está configurado');
        }
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            throw new Error('FIREBASE_PRIVATE_KEY não está configurado');
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('FIREBASE_CLIENT_EMAIL não está configurado');
        }

        // Processar a chave privada - suporta diferentes formatos
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Se a chave começar com aspas, remover
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        
        // Substituir \n literais por quebras de linha reais
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Validar se a chave tem o formato correto
        if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
            throw new Error('FIREBASE_PRIVATE_KEY está em formato inválido. Deve incluir BEGIN e END PRIVATE KEY');
        }

        // Configuração do Firebase Admin
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        db = admin.firestore();
        console.log('✅ Firebase inicializado com sucesso');
        return db;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error.message);
        console.error('Detalhes:', {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        });
        throw error;
    }
};

const getFirestore = () => {
    if (!db) {
        return initializeFirebase();
    }
    return db;
};

module.exports = {
    initializeFirebase,
    getFirestore,
    admin
};

