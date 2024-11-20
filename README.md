# Buscapé API Webscraping

API para realizar webscraping do site Buscapé.

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo .env baseado no exemplo e configure as variáveis de ambiente

## Executando o projeto

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Endpoints

### 1. GET /api/search
Busca produtos no Buscapé

**Parâmetros:**
- q (obrigatório): termo de busca

**Exemplo:**
```
GET /api/search?q=notebook
```

**Resposta:**
```json
{
    "query": "notebook",
    "total": 30,
    "products": [
        {
            "name": "Nome do Produto",
            "price": "R$ 1.999,00",
            "rating": "4.5 (100)",
            "link": "https://www.buscape.com.br/produto",
            "tags": ["Indica", "Oferta"],
            "image": "url-da-imagem",
            "installment": "até 10x de R$ 199,90"
        }
    ]
}
```

### 2. GET /api/product
Obtém detalhes específicos de um produto

**Parâmetros:**
- url (obrigatório): URL completa do produto no Buscapé

**Exemplo:**
```
GET /api/product?url=https://www.buscape.com.br/produto
```

**Resposta:**
```json
{
    "name": "Nome do Produto",
    "price": "R$ 1.999,00",
    "description": "Descrição do produto",
    "specifications": {
        "Marca": "Valor",
        "Modelo": "Valor"
    },
    "merchants": [
        {
            "name": "Nome da Loja",
            "price": "R$ 1.999,00",
            "rating": "4.5",
            "shipping": "Frete Grátis"
        }
    ]
}
```

## Tecnologias utilizadas

- Node.js
- Express
- Axios
- Cheerio
- CORS
