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

        // Configuração do Firebase Admin
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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

