const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const scraperRoutes = require('./routes/scraper.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api', scraperRoutes);

// Rota principal retorna o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Vercel serverless
if (process.env.VERCEL) {
    module.exports = app;
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}
