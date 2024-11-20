require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    baseUrl: 'https://www.buscape.com.br/search',
    corsOptions: {
        origin: '*', // Em produção, especifique os domínios permitidos
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
